import 'source-map-support/register';
import ResponseGenerator, { respondError, respondSuccess } from 'src/utils/response-generator';
import connectToTheDatabase from '../utils/mongo-connection';
import CustomerModel from 'src/models/db/customer.model';
import CampaignModel from 'src/models/db/campaign.model';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields, validationWithEnum } from 'src/validation/utils';
import { MediaType } from 'src/models/common';
import { NotAuthorizedError, ValidationError } from 'src/utils/exceptions';
import { getDatabaseKey } from 'src/utils/utils';
import TeamModel from 'src/models/db/team.model';
import { db } from 'src/models/db';
import { UserService } from 'src/services/user-service';

const responseGenerator = new ResponseGenerator();


// CustomerRetrievalHandler
export const getCustomerById = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const customerId = event.pathParameters.customerId;
        if (customerId == null) throw new ValidationError("Invalid customer ID");

        const customer = await CustomerModel.findById(customerId);
        if (customer == null) throw new ValidationError("Invalid customer ID");

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);
        userService.validateUserWithTeamId(user, (customer as any).team.toString());

        return respondSuccess(customer)

    } catch (err) {
        return respondError(err)
    }
}


// NewCustomerHandler
export const createCustomer = async (event, _context) => {
    try {
        await connectToTheDatabase();

        const customerCreateRequest: ingress.CustomerCreateRequest = JSON.parse(event.body) as ingress.CustomerCreateRequest;
        console.log(customerCreateRequest);

        validateNotNullFields(customerCreateRequest, ["firstName", "teamId"]);
        validateUnnecessaryFields(customerCreateRequest, ["pricing", "type", "users", "customers"]);
        validationWithEnum(MediaType, customerCreateRequest, "media");

        if (!Array.isArray(customerCreateRequest.campaigns)) throw new ValidationError("Invalid type for [campaign]");

        const team = await TeamModel.findById(customerCreateRequest.teamId);
        if (team == null) throw new ValidationError("Invalid team reference");

        const userService = new UserService();
        const user: db.User = await userService.getUserByToken(event.headers.authorization);
        userService.validateUserWithTeamId(user, customerCreateRequest.teamId);

        const campaigns = [];
        const stageIds = [];

        for (const camp of customerCreateRequest.campaigns) {
            if (camp.campaignId == null || camp.stageId == null) throw new ValidationError("Invalid campaign or stage reference");

            const campaign = await CampaignModel.findById(camp.campaignId);
            if (!(campaign as any).stages.includes(camp.stageId)) throw new ValidationError("Invalid stage reference")

            campaigns.push(campaign);
            stageIds.push(camp.stageId);
        }

        const customer = await CustomerModel.create(customerCreateRequest);

        for (let i = 0; i < campaigns.length; i++) {
            let campUpdated = (campaigns[i] as any)
            campUpdated.customers.push({
                customer: getDatabaseKey(customer),
                firstName: customerCreateRequest.firstName,
                lastName: customerCreateRequest.lastName,
                score: customerCreateRequest.score,
                worth: customerCreateRequest.worth,
                media: customerCreateRequest.media,
                stageId: stageIds[i],
            })
            await CampaignModel.findByIdAndUpdate(getDatabaseKey(campaigns[i]), campUpdated, { new: true });
        }

        return respondSuccess(customer)

    } catch (err) {
        return respondError(err)
    }
}


// CustomerUpdateHandler
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


// CustomersListRetrievalHandler
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


// NewCustomerListHandler
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