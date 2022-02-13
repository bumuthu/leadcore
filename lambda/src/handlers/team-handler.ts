import 'source-map-support/register';
import TeamDBModel, { TeamDocument } from 'src/models/db/team.model';
import { DataNotFoundError, NotAuthorizedError } from 'src/utils/exceptions';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import { entity } from 'src/models/entities';
import { UserService } from 'src/services/user-service';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields, validationWithEnum } from 'src/validation/utils';
import { PricingType, TeamType } from 'src/models/common';


// TeamRetrievalHandler
export const getTeamById = async (event, _context) => {
    try {
        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);

        const teamId = event.pathParameters.teamId;
        userService.validateUserWithTeamId(user, teamId)

        const team = await TeamDBModel.findById(teamId).populate('users');
        if (!team) throw new DataNotFoundError("Team not fond in the system");

        return respondSuccess(team)

    } catch (err) {
        return respondError(err)
    }
}


// TeamUpdateHandler
export const updateTeamById = async (event, _context) => {
    try {
        const teamModificationReq: ingress.TeamModificationRequest = JSON.parse(event.body) as ingress.TeamModificationRequest;
        const teamId = event.pathParameters.teamId;

        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);
        userService.validateUserWithTeamId(user, teamId)

        validateUnnecessaryFields(teamModificationReq, ["pricing", "users", "customers"]);
        validationWithEnum(PricingType, teamModificationReq, "pricing");

        const teamUpdated: any = { ...teamModificationReq };
        const team = await TeamDBModel.findByIdAndUpdate(teamId, teamUpdated, { new: true });
        return respondSuccess(team)
    } catch (err) {
        return respondError(err)
    }
}


// NewTeamHandler
export const createTeam = async (event, _context) => {
    try {
        const teamCreateRequest: ingress.TeamCreateRequest = JSON.parse(event.body) as ingress.TeamCreateRequest;

        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);

        validateNotNullFields(teamCreateRequest, ["pricing", "type"]);
        validateUnnecessaryFields(teamCreateRequest, ["pricing", "type", "users", "customers"]);
        validationWithEnum(PricingType, teamCreateRequest, "pricing");
        validationWithEnum(TeamType, teamCreateRequest, "type");

        if (!teamCreateRequest.users) teamCreateRequest.users = [];
        if (!teamCreateRequest.users.includes(UserService.getEntityKey(user))) teamCreateRequest.users.push(UserService.getEntityKey(user));

        if (!teamCreateRequest.customers) teamCreateRequest.customers = [];

        const team = await TeamDBModel.create(teamCreateRequest);
        return respondSuccess(team)
    } catch (err) {
        return respondError(err)
    }
}