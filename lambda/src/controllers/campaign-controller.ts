import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import CampaignModel from 'src/models/campaign.model';

const responseGenerator = new ResponseGenerator();

export const getCampaignById = async (event, _context) => {
    await connectToTheDatabase()

    const id = event.pathParameters.campaignId;

    try {
        const campaign = await CampaignModel.findById(id);
        return responseGenerator.handleSuccessfullResponse(campaign);
    } catch {
        return responseGenerator.handleDataNotFound('Campaign', id);
    }
}

export const updateCampaignById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.campaignId;
    const updatedCampaign = JSON.parse(event.body);

    try {
        const campaign = await CampaignModel.findByIdAndUpdate(id, updatedCampaign, { new: true });
        return responseGenerator.handleSuccessfullResponse(campaign);
    }
    catch {
        return responseGenerator.handleDataNotFound('Campaign', id);
    }
}

export const createCampaign = async (event, _context) => {
    await connectToTheDatabase();

    const newCampaign = JSON.parse(event.body);

    try {
        const campaign = await CampaignModel.create(newCampaign);
        return responseGenerator.handleSuccessfullResponse(campaign);
    }
    catch {
        return responseGenerator.handleCouldntInsert('Campaign');
    }
}


