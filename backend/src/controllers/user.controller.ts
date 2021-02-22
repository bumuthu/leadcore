import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../utils/interfaces/controller.interface';
import RequestWithUser from '../utils/interfaces/requestWithUser.interface';
import authMiddleware from '../utils/middleware/auth.middleware';
import campaignModel from '../models/campaign.model';
import UserModel from '../models/user.model';
import { NotAuthorizedException } from '../utils/exceptions/AuthenticationExceptions';
import { UserNotFoundException } from '../utils/exceptions/NotFoundExceptions';

class UserController implements Controller {
    path = '/user';
    router = Router();
    campaign = campaignModel;
    user = UserModel;

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}/:id`, authMiddleware, this.getUserById);
        this.router.post(`${this.path}/new`, authMiddleware, this.createUser);
    }

    createUser = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        const savedUser = await this.user.create(userData);
        response.send(savedUser);
    }

    getUserById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const user = await this.user.findById(id);
        // if (request.query.withPosts === 'true') {
        //     userQuery.populate('campaigns').exec();
        // }
        // const user = await userQuery;
        if (user) {
            response.send(user);
        } else {
            next(new UserNotFoundException(id));
        }
    }

    getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        const userId = request.params.id;
        if (userId === request.user._id.toString()) {
            const campaigns = await this.campaign.find({ author: userId });
            response.send(campaigns);
        }
        next(new NotAuthorizedException());
    }
}

export default UserController;
