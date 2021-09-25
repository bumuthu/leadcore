import { Types } from "mongoose";
import { db } from "src/models/db";
import PricingModel from "src/models/db/pricing.model";
import RoleModel from "src/models/db/role.model";
import TeamModel from "src/models/db/team.model";
import UserModel from "src/models/db/user.model";
import { ingress } from "src/models/ingress";
import { KnowError } from "src/utils/exceptions/known-exception";

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
                pricing: basicPricing['_id'],
                type: "INDIVIDUAL",
                customers: []
            });
            this.teamId = teamRes['_id'];

            let newUserDB: db.User = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                linkedinUrl: newUser.linkedinUrl,
                username: newUser.username,
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

            if (!userInserted) {
                throw new KnowError("Error while user insertion");
            } else if (!teamInserted) {
                throw new KnowError("Error while team insertion");
            }
        }
    }

    async deleteNewUser() {
        try {
        if (this.userId) await UserModel.deleteOne({ _id: this.userId });
        if (this.teamId) await TeamModel.deleteOne({ _id: this.teamId });
        } catch (err) {
            throw new KnowError("Error while user/team deletion");
        }
    }

}