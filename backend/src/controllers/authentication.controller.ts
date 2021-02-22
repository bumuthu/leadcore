import bcrypt from 'bcrypt';
import { WrongCredentialsException } from '../utils/exceptions/AuthenticationExceptions';
import { Request, Response, NextFunction, Router } from 'express';
import config from 'config';
import jwt from 'jsonwebtoken';
import Controller from '../utils/interfaces/controller.interface';
import DataStoredInToken from '../utils/interfaces/dataStoredInToken';
import TokenData from '../utils/interfaces/tokenData.interface';
import validationMiddleware from '../utils/middleware/validation.middleware';
import CreateUserDto from '../dtos/user.dto';
import User from '../interfaces/user.interface';
import userModel from '../models/user.model';
import AuthenticationService from '../services/authentication.service';
import LogInDto from '../dtos/logIn.dto';

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = Router();
    public authenticationService = new AuthenticationService();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private registration = async (request: Request, response: Response, next: NextFunction) => {
        const userData: CreateUserDto = request.body;
        try {
            const {
                cookie,
                user,
            } = await this.authenticationService.register(userData);
            response.setHeader('Set-Cookie', [cookie]);
            response.send(user);
        } catch (error) {
            next(error);
        }
    }

    private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ email: logInData.email });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.get('password', null, { getters: false }),
            );
            if (isPasswordMatching) {
                const tokenData = this.createToken(user);
                response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    }

    private loggingOut = (request: Request, response: Response) => {
        response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
        response.send(200);
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = config.get('auth.jwt-secret');
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }

}

export default AuthenticationController;
