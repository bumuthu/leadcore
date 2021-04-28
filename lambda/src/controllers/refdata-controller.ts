import 'source-map-support/register';
import PricingModel from 'src/models/pricing.model';
import RoleModel from 'src/models/role.model';
import ResponseGenerator from 'src/utils/ResponseGenerator';
import connectToTheDatabase from '../utils/MongoConnection';
import rolesJSON from 'reference-data/lc-role.json';
import pricingsJSON from 'reference-data/lc-pricing.json';

const responseGenerator = new ResponseGenerator();

export const getRefData = async (event, _context) => {
    await connectToTheDatabase();

    try {
        let roles = await RoleModel.find();
        let pricings = await PricingModel.find();

        return responseGenerator.handleSuccessfullResponse({
            roles: roles,
            pricing: pricings
        });
    } catch (e) {
        console.log(e);        
        return responseGenerator.handleDataNotFound('RefData', 'refadata');
    }
}

export const resetRefData = async (event, _context) => {
    await connectToTheDatabase();

    try {
        await RoleModel.deleteMany();
        await PricingModel.deleteMany();

        let rolesArr = [];
        let pricingsArr = [];

        rolesJSON['lc-roles'].forEach(r => rolesArr.push(r));
        pricingsJSON['lc-pricing'].forEach(p => pricingsArr.push(p));

        let roles = await RoleModel.insertMany(rolesArr);
        let pricings = await PricingModel.insertMany(pricingsArr);

        return responseGenerator.handleSuccessfullResponse({
            roles: roles,
            pricing: pricings
        });
    } catch (e) {
        console.log(e);
        return responseGenerator.handleDataNotFound('RefData', 'refadata');
    }
}