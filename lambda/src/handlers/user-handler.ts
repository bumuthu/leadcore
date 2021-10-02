import 'source-map-support/register';

import jwt_decode from "jwt-decode";
import UserModel from 'src/models/db/user.model';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import { AccessTokenNullError, DataNotFoundError } from 'src/utils/exceptions';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields } from 'src/validation/utils';


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

        const userModificationReq: ingress.UserModificationRequest = JSON.parse(event.body) as ingress.UserModificationRequest;
        console.log("Modification request:", userModificationReq)

        validateUnnecessaryFields(userModificationReq, ["firstName", "lastName", "linkedinUrl", "linkedinToken"]);
        if (userModificationReq.linkedinToken) validateNotNullFields(userModificationReq.linkedinToken, ["accessToken", "expiresIn", "authorizedAt"])

        await connectToTheDatabase();
        const user = await UserModel.findOneAndUpdate({ cognitoUserSub: decodedUser.sub }, userModificationReq, { new: true });
        return respondSuccess(user)
    } catch (err) {
        return respondError(err)
    }
}
