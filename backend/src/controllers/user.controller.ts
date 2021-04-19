import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../utils/interfaces/controller.interface';
import RequestWithUser from '../utils/interfaces/requestWithUser.interface';
import authMiddleware from '../utils/middleware/auth.middleware';
import campaignModel from '../models/campaign.model';
import UserModel from '../models/user.model';
import { NotAuthorizedException } from '../utils/exceptions/AuthenticationExceptions';
import { DataNotFoundException } from '../utils/exceptions/NotFoundExceptions';

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
        this.router.put(`${this.path}/:id`, authMiddleware, this.modifyUser);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteUser);
    }

    createUser = async (request: Request, response: Response, next: NextFunction) => {
        let userData = request.body;
        console.log(userData)
        let savedUser = await this.user.create(userData);
        console.log(savedUser);
        response.send(savedUser);
    }

    getUserById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const user = await this.user.findById(id);
        if (user) {
            response.send(user);
        } else {
            next(new DataNotFoundException('User', id));
        }
    }

    modifyUser = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const userData = request.body;
        const savedUser = await this.user.findByIdAndUpdate(id, userData);
        if (savedUser) {
            response.send(savedUser);
        } else {
            next(new DataNotFoundException('User', id));
        }
    }

    deleteUser = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const savedUser = await this.user.findByIdAndDelete(id);
        if (savedUser) {
            response.send(savedUser);
        } else {
            next(new DataNotFoundException('User', id));
        }
    }
}

export default UserController;
