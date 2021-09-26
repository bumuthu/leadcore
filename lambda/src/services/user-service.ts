import { Types } from "mongoose";
import { db } from "src/models/db";
import PricingModel from "src/models/db/pricing.model";
import RoleModel from "src/models/db/role.model";
import TeamModel from "src/models/db/team.model";
import UserModel from "src/models/db/user.model";
import { ingress } from "src/models/ingress";
import { ErrorCode, UserSignUpError } from "src/utils/exceptions";

export class UserService {

    private userId: Types.ObjectId;
    private teamId: Types.ObjectId;

    constructor() { }

    async createNewUser(newUser: ingress.SignUpInput) {
        let userInserted: boolean = false;
        let teamInserted: boolean = false;

        try {
            const basicPricing = await PricingModel.findOne({ name: "BASIC" });
            const agentRole = await RoleModel.findOne({ name: "AGENT" });

            const teamRes = await TeamModel.create({
                users: [],
                pricing: "BASIC",
                type: "INDIVIDUAL",
                customers: []
            });
            this.teamId = teamRes['_id'];

            let newUserDB: db.User = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                linkedinUrl: newUser.linkedinUrl,
                activityRecords: [],
                notifications: [],
                teams: [{
                    team: Types.ObjectId(teamRes['_id']),
                    role: Types.ObjectId(agentRole['_id']),
                    campaigns: []
                }]
            } as db.User;

            const userRes = await UserModel.create(newUserDB);
            userInserted = true;
            this.userId = userRes['_id'];

            console.log("New User DB:", newUserDB);
            console.log("User Res", userRes);

            await TeamModel.findByIdAndUpdate(teamRes['_id'],
                { users: [Types.ObjectId(userRes['_id'])] }, { new: true });
            teamInserted = true;

            return userRes
        } catch (e) {
            console.error(e);
            await this.deleteNewUser();

            if (!userInserted) {
                throw new UserSignUpError("Error while user insertion", ErrorCode.DATABASE_OPERATION_ERROR);
            } else if (!teamInserted) {
                throw new UserSignUpError("Error while team insertion", ErrorCode.DATABASE_OPERATION_ERROR);
            }
        }
    }

    async deleteNewUser() {
        try {
            if (this.userId) await UserModel.deleteOne({ _id: this.userId });
            if (this.teamId) await TeamModel.deleteOne({ _id: this.teamId });
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