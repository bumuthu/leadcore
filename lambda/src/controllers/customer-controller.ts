import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import CustomerModel from 'src/models/customer.model';

const responseGenerator = new ResponseGenerator();

export const getCustomerById = async (event, _context) => {
	await connectToTheDatabase();

    const id = event.pathParameters.customerId;

    try {
        const customer = await CustomerModel.findById(id);
        return responseGenerator.handleSuccessfullResponse(customer);
    } catch {
        return responseGenerator.handleDataNotFound('Customer', id);
    }
}

export const updateCustomerById = async (event, _context) => {
	await connectToTheDatabase();

    const id = event.pathParameters.customerId;
    const updatedCustomer = JSON.parse(event.body);

    try {
        const customer = await CustomerModel.findOneAndUpdate(id, updatedCustomer, { new: true });
        return responseGenerator.handleSuccessfullResponse(customer);
    } catch {
        return responseGenerator.handleDataNotFound('Customer', id);
    }
}
