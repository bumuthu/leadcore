import axios from 'axios';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { LinkedinAccessTokenException, UserAuthenticationError, UserLoginError, UserSignOutError, UserSignUpError, UserVerificationError, UserVerificationResendError } from 'src/utils/exceptions';
import { EntityService } from './entity-service';

export enum PasswordChallenge {
    NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
    SMS_MFA = 'SMS_MFA',
}

export enum AuthType {
    EMAIL = "EMAIL",
    LINKEDIN = "LINKEDIN"
}

const POOL_ID = 'us-east-2_KwE2BHUY1';
const CLIENT_ID = '3agvvhnm9maoubjl5eb4jurrtt';

const LINKEDIN_ACCESS_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_CLIENT_ID = '8611dl35uynhm6';
const LINKEDIN_CLIENT_SECRET = 'quH0kvxL1E5AAiNg';

export class AuthenticationService extends EntityService {

    private userPool: CognitoUserPool;
    private cognitoUser: CognitoUser;

    constructor() {
        super();
        this.userPool = new CognitoUserPool({
            UserPoolId: POOL_ID,
            ClientId: CLIENT_ID,
        });
    }

    async signUp(email: string, password: string, userId: string) {
        console.log('email=' + email + ', password=' + password + ', userId=' + userId)

        this.cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        try {
            const userIdAttr = new CognitoUserAttribute({
                Name: 'custom:user_id',
                Value: userId
            })

            return await new Promise(
                (resolve, reject) => {
                    this.userPool.signUp(
                        email,
                        password,
                        [userIdAttr],
                        null,
                        function (error, response) {
                            if (error) reject(error);
                            resolve(response);
                        }
                    )
                }
            );
        } catch (err) {
            console.error(err);
            throw new UserSignUpError(err.message, err.code);
        }
    }


    async signIn(email: string, password: string) {
        console.log('sign-in: email=' + email + ', password=' + password);

        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        });
        this.cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        try {
            return await new Promise(
                (resolve, reject) => {
                    this.cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: function (result) {
                            const accessToken = result.getAccessToken().getJwtToken();
                            resolve(accessToken)
                        },
                        onFailure: function (err) {
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
            console.error(err);
            throw new UserLoginError(err.message, err.code);
        }
    }

    async signOut(email: string) {
        console.log('sign-out: email=', email);

        try {
            this.cognitoUser = new CognitoUser({
                Username: email,
                Pool: this.userPool
            });
            this.cognitoUser.signOut();
            return;
        } catch (err) {
            throw new UserSignOutError("User sign out exception")
        }
    }

    async verifyUser(email: string, code: string) {
        this.cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        try {
            return await new Promise(
                (resolve, reject) => {
                    this.cognitoUser.confirmRegistration(
                        code, true, (err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                })
        } catch (err) {
            console.error(err);
            throw new UserVerificationError(err.message, err.code)
        }
    }

    async resendVerification(email: string) {
        this.cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        try {
            return await new Promise(
                (resolve, reject) => {
                    this.cognitoUser.resendConfirmationCode(
                        (err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                })
        } catch (err) {
            console.error(err);
            throw new UserVerificationResendError(err.message, err.code)
        }
    }

    async forgotPassword(email: string) {
        this.cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        try {
            return await new Promise(
                (resolve, reject) => {
                    this.cognitoUser.forgotPassword(
                        {
                            onSuccess: function (result) {
                                resolve(result)
                            },
                            onFailure: function (err) {
                                reject(err)
                            }
                        })
                })
        } catch (err) {
            console.error(err);
            throw new UserAuthenticationError(err.message, err.code)
        }
    }

    async changePassword(email: string, oldPassword: string, newPassword: string) {
        try {
            await this.signIn(email, oldPassword);

            return await new Promise(
                (resolve, reject) => {
                    this.cognitoUser.changePassword(
                        oldPassword,
                        newPassword,
                        (err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        });
                })
        } catch (err) {
            console.error(err);
            throw new UserAuthenticationError(err.message, err.code)
        }
    }


    async accessLinkedin(parameters: { authToken: string, redirectUrl: string }) {
        const authToken = parameters.authToken;
        const redirectUrl = parameters.redirectUrl;
        const authRequest = `grant_type=authorization_code&code=${authToken}&redirect_uri=${redirectUrl}&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}`;

        console.log('Auth request', authRequest);

        const api = axios.create();
        return await api.post(
            LINKEDIN_ACCESS_TOKEN_URL,
            authRequest,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        ).catch(err => {
            console.error(err.response.data);
            throw new LinkedinAccessTokenException(JSON.stringify(err.response.data))
        });
    }

    async deleteNewUser() {
        await new Promise(
            (resolve, reject) => {
                this.cognitoUser.deleteUser((err) => {
                    if (err) {
                        console.error("ERROR", err)
                        reject();
                    }
                    resolve("Deleted");
                });
            }
        );
    }
}
