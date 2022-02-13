import 'source-map-support/register';

import { respondError, respondSuccess } from 'src/utils/response-generator';
import { entity } from 'src/models/entities';
import { AuthenticationService, AuthType } from 'src/services/authentication.service';
import { egress } from 'src/models/egress';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields } from 'src/validation/utils';
import { UserService } from 'src/services/user-service';
import { AccessTokenNullError, NotImplementedError, UserSignUpError, ValidationError } from 'src/utils/exceptions';


// UserSignInHandler
export const signIn = async (event, _context) => {
    const authDetails: ingress.LoginInput = JSON.parse(event.body) as ingress.LoginInput;
    const authService: AuthenticationService = new AuthenticationService();
    let response: egress.LoginOutput;

    try {
        validateNotNullFields(authDetails, ["type"]);

        if (authDetails.type == AuthType.EMAIL) {
            validateNotNullFields(authDetails, ["email", "password"]);

            const token = await authService.signIn(authDetails.email, authDetails.password);
            response = {
                accessToken: token,
                email: authDetails.email
            } as egress.LoginOutput;
        } else if (authDetails.type == AuthType.LINKEDIN) {
            throw new NotImplementedError("Linkedin sign in not implemented")
        } else {
            throw new ValidationError("Invalid authentication type")
        }

        return respondSuccess(response);
    } catch (err) {
        return respondError(err)
    }
}


// UserSignUpHandler
export const signUp = async (event, _context) => {
    const newUser: ingress.SignUpInput = JSON.parse(event.body) as ingress.SignUpInput;
    const userService: UserService = new UserService();
    const authService = new AuthenticationService();
    let response: any;

    try {
        validateNotNullFields(newUser, ["type"]);

        if (newUser.type == AuthType.EMAIL) {
            validateNotNullFields(newUser, ["firstName", "email", "password"]);

            const userRecord: entity.User = await userService.createNewUser(newUser);
            const userId = UserService.getEntityKey(userRecord);

            const cognitoRes: any = await authService.signUp(newUser.email, newUser.password, userId);
            console.log("Cognito Response:", cognitoRes)

            if (cognitoRes.user?.username != newUser.email) throw new UserSignUpError(cognitoRes.message, cognitoRes.code);

            await userService.updateUser(userId, { cognitoUserSub: cognitoRes.userSub });

            response = userRecord;
        } else if (newUser.type == AuthType.LINKEDIN) {
            throw new NotImplementedError("Linkedin sign up not implemented")
        } else {
            throw new ValidationError("Invalid authentication type")
        }

        return respondSuccess(response);
    } catch (err) {
        try {
            await userService.deleteNewUser();
            await authService.deleteNewUser();
        } catch (e) {
            console.error("ERROR", e);
        }
        return respondError(err);
    }
}


// UserVerificationHandler
export const verifyUser = async (event, _context) => {
    const authService: AuthenticationService = new AuthenticationService();
    try {
        validateNotNullFields(event.queryStringParameters, ["email", "code"]);
        const response = await authService.verifyUser(event.queryStringParameters.email, event.queryStringParameters.code);
        return respondSuccess(response);
    } catch (err) {
        return respondError(err)
    }
}


// UserVerificationResendHandler
export const resendVerification = async (event, _context) => {
    const authService: AuthenticationService = new AuthenticationService();
    try {
        validateNotNullFields(event.queryStringParameters, ["email"]);
        const response = await authService.resendVerification(event.queryStringParameters.email);
        return respondSuccess({ message: "Sent confirmation resend message successfully", response });
    } catch (err) {
        return respondError(err)
    }
}


// UserForgotPasswordHandler
export const forgotPassword = async (event, _context) => {
    const forgotPasswordBody = JSON.parse(event.body);
    const authService: AuthenticationService = new AuthenticationService();
    try {
        validateNotNullFields(forgotPasswordBody, ["email"]);
        const response = await authService.forgotPassword(forgotPasswordBody.email);
        return respondSuccess({ message: "Password reset message sent successfully", response });
    } catch (err) {
        return respondError(err)
    }
}


// UserPasswordChangeHandler
export const changePassword = async (event, _context) => {
    const passwordResetBody = JSON.parse(event.body);
    const authService: AuthenticationService = new AuthenticationService();
    try {
        validateNotNullFields(passwordResetBody, ["email", "oldPassword", "newPassword"]);
        const response = await authService.changePassword(passwordResetBody.email, passwordResetBody.oldPassword, passwordResetBody.newPassword);
        return respondSuccess({ message: "Password reset message sent successfully", response });
    } catch (err) {
        return respondError(err)
    }
}


// AccessTokenRetrievalHandler
export const getAccessToken = async (event, _context) => {
    try {
        const accessToken = event.headers.authorization;
        if (!accessToken) throw new AccessTokenNullError("Null access token found");

        validateNotNullFields(event.queryStringParameters, ["authToken", "redirectUrl"]);

        const authService = new AuthenticationService();
        const userService: UserService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);

        const linkedinTokenRes = await authService.accessLinkedin(event.queryStringParameters);
        const updatedUser = await userService.updateUser(UserService.getEntityKey(user), {
            linkedinToken: {
                accessToken: linkedinTokenRes.data.access_token,
                expiresIn: linkedinTokenRes.data.expires_in,
                authorizedAt: new Date()
            }
        });
        console.log("Linkedin access token:", linkedinTokenRes.data);
        console.log('Updated user:', updatedUser);

        return respondSuccess(updatedUser)
    }
    catch (err) {
        return respondError(err)
    }
}
