import 'source-map-support/register';
import ResponseGenerator, { respondError, respondSuccess } from 'src/utils/response-generator';
import CustomerDBModel from 'src/models/db/customer.model';
import CampaignDBModel from 'src/models/db/campaign.model';
import { ingress } from 'src/models/ingress';
import { validateNotNullFields, validateUnnecessaryFields, validationWithEnum } from 'src/validation/utils';
import { MediaType } from 'src/models/common';
import { NotAuthorizedError, ValidationError } from 'src/utils/exceptions';
import TeamDBModel from 'src/models/db/team.model';
import { entity } from 'src/models/entities';
import { UserService } from 'src/services/user-service';

const responseGenerator = new ResponseGenerator();


// CustomerRetrievalHandler
export const getCustomerById = async (event, _context) => {
    try {
        const customerId = event.pathParameters.customerId;
        if (customerId == null) throw new ValidationError("Invalid customer ID");
        let customer: any;

        try {
            customer = await CustomerDBModel.findById(customerId);
        } catch (err) {
            throw new ValidationError("Invalid customer ID");
        }

        if (customer == null) throw new ValidationError("Data not found for the customer ID");
        console.log("Customer DB:", customer);

        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);
        userService.validateUserWithTeamId(user, (customer as any).team.toString());

        return respondSuccess(customer)

    } catch (err) {
        return respondError(err)
    }
}


// NewCustomerHandler
export const createCustomer = async (event, _context) => {
    try {
        const customerCreateRequest: ingress.CustomerCreateRequest = JSON.parse(event.body) as ingress.CustomerCreateRequest;
        console.log(customerCreateRequest);

        validateNotNullFields(customerCreateRequest, ["firstName", "teamId"]);
        validationWithEnum(MediaType, customerCreateRequest, "media");

        if (!customerCreateRequest.campaigns) customerCreateRequest.campaigns = [];
        if (!Array.isArray(customerCreateRequest.campaigns)) throw new ValidationError("Invalid type for [campaign]");

        const team = await TeamDBModel.findById(customerCreateRequest.teamId);
        if (team == null) throw new ValidationError("Invalid team reference");

        const userService = new UserService();
        const user: entity.User = await userService.getUserByToken(event.headers.authorization);
        userService.validateUserWithTeamId(user, customerCreateRequest.teamId);

        const campaigns: entity.Campaign[] = [];
        const stageIds: string[] = [];

        for (const camp of customerCreateRequest.campaigns) {
            if (camp.campaignId == null || camp.stageId == null) throw new ValidationError("Invalid campaign or stage reference");

            const campaign: entity.Campaign = await CampaignDBModel.findById(camp.campaignId);
            if (!campaign.stages.includes(camp.stageId)) throw new ValidationError("Invalid stage reference")

            campaigns.push(campaign);
            stageIds.push(camp.stageId);
        }

        const customer: entity.Customer = await CustomerDBModel.create({ ...customerCreateRequest, team: customerCreateRequest.teamId });

        for (let i = 0; i < campaigns.length; i++) {
            let campUpdated = (campaigns[i] as any)
            campUpdated.customers.push({
                customer: customer.getKey(),
                firstName: customerCreateRequest.firstName,
                lastName: customerCreateRequest.lastName,
                score: customerCreateRequest.score,
                worth: customerCreateRequest.worth,
                media: customerCreateRequest.media,
                stageId: stageIds[i],
            })
            await CampaignDBModel.findByIdAndUpdate(campaigns[i].getKey(), campUpdated, { new: true });
        }

        return respondSuccess(customer)

    } catch (err) {
        return respondError(err)
    }
}


// CustomerUpdateHandler
export const updateCustomerById = async (event, _context) => {
    const id = event.pathParameters.customerId;
    const updatedCustomer = JSON.parse(event.body);

    try {
        if (updatedCustomer.team) {
            delete updatedCustomer.team;
        }
        if (updatedCustomer.campaigns) {
            delete updatedCustomer.campaigns;
        }

        const customer: any = await CustomerDBModel.findByIdAndUpdate(id, updatedCustomer, { new: true });

        if (customer.campaigns && customer.campaigns.length > 0) {
            for (let i = 0; i < customer.campaigns.length; i++) {
                let campaignId = customer.campaigns[i].campaign;

                const campaign: any = await CampaignDBModel.findById(campaignId);

                let customerLiteIdx = campaign.customers.findIndex(cus => cus.customer == id);
                let customerLite = campaign.customers[customerLiteIdx];

                customerLite.firstName = updatedCustomer.firstName;
                customerLite.lastName = updatedCustomer.lastName;
                customerLite.score = updatedCustomer.score;
                customerLite.worth = updatedCustomer.worth;
                customerLite.media = updatedCustomer.media;
                customerLite.stageId = updatedCustomer.stageId;

                campaign.customers[customerLiteIdx] = customerLite;

                await CampaignDBModel.findByIdAndUpdate(campaign['_id'], { customers: campaign.customers }, { new: true })
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
    const ids = event.pathParameters.customerIds.split(',');
    console.log(ids)

    try {
        const customer = await CustomerDBModel.find().where('_id').in(ids);
        return responseGenerator.handleSuccessfullResponse(customer);
    } catch {
        return responseGenerator.handleDataNotFound('Customer', ids);
    }
}


// NewCustomerListHandler
export const createCustomersList = async (event, _context) => {
    const newCustomers = JSON.parse(event.body).customers;

    try {
        let response = [];

        for (let i = 0; i < newCustomers.length; i++) {

            let customer: entity.Customer = await CustomerDBModel.create(newCustomers[i]);
            response.push(customer);

            if (customer.campaigns.length == 1) {
                const campaignId = customer.campaigns[0].campaign;
                const stageId = customer.campaigns[0].stageId;

                let campaign = await CampaignDBModel.findById(campaignId);
                (campaign as any).customers.push({
                    customer: customer.getKey(),
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    score: customer.score,
                    worth: customer.worth,
                    media: customer.media,
                    stageId: stageId,
                })
                await CampaignDBModel.findByIdAndUpdate(campaignId, campaign, { new: true });
            }
        }

        return responseGenerator.handleSuccessfullResponse(response);
    } catch (e) {
        console.log(e);
        return responseGenerator.handleCouldntInsert('Customer');
    }
}