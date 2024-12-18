import Customer from "./customer.interface";
import User from "./user.interface";

export default interface Campaign {
    name: string;
    id: string;
    stages: string[];
    keywords: string[];
    customers: Customer;
    createdBy: User;
}