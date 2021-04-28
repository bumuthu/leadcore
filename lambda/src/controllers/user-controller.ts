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
    } catch (e){
        console.log(e);
        return responseGenerator.handleDataNotFound('User', id);
    }
}


export const updateUserById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.userId;
    const updatedUser = JSON.parse(event.body);

    if (updatedUser.activityRecords) {
        Object.assign({}, updatedUser).activityRecords.forEach((act, i) => {
            updatedUser.activityRecords[i].doneBy = Types.ObjectId(act.doneBy);
        });
    }

    if (updatedUser.notifications) {
        Object.assign({}, updatedUser).notifications.forEach((not, i) => {
            updatedUser.notifications[i].doneBy = Types.ObjectId(not.doneBy);
        });
    }

    try {
        const user = await UserModel.findOneAndUpdate(id, updatedUser, { new: true });
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (e){
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

        const team = await TeamModel.create({
            users: [],
            pricing: basicPricing['_id'],
            type: "INDIVIDUAL"
        });

        newUser['teams'] = [{
            team: Types.ObjectId(team['_id']),
            role: Types.ObjectId(agentRole['_id']),
            campaigns: []
        }]

        if (newUser.activityRecords) {
            Object.assign({}, newUser).activityRecords.forEach((act, i) => {
                newUser.activityRecords[i].doneBy = Types.ObjectId(act.doneBy);
            });
        }

        if (newUser.notifications) {
            Object.assign({}, newUser).notifications.forEach((not, i) => {
                newUser.notifications[i].doneBy = Types.ObjectId(not.doneBy);
            });
        }

        const user = await UserModel.create(newUser);
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('User');
    }
}

