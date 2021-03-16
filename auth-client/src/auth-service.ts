import { Amplify, Auth } from 'aws-amplify';
const debug = require('debug')('authentication-service');

export enum PasswordChallenge {
    NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
    SMS_MFA = 'SMS_MFA',
}

export class AuthenticationService {

    constructor(poolId: string, clientId: string) {
        Amplify.configure({
            userPoolId: poolId,
            userPoolWebClientId: clientId,
        });
    }

    async signUp(username: string, email: string, password: string) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            const signUpResponse = await Auth.signUp({
                username,
                password,
                attributes: {
                    email: email
                }
            })
            debug('SIGN UP RESPONSE',signUpResponse)
        } catch (err) {
            debug('SIGN UP ERROR', err)
        }
    }

    async signIn(username: string, password: string) {
        debug('sign-in username=' + username + ', password=' + password);

        try {
            const cognitoUser = await Auth.signIn(username, password).catch(err => console.log(err));

            debug('current user = ', cognitoUser);

            const challenge = cognitoUser.challengeName;
            if (challenge !== PasswordChallenge.NEW_PASSWORD_REQUIRED) {
                return cognitoUser.getSignInUserSession()?.getIdToken().getJwtToken();
            } else {
                debug('new password required');
                throw new Error('password change required');
            }
        } catch (err) {
            debug('error: ' + JSON.stringify(err));
            throw err;
        }
    }

    async signOut() {
        debug('sign-out');

        try {
            await Auth.signOut();
            return { error: undefined };
        } catch (err) {
            debug('error: ' + JSON.stringify(err));
            return { error: err };
        }
    }
}
