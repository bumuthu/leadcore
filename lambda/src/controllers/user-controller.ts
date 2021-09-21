import { Types } from 'mongoose';
import jwt_decode from "jwt-decode";
import 'source-map-support/register';
import PricingModel from 'src/models/db/pricing.model';
import RoleModel from 'src/models/db/role.model';
import TeamModel from 'src/models/db/team.model';
import UserModel from 'src/models/db/user.model';
import ResponseGenerator from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';

const responseGenerator = new ResponseGenerator();

export const getUserById = async (event, _context) => {
    await connectToTheDatabase();

    console.log("EVENT", event)

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

export const getUserByToken = async (event, _context) => {
    await connectToTheDatabase();

    const accessToken = event.headers.authorization;
    console.log("TOKEN:", accessToken);
    if (accessToken == undefined) return responseGenerator.handleAuthorizationError();

    try {
        const decodedUser: any = jwt_decode(accessToken);
        console.log("DECODED USER:", decodedUser);

        const user = await UserModel.findOne({ username: decodedUser.username });
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleAuthorizationError();
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


export const updateUserByToken = async (event, _context) => {
    await connectToTheDatabase();

    const accessToken = event.headers.Authorization;
    console.log("TOKEN", accessToken);

    const decodedUser2: any = jwt_decode(accessToken);
    console.log("DECODED USER", decodedUser2);

    const updateingUser = JSON.parse(event.body);

    if (updateingUser.activityRecords) {
        delete updateingUser.activityRecords;
    }

    if (updateingUser.notifications) {
        delete updateingUser.notifications;
    }

    if (updateingUser.linkedinToken) {
        delete updateingUser.linkedinToken;
    }

    try {
        const user = await UserModel.findOneAndUpdate({ username: decodedUser2.username }, updateingUser, { new: true });
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('User');
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

