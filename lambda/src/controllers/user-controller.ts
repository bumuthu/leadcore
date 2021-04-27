import 'source-map-support/register';
import TeamModel from 'src/models/team.model';
import UserModel from 'src/models/user.model';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';

const responseGenerator = new ResponseGenerator();

export const getUserById = async (event, _context) => {
	await connectToTheDatabase();

    const id = event.pathParameters.customerId;

    try {
        const user = await UserModel.findById(id);
        return responseGenerator.handleSuccessfullResponse(user);
    } catch {
        return responseGenerator.handleDataNotFound('User', id);
    }
}

export const updateUserById = async (event, _context) => {
	await connectToTheDatabase();

    const id = event.pathParameters.userId;
    const updatedUser = JSON.parse(event.body);

    try {
        const user = await UserModel.findOneAndUpdate(id, updatedUser, { new: true });
        return responseGenerator.handleSuccessfullResponse(user);
    } catch {
        return responseGenerator.handleDataNotFound('User', id);
    }
}

export const createUser = async (event, _context) => {
	await connectToTheDatabase();

    const newUser = JSON.parse(event.body);
    console.log(newUser);
    
    try {
        const user = await UserModel.create(newUser);
        return responseGenerator.handleSuccessfullResponse(user);
    } catch (err) {
        console.log(err);
        return responseGenerator.handleCouldntInsert('User');
    }
}
