import 'source-map-support/register';
import PricingModel from 'src/models/pricing.model';
import RoleModel from 'src/models/role.model';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';

const responseGenerator = new ResponseGenerator();

export const getRefData = async (event, _context) => {
	await connectToTheDatabase();

    try {
        const users = await RoleModel.find();
        const pricings = await PricingModel.find();

        return responseGenerator.handleSuccessfullResponse({
            users: users,
            pricing: pricings
        });
    } catch {
        return responseGenerator.handleDataNotFound('RefData', 'refadata');
    }
}