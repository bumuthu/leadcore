import 'source-map-support/register';
import PricingModel from 'src/models/db/pricing.model';
import RoleModel from 'src/models/db/role.model';
import connectToTheDatabase from '../utils/mongo-connection';
import rolesJSON from 'reference-data/lq-role.json';
import pricingsJSON from 'reference-data/lq-pricing.json';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import { RefDataOperationError } from 'src/utils/exceptions';


// RefDataLoadHandler
export const getRefData = async (event, _context) => {
    await connectToTheDatabase();

    try {
        let roles = await RoleModel.find();
        let pricings = await PricingModel.find();

        return respondSuccess({
            roles: roles,
            pricing: pricings
        });

    } catch (err) {
        console.log(err);
        return respondError(err);
    }
}


// RefDataResetHandler
export const resetRefData = async (event, _context) => {
    await connectToTheDatabase();

    try {
        await RoleModel.deleteMany();
        await PricingModel.deleteMany();

        const rolesArr = rolesJSON['lq-roles'] as Array<any>
        const pricingsArr = pricingsJSON['lq-pricings'] as Array<any>

        if (rolesArr == null || pricingsArr == null) throw new RefDataOperationError("Reference data not found locally");

        let roles = await RoleModel.insertMany(rolesArr);
        let pricings = await PricingModel.insertMany(pricingsArr);

        return respondSuccess({
            roles: roles,
            pricing: pricings
        });

    } catch (err) {
        console.log(err);
        return respondError(err)
    }
}