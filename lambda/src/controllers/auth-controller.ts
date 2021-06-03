import 'source-map-support/register';
import axios from 'axios';
import { Types } from 'mongoose';
import jwt_decode from "jwt-decode";

import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import UserModel from 'src/models/user.model';
import PricingModel from 'src/models/pricing.model';
import RoleModel from 'src/models/role.model';
import TeamModel from 'src/models/team.model';
import { AuthenticationService } from 'src/services/auth-service';

const ACCESS_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const CLIENT_ID = '8611dl35uynhm6';
const CLIENT_SECRET = 'quH0kvxL1E5AAiNg';

const responseGenerator = new ResponseGenerator();

export const getAccessToken = async (event, _context) => {
    await connectToTheDatabase()

    const accessToken = event.headers.Authorization;
    console.log("TOKEN", accessToken)

    const decodedUser: any = jwt_decode(accessToken);
    console.log("DECODED USER", decodedUser);

    const authToken = event.queryStringParameters.authToken;
    const redirectUrl = event.queryStringParameters.redirectUrl;

    const api = axios.create();

    const options = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    try {
        console.log('REQUEST', `grant_type=authorization_code&code=${authToken}&redirect_uri=${redirectUrl}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`);

        const accessToken: any = await api.post(
            ACCESS_TOKEN_URL,
            `grant_type=authorization_code&code=${authToken}&redirect_uri=${redirectUrl}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
            options
        ).catch(err => {
            console.log('ACCESS TOKEN ERROR', err.response.data);
            return responseGenerator.handleBusinessLoginError(JSON.stringify(err.response.data));
        });

        console.log("ACCESS TOKEN", accessToken.data);

        const user = await UserModel.findOneAndUpdate({ username: decodedUser.username },
            {
                linkedinToken: {
                    accessToken: accessToken.data.access_token,
                    expiresIn: accessToken.data.expires_in,
                    authorizedAt: new Date()
                }
            },
            { new: true }
        ).catch(err => {
            return responseGenerator.handleCouldntInsert('User');
        })

        console.log('UPDATED USER', user);

        return responseGenerator.handleSuccessfullResponse(user);
    }

    catch (err) {
        responseGenerator.handleGenericError(JSON.stringify(err))
    }
}


export const signIn = async (event, _context) => {

    const authDetails = JSON.parse(event.body);
    const authService = new AuthenticationService();

    try {
        const token = await authService.signIn(authDetails.username, authDetails.password)
            .catch(err => {
                console.log('ERROR', err);
                responseGenerator.handleGenericError(JSON.stringify(err))
            });

        return responseGenerator.handleSuccessfullResponse({
            accessToken: token
        });

    } catch (err) {
        responseGenerator.handleGenericError(JSON.stringify(err))
    }
}


export const signUp = async (event, _context) => {
    await connectToTheDatabase();

    const newUser = JSON.parse(event.body);
    delete newUser.password;
    const password = JSON.parse(event.body).password;

    const authService = new AuthenticationService();

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
        }];

        newUser.activityRecords = [];
        newUser.notifications = [];

        const userRes = await UserModel.create(newUser);

        await TeamModel.findByIdAndUpdate(teamRes['_id'], { users: [Types.ObjectId(userRes['_id'])] }, { new: true });

        // User registration        
        const cognitoRes = await authService.signUp(newUser.username, newUser.email, password, userRes['_id']);

        return responseGenerator.handleSuccessfullResponse({ databaseResponse: userRes, cognitoResponse: cognitoRes });

    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('User');
    }
}
