import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import { ObjectId } from 'bson';

const responseGenerator = new ResponseGenerator();

export const getCampaignById = async (event, _context) => {
    const campaignsCollecation = (await connectToTheDatabase()).collection('campaigns');

    const id = event.pathParameters.campaignId;

    try {
        const campaign = await campaignsCollecation.findOne({ _id: new ObjectId(id) });
        return responseGenerator.doSuccessfullResponse(campaign);
    } catch {
        return responseGenerator.doDataNotFound('Campaign', id);
    }

}

export const updateCampaignById = async (event, _context) => {
    const campaignsCollecation = (await connectToTheDatabase()).collection('campaigns');

    const id = event.pathParameters.campaignId;
    const updatedCampaign = JSON.parse(event.body);

    try {
        const campaign = await campaignsCollecation.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updatedCampaign }, { returnOriginal: false });
        return responseGenerator.doSuccessfullResponse(campaign);
    }
    catch {
        return responseGenerator.doDataNotFound('Campaign', id);
    }

}

export const createCampaign = async (event, _context) => {
    const campaignsCollecation = (await connectToTheDatabase()).collection('campaigns');

    const newCampaign = JSON.parse(event.body);

    try {
        const campaign = await campaignsCollecation.insertOne(newCampaign);
        return responseGenerator.doSuccessfullResponse(campaign);
    }
    catch {
        return responseGenerator.couldntInsert('Campaign');
    }

}


