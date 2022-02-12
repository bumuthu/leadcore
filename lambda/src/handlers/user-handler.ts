import 'source-map-support/register';
import UserDBModel from 'src/models/db/user.model';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields } from 'src/validation/utils';
import { UserService } from 'src/services/user-service';
import { entity } from 'src/models/entities';


// UserRetrievalHandler
export const getUserByToken = async (event, _context) => {
    try {
        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);

        return respondSuccess(user)
    } catch (err) {
        return respondError(err)
    }
}


// UserUpdateHandler
export const updateUserByToken = async (event, _context) => {
    try {
        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);

        const userModificationReq: ingress.UserModificationRequest = JSON.parse(event.body) as ingress.UserModificationRequest;
        console.log("Modification request:", userModificationReq)

        validateUnnecessaryFields(userModificationReq, ["firstName", "lastName", "linkedinUrl", "linkedinToken"]);
        if (userModificationReq.linkedinToken) validateNotNullFields(userModificationReq.linkedinToken, ["accessToken", "expiresIn", "authorizedAt"])

        const updatedUser = await UserDBModel.findOneAndUpdate({ cognitoUserSub: user.cognitoUserSub }, userModificationReq, { new: true });
        return respondSuccess(updatedUser)
    } catch (err) {
        return respondError(err)
    }
}
