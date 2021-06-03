import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js';

export enum PasswordChallenge {
    NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
    SMS_MFA = 'SMS_MFA',
}

const POOL_ID = 'us-east-2_oA3vL0NU6';
const CLIENT_ID = '1gtgjrm2oj3u0cnkks0j3hkneg';

export class AuthenticationService {

    private userPool;

    constructor() {
        this.userPool = new CognitoUserPool({
            UserPoolId: POOL_ID,
            ClientId: CLIENT_ID,
        });
    }

    async signUp(username: string, email: string, password: string, userId: string) {
        console.log('username=' + username + ', email=' + email + ', password=' + password + ' ,userId=' + userId)

        try {
            const emailAttr = new CognitoUserAttribute({
                Name: 'email',
                Value: email
            });

            const userIdAttr = new CognitoUserAttribute({
                Name: 'custom:user_id',
                Value: userId
            })

            return await new Promise(
                (resolve, reject) => {
                    this.userPool.signUp(
                        username,
                        password,
                        [emailAttr, userIdAttr],
                        null,
                        function (error, response) {
                            console.log('ERROR', error, 'RESPONSE', response);

                            if (error) reject(error);
                            resolve(response);
                        }
                    )
                }
            );

        } catch (err) {
            console.log('SIGN UP ERROR', err);

            return err
        }
    }


    async signIn(username: string, password: string) {
        console.log('sign-in username=' + username + ', password=' + password);

        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });

        try {
            return await new Promise(
                (resolve, reject) => {
                    cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: function (result) {
                            const accessToken = result.getAccessToken().getJwtToken();
                            resolve(accessToken)
                        },
                        onFailure: function (err) {
                            console.log(err.message || JSON.stringify(err));
                            reject(err)
                        }
                    });
                })



            // const cognitoUser = await this.userPool.signIn(username, password).catch(err => console.log(err));

            // console.log('current user = ', cognitoUser);

            // const challenge = cognitoUser.challengeName;
            // if (challenge !== PasswordChallenge.NEW_PASSWORD_REQUIRED) {
            //     return cognitoUser.getSignInUserSession()?.getIdToken().getJwtToken();
            // } else {
            //     console.log('new password required');
            //     throw new Error('password change required');
            // }

        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            throw err;
        }
    }

    async signOut() {
        console.log('sign-out');

        try {
            await this.userPool.signOut();
            return { error: undefined };
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            return { error: err };
        }
    }
}
