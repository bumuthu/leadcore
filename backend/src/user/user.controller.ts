import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../utils/interfaces/controller.interface';
import RequestWithUser from '../utils/interfaces/requestWithUser.interface';
import authMiddleware from '../utils/middleware/auth.middleware';
import campaignModel from '../campaign/campaign.model';
import userModel from './user.model';
import { NotAuthorizedException } from '../utils/exceptions/AuthenticationExceptions';
import { UserNotFoundException } from '../utils/exceptions/NotFoundExceptions';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private campaign = campaignModel;
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:id`, authMiddleware, this.getUserById);
        this.router.get(`${this.path}/:id/campaigns`, authMiddleware, this.getAllPostsOfUser);
    }

    private getUserById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const userQuery = this.user.findById(id);
        if (request.query.withPosts === 'true') {
            userQuery.populate('campaigns').exec();
        }
        const user = await userQuery;
        if (user) {
            response.send(user);
        } else {
            next(new UserNotFoundException(id));
        }
    }

    private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        const userId = request.params.id;
        if (userId === request.user._id.toString()) {
            const campaigns = await this.campaign.find({ author: userId });
            response.send(campaigns);
        }
        next(new NotAuthorizedException());
    }
}

export default UserController;
