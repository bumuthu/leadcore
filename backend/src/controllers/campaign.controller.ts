import { Request, Response, NextFunction, Router } from 'express';
import Controller from '../utils/interfaces/controller.interface';
import RequestWithUser from '../utils/interfaces/requestWithUser.interface';
import authMiddleware from '../utils/middleware/auth.middleware';
import validationMiddleware from '../utils/middleware/validation.middleware';
import CampaignModel from '../models/campaign.model';
import Campaign from '../interfaces/campaign.interface';
import { CampaignNotFoundException } from '../utils/exceptions/NotFoundExceptions';


class CampaignController implements Controller {
    path = '/campaign';
    router = Router();
    campaign = CampaignModel;

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        /**
        * @swagger
        * /campaign/all:
        *   get:
        *       tags:
        *       - "Campaign"
        *       description: Use to get all campaigns
        *       responses:
        *           '200':
        *           description: A successful response
         */
        this.router.get(`${this.path}/all`, authMiddleware, this.getAllCampaigns);

        /**
        * @swagger
        * /campaign/id:
        *   get:
        *       tags:
        *       - "Campaign"
        *       description: Use to get a campaign by ID
        *       responses:
        *       '200':
        *           description: A successful response
        *   
        *   post:
        *       tags:
        *       - "Campaign"
        *       description: Use to get a campaign by ID
        *       responses:
        *       '200':
        *           description: A successful response
         */        
        this.router.get(`${this.path}/:id`, authMiddleware, this.getCampaignById);
        this.router.post(`${this.path}`, authMiddleware, this.createCampaign);

        // this.router
        //     .all(`${this.path}/*`, authMiddleware)
        //     .patch(`${this.path}/:id`, validationMiddleware(CreateCampaignDto, true), this.modifyCampaign)
        //     .delete(`${this.path}/:id`, this.deleteCampaign)
        //     .post(this.path, authMiddleware, validationMiddleware(CreateCampaignDto), this.createCampaign);
    }

    private getAllCampaigns = async (request: Request, response: Response) => {
        const camps = await this.campaign.find()
            .populate('createdBy');
        response.send(camps);
    }

    private getCampaignById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const camp = await this.campaign.findById(id).populate('createdBy');
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
        const campaignData = request.body;
        const savedCampaign = await this.campaign.create(campaignData);
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
