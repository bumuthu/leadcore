import User from "./user.interface";

interface Team {
    _id: string;
    type: string;
    pricingPlanId: string;
    users: User[];
}

export default Team;