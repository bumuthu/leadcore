import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import UserModel from 'src/models/user.model';
import axios from 'axios';

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

    try {
        const options = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };

        const accessToken = await axios.post(
            ACCESS_TOKEN_URL,
            `grant_type="authorization_code" & 
            code=${authToken} & 
            redirect_uri=${redirectUrl} & 
            client_id=${CLIENT_ID} & 
            client_secret=${CLIENT_SECRET}`,
            options
        );
            
        const user = await UserModel.findByIdAndUpdate(userId, {
            linkedinToken: {
                accessToken: accessToken.data.access_token,
                expiresIn: accessToken.data.expires_in,
                authorizedAt: new Date()
            }
        }, { new: true });

        return responseGenerator.handleSuccessfullResponse(user);

    } catch (e) {
        console.log(e);
        return responseGenerator.handleGenericError(JSON.stringify(e));
    }
}
