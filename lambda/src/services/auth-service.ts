// import { Amplify, Auth } from 'aws-amplify';

// export enum PasswordChallenge {
//     NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
//     SMS_MFA = 'SMS_MFA',
// }

// export class AuthenticationService {

//     constructor(poolId: string, clientId: string) {
//         Amplify.configure({
//             userPoolId: poolId,
//             userPoolWebClientId: clientId,
//         });
//     }

//     async signUp(username: string, email: string, password: string) {
//         console.log('username=' + username + ', email=' + email + ', password=' + password)
        
//         try {
//             const signUpResponse = await Auth.signUp({
//                 username,
//                 password,
//                 attributes: {
//                     email: email
//                 }
//             })
//             console.log('SIGN UP RESPONSE', signUpResponse);

//             return signUpResponse;

//         } catch (err) {
//             console.log('SIGN UP ERROR', err);

//             return err
//         }
//     }

//     async signIn(username: string, password: string) {
//         console.log('sign-in username=' + username + ', password=' + password);

//         try {
//             const cognitoUser = await Auth.signIn(username, password).catch(err => console.log(err));

//             console.log('current user = ', cognitoUser);

//             const challenge = cognitoUser.challengeName;
//             if (challenge !== PasswordChallenge.NEW_PASSWORD_REQUIRED) {
//                 return cognitoUser.getSignInUserSession()?.getIdToken().getJwtToken();
//             } else {
//                 console.log('new password required');
//                 throw new Error('password change required');
//             }
//         } catch (err) {
//             console.log('error: ' + JSON.stringify(err));
//             throw err;
//         }
//     }

//     async signOut() {
//         console.log('sign-out');

//         try {
//             await Auth.signOut();
//             return { error: undefined };
//         } catch (err) {
//             console.log('error: ' + JSON.stringify(err));
//             return { error: err };
//         }
//     }
// }
