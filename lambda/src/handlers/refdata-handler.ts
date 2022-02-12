import 'source-map-support/register';
import PricingDBModel from 'src/models/db/pricing.model';
import RoleDBModel from 'src/models/db/role.model';
import rolesJSON from 'reference-data/lq-role.json';
import pricingsJSON from 'reference-data/lq-pricing.json';
import { respondError, respondSuccess } from 'src/utils/response-generator';
import { RefDataOperationError } from 'src/utils/exceptions';


// RefDataLoadHandler
export const getRefData = async (event, _context) => {
    try {
        let roles = await RoleDBModel.find();
        let pricings = await PricingDBModel.find();

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
    try {
        await RoleDBModel.deleteMany();
        await PricingDBModel.deleteMany();

        const rolesArr = rolesJSON['lq-roles'] as Array<any>
        const pricingsArr = pricingsJSON['lq-pricings'] as Array<any>

        if (rolesArr == null || pricingsArr == null) throw new RefDataOperationError("Reference data not found locally");

        let roles = await RoleDBModel.insertMany(rolesArr);
        let pricings = await PricingDBModel.insertMany(pricingsArr);

        return respondSuccess({
            roles: roles,
            pricing: pricings
        });

    } catch (err) {
        console.log(err);
        return respondError(err)
    }
}