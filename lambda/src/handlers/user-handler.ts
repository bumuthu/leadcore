import 'source-map-support/register';
import UserModel from 'src/models/db/user.model';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields } from 'src/validation/utils';
import { UserService } from 'src/services/user-service';
import { db } from 'src/models/db';


// UserRetrievalHandler
export const getUserByToken = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);

        return respondSuccess(user)
    } catch (err) {
        return respondError(err)
    }
}


// UserUpdateHandler
export const updateUserByToken = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);

        const userModificationReq: ingress.UserModificationRequest = JSON.parse(event.body) as ingress.UserModificationRequest;
        console.log("Modification request:", userModificationReq)

        validateUnnecessaryFields(userModificationReq, ["firstName", "lastName", "linkedinUrl", "linkedinToken"]);
        if (userModificationReq.linkedinToken) validateNotNullFields(userModificationReq.linkedinToken, ["accessToken", "expiresIn", "authorizedAt"])

        const updatedUser = await UserModel.findOneAndUpdate({ cognitoUserSub: user.cognitoUserSub }, userModificationReq, { new: true });
        return respondSuccess(updatedUser)
    } catch (err) {
        return respondError(err)
    }
}
