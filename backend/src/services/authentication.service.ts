import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import { UserWithThatEmailAlreadyExistsException } from '../utils/exceptions/AuthenticationExceptions';
import DataStoredInToken from '../utils/interfaces/dataStoredInToken';
import TokenData from '../utils/interfaces/tokenData.interface';
import CreateUserDto from '../dtos/user.dto';
import User from '../interfaces/user.interface';
import userModel from '../models/user.model';

class AuthenticationService {
    public user = userModel;

    public async register(userData: CreateUserDto) {
        if (
            await this.user.findOne({ email: userData.email })
        ) {
            throw new UserWithThatEmailAlreadyExistsException(userData.email);
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.user.create({
            ...userData,
            password: hashedPassword,
        });
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        return {
            cookie,
            user,
        };
    }
    public createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
    public createToken(user: User): TokenData {
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

export default AuthenticationService;
