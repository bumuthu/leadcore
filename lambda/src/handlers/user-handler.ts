import 'source-map-support/register';

import jwt_decode from "jwt-decode";
import UserModel from 'src/models/db/user.model';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import { AccessTokenNullError, DataNotFoundError } from 'src/utils/exceptions';


// UserRetrievalHandler
export const getUserByToken = async (event, _context) => {
    try {
        const accessToken = event.headers.authorization;
        console.log("Header:", event.headers)
        if (!accessToken) throw new AccessTokenNullError("Null access token found");

        const decodedUser: any = jwt_decode(accessToken);
        console.log("Decoded user:", decodedUser);
        if (!decodedUser!.username) throw new AccessTokenNullError("Invalid access token");

        await connectToTheDatabase();

        const user = await UserModel.findOne({ cognitoUserSub: decodedUser.sub });
        if (!user) throw new DataNotFoundError("User not found in the system");

        return respondSuccess(user)
    } catch (err) {
        return respondError(err)
    }
}


// UserUpdateHandler
export const updateUserByToken = async (event, _context) => {
    try {
        const accessToken = event.headers.authorization;
        console.log("Header:", event.headers)
        if (!accessToken) throw new AccessTokenNullError("Null access token found");

        const decodedUser: any = jwt_decode(accessToken);
        console.log("Decoded user:", decodedUser);
        if (!decodedUser!.username) throw new AccessTokenNullError("Invalid access token");

        const modifiedUser = JSON.parse(event.body);

        if (modifiedUser.activityRecords) delete modifiedUser.activityRecords;
        if (modifiedUser.notifications) delete modifiedUser.notifications;
        if (modifiedUser.linkedinToken) delete modifiedUser.linkedinToken;

        await connectToTheDatabase();
        const user = await UserModel.findOneAndUpdate({ email: decodedUser.email }, modifiedUser, { new: true });
        return respondSuccess(user)
    } catch (err) {
        return respondError(err)
    }
}
