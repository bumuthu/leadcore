import { Request, Response, NextFunction, Router } from 'express';
import Controller from '../utils/interfaces/controller.interface';
import RequestWithUser from '../utils/interfaces/requestWithUser.interface';
import authMiddleware from '../utils/middleware/auth.middleware';
import validationMiddleware from '../utils/middleware/validation.middleware';
import campaignModel from './campaign.model';
import CreateCampaignDto from './campaign.dto';
import Campaign from './campaign.interface';
import { CampaignNotFoundException } from '../utils/exceptions/NotFoundExceptions';


class CampaignController implements Controller {
    public path = '/campaign';
    public router = Router();
    private campaign = campaignModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/all`, this.getAllCampaigns);
        this.router.get(`${this.path}/:id`, this.getCampaignById);
        this.router
            .all(`${this.path}/*`, authMiddleware)
            .patch(`${this.path}/:id`, validationMiddleware(CreateCampaignDto, true), this.modifyCampaign)
            .delete(`${this.path}/:id`, this.deleteCampaign)
            .post(this.path, authMiddleware, validationMiddleware(CreateCampaignDto), this.createCampaign);
    }

    private getAllCampaigns = async (request: Request, response: Response) => {
        const camps = await this.campaign.find()
            .populate('createdBy');
        response.send(camps);
    }

    private getCampaignById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const camp = await this.campaign.findById(id);
        if (camp) {
            response.send(camp);
        } else {
            next(new CampaignNotFoundException(id));
        }
    }

    private modifyCampaign = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const postData: Campaign = request.body;
        const campaign = await this.campaign.findByIdAndUpdate(id, postData, { new: true });
        if (campaign) {
            response.send(campaign);
        } else {
            next(new CampaignNotFoundException(id));
        }
    }

    private createCampaign = async (request: RequestWithUser, response: Response) => {
        const postData: CreateCampaignDto = request.body;
        const createdCampaign = new this.campaign({
            ...postData,
            author: request.user._id,
        });
        const savedCampaign = await createdCampaign.save();
        await savedCampaign.populate('author', '-password').execPopulate();
        response.send(savedCampaign);
    }

    private deleteCampaign = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const successResponse = await this.campaign.findByIdAndDelete(id);
        if (successResponse) {
            response.send(200);
        } else {
            next(new CampaignNotFoundException(id));
        }
    }
}

export default CampaignController;
