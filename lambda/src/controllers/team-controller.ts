import 'source-map-support/register';
import TeamModel from 'src/models/team.model';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';

const responseGenerator = new ResponseGenerator();

export const getTeamById = async (event, _context) => {
	await connectToTheDatabase();

    const id = event.pathParameters.teamId;
    try {
        const team = await TeamModel.findById(id).populate('pricing').populate('users');
        return responseGenerator.handleSuccessfullResponse(team);
    } catch (e){
        console.log('Handled error', e);
        return responseGenerator.handleDataNotFound('Team', id);
    }
}

export const updateTeamById = async (event, _context) => {
    await connectToTheDatabase();

    const id = event.pathParameters.teamId;
    const newTeam = JSON.parse(event.body);

    try {
        const team = await TeamModel.findByIdAndUpdate(id, newTeam, { new: true });
        return responseGenerator.handleSuccessfullResponse(team);
    } catch(e) {
        console.log('Handled error', e);
        return responseGenerator.handleDataNotFound('Team', id);
    }
}

export const createTeam = async (event, _context) => {
    await connectToTheDatabase();

    const newTeam = JSON.parse(event.body);

    try {
        const team = await TeamModel.create(newTeam);
        return responseGenerator.handleSuccessfullResponse(team);
    } catch (e) {
        console.log('Handled error', e);
        return responseGenerator.handleCouldntInsert('Team');
    }
}