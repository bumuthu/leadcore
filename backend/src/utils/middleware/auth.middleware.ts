import { AuthenticationTokenMissingException, WrongAuthenticationTokenException } from '../exceptions/AuthenticationExceptions';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import userModel from '../../models/user.model';
const jwkToPem = require('jwk-to-pem');
const fs = require('fs');

console.log(process.cwd())
const jwk = JSON.parse(fs.readFileSync('./jwks.json')).keys[0];
const pem = jwkToPem(jwk);
console.log(pem)

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
    const bearerString = request.headers.authorization;
    if (bearerString) {
        const bearerToken = bearerString.split(' ')[1];
        console.log(bearerToken)
        try {
            jwt.verify(bearerToken, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
                if (decodedToken) {
                    next()
                }
                console.log(decodedToken);
            });
            // const id = verificationResponse._id;
            // console.log(id)
            // const user = await userModel.findById(id);
            // if (user) {
            //     request.user = user;
            //     next();
            // } else {
            //     next(new WrongAuthenticationTokenException());
            // }
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new AuthenticationTokenMissingException());
    }
}

export default authMiddleware;
