import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import CampaignModel from 'src/models/campaign.model';
import { Types } from 'mongoose';

const responseGenerator = new ResponseGenerator();

export const getCampaignById = async (event, _context) => {
    await connectToTheDatabase()

    const id = event.pathParameters.campaignId;

    try {
        const campaign = await CampaignModel.findById(id);
        return responseGenerator.handleSuccessfullResponse(campaign);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('Campaign', id);
    }
}

export const updateCampaignById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.campaignId;
    const updatedCampaign = JSON.parse(event.body);

    if (updatedCampaign.roles) {
        Object.assign({}, updatedCampaign).roles.forEach((rol, i) => {
            updatedCampaign.roles[i].role = Types.ObjectId(rol.role);
            updatedCampaign.roles[i].user = Types.ObjectId(rol.user);
        });
    }

    if (updatedCampaign.customers) {
        Object.assign({}, updatedCampaign).customers.forEach((cus, i) => {
            updatedCampaign.customers[i].customer = Types.ObjectId(cus.customer);
        });
    }

    if (updatedCampaign.activityRecords) {
        Object.assign({}, updatedCampaign).activityRecords.forEach((act, i) => {
            updatedCampaign.activityRecords[i].doneBy = Types.ObjectId(act.doneBy);
        });
    }

    try {
        const campaign = await CampaignModel.findByIdAndUpdate(id, updatedCampaign, { new: true });
        return responseGenerator.handleSuccessfullResponse(campaign);
    }
    catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('Campaign', id);
    }
}

export const createCampaign = async (event, _context) => {
    await connectToTheDatabase();

    const newCampaign = JSON.parse(event.body);

    if (newCampaign.roles) {
        Object.assign({}, newCampaign).roles.forEach((rol, i) => {
            newCampaign.roles[i].role = Types.ObjectId(rol.role);
            newCampaign.roles[i].user = Types.ObjectId(rol.user);
        });
    }

    if (newCampaign.customers) {
        Object.assign({}, newCampaign).customers.forEach((cus, i) => {
            newCampaign.customers[i].customer = Types.ObjectId(cus.customer);
        });
    }

    if (newCampaign.activityRecords) {
        Object.assign({}, newCampaign).activityRecords.forEach((act, i) => {
            newCampaign.activityRecords[i].doneBy = Types.ObjectId(act.doneBy);
        });
    }

    try {
        const campaign = await CampaignModel.create(newCampaign);
        return responseGenerator.handleSuccessfullResponse(campaign);
    }
    catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('Campaign');
    }
}


