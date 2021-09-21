import PricingModel from 'src/models/db/pricing.model';
import RoleModel from 'src/models/db/role.model';

export async function hasUserPermission(token: string) {
    let roles = await RoleModel.find();
    let pricings = await PricingModel.find();


}