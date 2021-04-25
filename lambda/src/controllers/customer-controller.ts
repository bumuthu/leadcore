import 'source-map-support/register';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import { ObjectId } from 'bson';

const responseGenerator = new ResponseGenerator();

export const getCustomerById = async (event, _context) => {

	const customersCollecation = (await connectToTheDatabase()).collection('customers');

    const id = event.pathParameters.customerId;

    try {
        const customer = await customersCollecation.findOne({ _id: new ObjectId(id) });
        return responseGenerator.doSuccessfullResponse(customer);
    } catch {
        return responseGenerator.doDataNotFound('Customer', id);
    }
}

export const updateCustomerById = async (event, _context) => {

	const customersCollecation = (await connectToTheDatabase()).collection('customers');

    const id = event.pathParameters.customerId;
    const updatedCustomer = JSON.parse(event.body);

    try {
        const customer = await customersCollecation.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updatedCustomer }, { returnOriginal: false });
        return responseGenerator.doSuccessfullResponse(customer);
    } catch {
        return responseGenerator.doDataNotFound('Customer', id);
    }
}
