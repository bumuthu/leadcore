import PricingDBModel from 'src/models/db/pricing.model';
import RoleDBModel from 'src/models/db/role.model';

export async function hasUserPermission(token: string) {
    let roles = await RoleDBModel.find();
    let pricings = await PricingDBModel.find();


}