import { Types } from "mongoose";
import jwt_decode from "jwt-decode";
import { entity } from "src/models/entities";
import TeamDBModel from "src/models/db/team.model";
import UserDBModel from "src/models/db/user.model";
import { ingress } from "src/models/ingress";
import { AccessTokenNullError, DataNotFoundError, ErrorCode, NotAuthorizedError, UserSignUpError } from "src/utils/exceptions";
import { EntityService } from "./entity.service";
import { TeamService } from "./team.service";

export class UserService extends EntityService {

    private teamId: string;
    private userId: string;

    constructor() {
        super();
    }

    async getUserByToken(accessToken: string): Promise<entity.User> {
        await this.before();

        if (!accessToken) throw new AccessTokenNullError("Null access token found");

        const decodedUser: any = jwt_decode(accessToken);
        console.log("Decoded user:", decodedUser);

        const user: entity.User = await UserDBModel.findOne({ cognitoUserSub: decodedUser.sub });
        if (!user) throw new DataNotFoundError("User not found in the system");

        return user;
    }

    async createNewUser(newUser: ingress.SignUpInput): Promise<entity.User> {
        await this.before();

        try {
            const teamEntry: entity.Team = await this.insertNewTeam();
            console.log("TEAM KEY TYPE before", typeof teamEntry._id, teamEntry._id);
            this.teamId = TeamService.getEntityKey(teamEntry);
            console.log("TEAM KEY TYPE after", typeof this.teamId, this.teamId);

            const userEntry: entity.User = await this.insertNewUser(newUser, this.teamId);
            this.userId = UserService.getEntityKey(userEntry);

            await this.updateTeam(this.teamId, { users: [Types.ObjectId(this.userId)] })

            console.log("New User DB Response:", userEntry);

            return userEntry
        } catch (e) {
            console.error(e);

            await this.deleteNewUser();
            throw new UserSignUpError("Error while user insertion", ErrorCode.DATABASE_OPERATION_ERROR);
        }
    }

    async insertNewTeam(): Promise<entity.Team> {
        await this.before();

        const newTeam: entity.Team = {
            users: [],
            pricing: "BASIC",
            type: "INDIVIDUAL",
            customers: []
        } as entity.Team;

        return TeamDBModel.create(newTeam);
    }

    async updateTeam(teamId: string, update: any): Promise<entity.Team> {
        await this.before();

        return TeamDBModel.findByIdAndUpdate(teamId, update, { new: true });
    }

    async insertNewUser(newUser: ingress.SignUpInput, teamId: string): Promise<entity.User> {
        await this.before();

        const newUserDB: entity.User = {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            linkedinUrl: newUser.linkedinUrl,
            activityRecords: [],
            notifications: [],
            teams: [{
                team: Types.ObjectId(teamId),
                role: "AGENT",
                campaigns: []
            }]
        } as entity.User;

        return UserDBModel.create(newUserDB);
    }

    async updateUser(userId: string, update: any): Promise<entity.User> {
        await this.before();

        return UserDBModel.findByIdAndUpdate(userId, update, { new: true });
    }

    async deleteNewUser(): Promise<void> {
        await this.before();

        try {
            console.log("UserId:", this.userId, "TeamId:", this.teamId);

            if (this.userId) await UserDBModel.deleteOne({ _id: Types.ObjectId(this.userId) });
            if (this.teamId) await TeamDBModel.deleteOne({ _id: Types.ObjectId(this.teamId) });
        } catch (err) {
            throw new UserSignUpError("Error while user/team reverting", ErrorCode.DATABASE_OPERATION_ERROR);
        }
    }

    // async updateUserWithLinkedinToken(email: string, linkedinTokenRes: any) {
    //     try {
    //         return await UserDBModel.findOneAndUpdate(
    //             { email },
    //             {
    //                 linkedinToken: {
    //                     accessToken: linkedinTokenRes.data.access_token,
    //                     expiresIn: linkedinTokenRes.data.expires_in,
    //                     authorizedAt: new Date()
    //                 }
    //             },
    //             { new: true }
    //         )
    //     } catch (err) {
    //         throw new UserSignUpError("Error while updating user", ErrorCode.DATABASE_OPERATION_ERROR);
    //     }
    // }

    async validateUserWithTeamId(user: entity.User, teamId: string) {
        if (user.teams.filter(team => team.team.toString() == teamId.toString()).length == 0) {
            throw new NotAuthorizedError("You are not authorized to access the team")
        }
    }
}