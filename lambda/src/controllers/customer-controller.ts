import 'source-map-support/register';
import ResponseGenerator from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import CustomerModel from 'src/models/db/customer.model';
import CampaignModel from 'src/models/db/campaign.model';

const responseGenerator = new ResponseGenerator();

export const getCustomerById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.customerId;

    try {
        const customer = await CustomerModel.findById(id);
        return responseGenerator.handleSuccessfullResponse(customer);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('Customer', id);
    }
}

export const updateCustomerById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.customerId;
    const updatedCustomer = JSON.parse(event.body);

    try {
        if (updatedCustomer.team) {
            delete updatedCustomer.team;
        }
        if (updatedCustomer.campaigns) {
            delete updatedCustomer.campaigns;
        }

        const customer: any = await CustomerModel.findByIdAndUpdate(id, updatedCustomer, { new: true });

        if (customer.campaigns && customer.campaigns.length > 0) {
            for (let i = 0; i < customer.campaigns.length; i++) {
                let campaignId = customer.campaigns[i].campaign;

                const campaign: any = await CampaignModel.findById(campaignId);

                let customerLiteIdx = campaign.customers.findIndex(cus => cus.customer == id);
                let customerLite = campaign.customers[customerLiteIdx];

                customerLite.firstName = updatedCustomer.firstName;
                customerLite.lastName = updatedCustomer.lastName;
                customerLite.score = updatedCustomer.score;
                customerLite.worth = updatedCustomer.worth;
                customerLite.media = updatedCustomer.media;
                customerLite.stageId = updatedCustomer.stageId;

                campaign.customers[customerLiteIdx] = customerLite;

                await CampaignModel.findByIdAndUpdate(campaign['_id'], { customers: campaign.customers }, { new: true })
            }
        }
        return responseGenerator.handleSuccessfullResponse(customer);

    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('Customer', id);
    }
}

export const createCustomer = async (event, _context) => {
    await connectToTheDatabase();

    const newCustomer = JSON.parse(event.body);
    console.log(newCustomer);

    try {
        newCustomer.camapigns = []
        const customer = await CustomerModel.create(newCustomer);

        // if (newCustomer.campaigns.length == 1) {
        //     const campaignId = newCustomer.campaigns[0].campaign;
        //     const stageId = newCustomer.campaigns[0].stageId;

        //     let campaign = await CampaignModel.findById(campaignId);
        //     (campaign as any).customers.push({
        //         customer: customer['_id'],
        //         firstName: newCustomer.firstName,
        //         lastName: newCustomer.lastName,
        //         score: newCustomer.score,
        //         worth: newCustomer.worth,
        //         media: newCustomer.media,
        //         stageId: stageId,
        //     })
        //     await CampaignModel.findByIdAndUpdate(campaignId, campaign, {new : true});
        // }

        return responseGenerator.handleSuccessfullResponse(customer);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('Customer');
    }
}

export const getCustomersListByIds = async (event, _context) => {
    await connectToTheDatabase();

    const ids = event.pathParameters.customerIds.split(',');
    console.log(ids)

    try {
        const customer = await CustomerModel.find().where('_id').in(ids);
        return responseGenerator.handleSuccessfullResponse(customer);
    } catch {
        return responseGenerator.handleDataNotFound('Customer', ids);
    }
}

export const createCustomersList = async (event, _context) => {
    await connectToTheDatabase();

    const newCustomers = JSON.parse(event.body).customers;

    try {
        let response = [];

        for (let i = 0; i < newCustomers.length; i++) {

            let customer: any = await CustomerModel.create(newCustomers[i]);
            response.push(customer);

            if (customer.campaigns.length == 1) {
                const campaignId = customer.campaigns[0].campaign;
                const stageId = customer.campaigns[0].stageId;

                let campaign = await CampaignModel.findById(campaignId);
                (campaign as any).customers.push({
                    customer: customer['_id'],
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    score: customer.score,
                    worth: customer.worth,
                    media: customer.media,
                    stageId: stageId,
                })
                await CampaignModel.findByIdAndUpdate(campaignId, campaign, { new: true });
            }
        }

        return responseGenerator.handleSuccessfullResponse(response);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('Customer');
    }
}