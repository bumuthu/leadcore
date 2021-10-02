import { Types } from "mongoose";
import { db } from "src/models/db";
import TeamModel from "src/models/db/team.model";
import UserModel from "src/models/db/user.model";
import { ingress } from "src/models/ingress";
import { ErrorCode, UserSignUpError } from "src/utils/exceptions";
import { getDatabaseKey } from "src/utils/utils";

export class UserService {

    constructor() { }

    async createNewUser(newUser: ingress.SignUpInput) {
        let teamId: string;
        let userId: string;
        try {
            const teamResponse = await this.insertNewTeam();
            teamId = getDatabaseKey(teamResponse);

            const userResponse = await this.insertNewUser(newUser, teamId)
            userId = getDatabaseKey(userResponse);

            await this.updateTeam(userId, { users: [Types.ObjectId(userId)] })

            console.log("New User DB Response:", userResponse);

            return userResponse
        } catch (e) {
            console.error(e);
            
            await this.deleteNewUser(teamId, userId);
            throw new UserSignUpError("Error while user insertion", ErrorCode.DATABASE_OPERATION_ERROR);
        }
    }

    async insertNewTeam() {
        const newTeam: db.Team = {
            users: [],
            pricing: "BASIC",
            type: "INDIVIDUAL",
            customers: []
        } as db.Team;

        return await TeamModel.create(newTeam)
    }

    async updateTeam(teamId: string, update: any) {
        return await TeamModel.findByIdAndUpdate(teamId, update, { new: true });
    }

    async insertNewUser(newUser: ingress.SignUpInput, teamId: string) {
        const newUserDB: db.User = {
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
        } as db.User;

        return await UserModel.create(newUserDB);
    }

    async deleteNewUser(teamId?: string, userId?: string) {
        try {
            if (userId) await UserModel.deleteOne({ _id: Types.ObjectId(userId) });
            if (teamId) await TeamModel.deleteOne({ _id: Types.ObjectId(teamId) });
        } catch (err) {
            throw new UserSignUpError("Error while user/team reverting", ErrorCode.DATABASE_OPERATION_ERROR);
        }
    }

    async updateUserWithLinkedinToken(email: string, linkedinTokenRes: any) {
        try {
            return await UserModel.findOneAndUpdate(
                { email },
                {
                    linkedinToken: {
                        accessToken: linkedinTokenRes.data.access_token,
                        expiresIn: linkedinTokenRes.data.expires_in,
                        authorizedAt: new Date()
                    }
                },
                { new: true }
            )
        } catch (err) {
            throw new UserSignUpError("Error while updating user", ErrorCode.DATABASE_OPERATION_ERROR);
        }
    }
}