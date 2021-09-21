import 'source-map-support/register';
import ResponseGenerator from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import CampaignModel from 'src/models/db/campaign.model';
import { Types } from 'mongoose';
import CustomerModel from 'src/models/db/customer.model';

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

    const campaignId = event.pathParameters.campaignId;
    const updatedCampaign = JSON.parse(event.body);

    try {
        const orgCampaign: any = await CampaignModel.findById(campaignId);

        if (updatedCampaign.roles) {
            Object.assign({}, updatedCampaign).roles.forEach((rol, i) => {
                updatedCampaign.roles[i].role = Types.ObjectId(rol.role);
                updatedCampaign.roles[i].user = Types.ObjectId(rol.user);
            });
        }

        if (updatedCampaign.activityRecords) {
            delete updatedCampaign.activityRecords;
        }

        if (updatedCampaign.addCustomers && updatedCampaign.addCustomers.length > 0) {
            for (let i = 0; i < updatedCampaign.addCustomers; i++) {
                const customer: any = await CustomerModel.findById(updatedCampaign.addCustomers[i]);

                const customerLite = {
                    customer: Types.ObjectId(customer['_id']),
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    score: customer.score,
                    worth: customer.worth,
                    media: customer.media,
                    stageId: customer.stageId,
                }

                const existingCustomers = orgCampaign.customers;
                existingCustomers.push(customerLite);

                updatedCampaign.customers = existingCustomers;
            }
        }

        if (updatedCampaign.removeCustomers && updatedCampaign.removeCustomers.length > 0) {
            for (let i = 0; i < updatedCampaign.removeCustomers; i++) {

                const existingCustomers = orgCampaign.customers;
                const removeCusIdx = existingCustomers.findIndex(cus => cus.customer == updatedCampaign.removeCustomers[i]);

                if(removeCusIdx != -1) {
                    existingCustomers.splice(removeCusIdx, 1)
                }

                updatedCampaign.customers = existingCustomers;
            }
        }

        const campaignRes = await CampaignModel.findByIdAndUpdate(campaignId, updatedCampaign, { new: true });
        return responseGenerator.handleSuccessfullResponse(campaignRes);
    }
    catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('Campaign', campaignId);
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

    newCampaign.status = 'INACTIVE';
    newCampaign.activityRecords = [];
    newCampaign.customers = [];

    try {
        const campaign = await CampaignModel.create(newCampaign);
        return responseGenerator.handleSuccessfullResponse(campaign);
    }
    catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('Campaign');
    }
}



export const changePipelineStage = async (event, _context) => {
    await connectToTheDatabase();

    const stageChange = JSON.parse(event.body);

    try {
        let campaign = await CampaignModel.findById(stageChange.campaignId);
        const customerIdx = (campaign as any).customers.findIndex(cus => cus.customer == stageChange.customerId);

        (campaign as any).customers[customerIdx].stageId = Types.ObjectId(stageChange.newStageId);
        campaign = await CampaignModel.findByIdAndUpdate(stageChange.campaignId, campaign, { new: true });

        const customer = await CustomerModel.findById(stageChange.customerId);

        (customer as any).stageId = Types.ObjectId(stageChange.newStageId);
        await CustomerModel.findByIdAndUpdate((campaign as any).customers[customerIdx].customer, customer, { new: true });

        return responseGenerator.handleSuccessfullResponse(campaign);

    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('Campaign');
    }

}


