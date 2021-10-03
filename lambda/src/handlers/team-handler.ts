import 'source-map-support/register';
import TeamModel from 'src/models/db/team.model';
import { DataNotFoundError, NotAuthorizedError } from 'src/utils/exceptions';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import { db } from 'src/models/db';
import { UserService } from 'src/services/user-service';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields, validationWithEnum } from 'src/validation/utils';
import { getDatabaseKey } from 'src/utils/utils';
import { PricingType, TeamType } from 'src/models/common';


// TeamRetrievalHandler
export const getTeamById = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);

        const teamId = event.pathParameters.teamId;
        if (user.teams.filter(team => team.team == teamId).length == 0) throw new NotAuthorizedError("You are not authorized to access the team")

        const team = await TeamModel.findById(teamId).populate('users');
        if (!team) throw new DataNotFoundError("Team not fond in the system");

        return respondSuccess(team)

    } catch (err) {
        return respondError(err)
    }
}


// TeamUpdateHandler
export const updateTeamById = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const teamModificationReq: ingress.TeamModificationRequest = JSON.parse(event.body) as ingress.TeamModificationRequest;

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);

        const teamId = event.pathParameters.teamId;
        if (user.teams.filter(team => team.team == teamId).length == 0) throw new NotAuthorizedError("You are not authorized to access the team")

        validateUnnecessaryFields(teamModificationReq, ["pricing", "users", "customers"]);
        validationWithEnum(PricingType, teamModificationReq, "pricing");

        const team = await TeamModel.findByIdAndUpdate(teamId, teamModificationReq, { new: true });
        return respondSuccess(team)
    } catch (err) {
        return respondError(err)
    }
}


// NewTeamHandler
export const createTeam = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const teamCreateRequest: ingress.TeamCreateRequest = JSON.parse(event.body) as ingress.TeamCreateRequest;

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);

        validateNotNullFields(teamCreateRequest, ["pricing", "type"]);
        validateUnnecessaryFields(teamCreateRequest, ["pricing", "type", "users", "customers"]);
        validateNotNullFields(teamCreateRequest, ["pricing", "type"]);
        validationWithEnum(PricingType, teamCreateRequest, "pricing");
        validationWithEnum(TeamType, teamCreateRequest, "type");

        if (!teamCreateRequest.users) teamCreateRequest.users = [];
        if (!teamCreateRequest.users.includes(getDatabaseKey(user))) teamCreateRequest.users.push(getDatabaseKey(user));
        
        if (!teamCreateRequest.customers) teamCreateRequest.customers = [];

        const team = await TeamModel.create(teamCreateRequest);
        return respondSuccess(team)
    } catch (err) {
        return respondError(err)
    }
}