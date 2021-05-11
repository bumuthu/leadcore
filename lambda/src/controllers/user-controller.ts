import { Types } from 'mongoose';
import 'source-map-support/register';
import PricingModel from 'src/models/pricing.model';
import RoleModel from 'src/models/role.model';
import TeamModel from 'src/models/team.model';
import UserModel from 'src/models/user.model';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';

const responseGenerator = new ResponseGenerator();

export const getUserById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.userId;

    try {
        const user = await UserModel.findById(id);
        // const user = await UserModel.findById(id).populate({ path: 'teams.team'}).populate({ path: 'teams.role'});
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('User', id);
    }
}


export const updateUserById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.userId;
    const updatedUser = JSON.parse(event.body);

    if (updatedUser.activityRecords) {
        delete updatedUser.activityRecords;
    }

    if (updatedUser.notifications) {
        delete updatedUser.notifications;
    }

    if (updatedUser.linkedinToken) {
        delete updatedUser.linkedinToken;
    }

    try {
        const user = await UserModel.findByIdAndUpdate(id, updatedUser, { new: true });
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('User', id);
    }
}


export const createUser = async (event, _context) => {
    await connectToTheDatabase();

    const newUser = JSON.parse(event.body);
    try {
        const basicPricing = await PricingModel.findOne({ name: "BASIC" });
        const agentRole = await RoleModel.findOne({ name: "AGENT" });

        const teamRes = await TeamModel.create({
            users: [],
            pricing: basicPricing['_id'],
            type: "INDIVIDUAL",
            customers: []
        });

        newUser['teams'] = [{
            team: Types.ObjectId(teamRes['_id']),
            role: Types.ObjectId(agentRole['_id']),
            campaigns: []
        }]

        newUser.activityRecords = [];
        newUser.notifications = [];

        const userRes = await UserModel.create(newUser);

        await TeamModel.findByIdAndUpdate(teamRes['_id'], { users: [Types.ObjectId(userRes['_id'])] }, { new: true });

        return responseGenerator.handleSuccessfullResponse(userRes);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('User');
    }
}

