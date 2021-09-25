import 'source-map-support/register';

import { respondError, respondSuccess } from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import jwt_decode from "jwt-decode";
import { AuthenticationService } from 'src/services/auth-service';
import { egress } from 'src/models/egress';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields } from 'src/validation/utils';
import { UserService } from 'src/services/user-service';
import { AccessTokenNullError, UserSignUpError } from 'src/utils/exceptions';


// UserSignInHandler
export const signIn = async (event, _context) => {
    const authDetails: ingress.LoginInput = JSON.parse(event.body) as ingress.LoginInput;
    const authService: AuthenticationService = new AuthenticationService();

    try {
        validateNotNullFields(authDetails, ["username", "password"]);

        const token = await authService.signIn(authDetails.username, authDetails.password);
        return respondSuccess({
            accessToken: token,
            username: authDetails.username
        } as egress.LoginOutput);
    } catch (err) {
        return respondError(err)
    }
}


// UserSignUpHandler
export const signUp = async (event, _context) => {
    const newUser: ingress.SignUpInput = JSON.parse(event.body) as ingress.SignUpInput;
    const userService: UserService = new UserService();
    const authService = new AuthenticationService();

    try {
        validateNotNullFields(newUser, ["firstName", "email", "username", "password"]);

        await connectToTheDatabase();
        const userRes: any = await userService.createNewUser(newUser);
        const cognitoRes: any = await authService.signUp(newUser.username, newUser.email, newUser.password, userRes['_id']);
        console.log("Cognito Response:", cognitoRes)

        if (cognitoRes.user?.username != newUser.username) {
            throw new UserSignUpError(cognitoRes.message, cognitoRes.code);
        }
        return respondSuccess(userRes);
    } catch (err) {
        return respondError(err)
    }
}


// UserVerificationHandler
export const verifyUser = async (event, _context) => {
    const authDetails: ingress.VerificationInput = JSON.parse(event.body) as ingress.VerificationInput;
    const authService: AuthenticationService = new AuthenticationService();

    try {
        validateNotNullFields(authDetails, ["email", "code"]);
        const response = await authService.verifyUser(authDetails.email, authDetails.code);
        return respondSuccess(response);
    } catch (err) {
        return respondError(err)
    }
}


// UserVerificationResendHandler
export const resendVerification = async (event, _context) => {
    const authDetails: ingress.VerificationInput = JSON.parse(event.body) as ingress.VerificationInput;
    const authService: AuthenticationService = new AuthenticationService();

    try {
        validateNotNullFields(authDetails, ["email"]);
        const response = await authService.resendVerification(authDetails.email);
        return respondSuccess(response);
    } catch (err) {
        return respondError(err)
    }
}


// AccessTokenRetrievalHandler
export const getAccessToken = async (event, _context) => {
    try {
        const accessToken = event.headers.Authorization;
        if (!accessToken) throw new AccessTokenNullError("Null access token found");

        validateNotNullFields(event.queryStringParameters, ["authToken", "redirectUrl"]);

        const authService = new AuthenticationService();
        const userService: UserService = new UserService();
        const decodedUser: any = jwt_decode(accessToken);
        if (!decodedUser!.username) throw new AccessTokenNullError("Invalid access token");

        await connectToTheDatabase()

        const linkedinTokenRes = await authService.accessLinkedin(event.queryStringParameters);
        const updatedUser = await userService.updateUserWithLinkedinToken(decodedUser.username, linkedinTokenRes);
        console.log("Linkedin access token:", linkedinTokenRes.data);
        console.log('Updated user:', updatedUser);

        return respondSuccess(updatedUser)
    }
    catch (err) {
        return respondError(err)
    }
}
