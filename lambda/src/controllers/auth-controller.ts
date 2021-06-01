import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import UserModel from 'src/models/user.model';
import axios from 'axios';
// import { Session } from 'src/services/auth-session';

const ACCESS_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const CLIENT_ID = '8611dl35uynhm6';
const CLIENT_SECRET = 'quH0kvxL1E5AAiNg';

const responseGenerator = new ResponseGenerator();

export const getAccessToken = async (event, _context) => {
    await connectToTheDatabase()

    console.log('EVENT', event);

    const userId = event.queryStringParameters.userId;
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

        const user = await UserModel.findByIdAndUpdate(userId,
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


// export const signIn = async (event, _context) => {

//     const authDetails = JSON.parse(event.body);

//     try {
//         const userSession = new Session();
//         const token = userSession.signIn(authDetails.username, authDetails.password);

//         return responseGenerator.handleSuccessfullResponse({
//             message: {
//                 token: token
//             }
//         });

//     } catch (err) {
//         responseGenerator.handleGenericError(JSON.stringify(err))
//     }
// }


// export const signUp = async (event, _context) => {

//     const authDetails = JSON.parse(event.body);

//     try {
//         const userSession = new Session();
//         const userRes = userSession.signUp(authDetails.username, authDetails.email, authDetails.password);

//         return responseGenerator.handleSuccessfullResponse(userRes);

//     } catch (err) {
//         responseGenerator.handleGenericError(JSON.stringify(err))
//     }
// }

