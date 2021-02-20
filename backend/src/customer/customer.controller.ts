import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../utils/interfaces/controller.interface';
import CustomerModel from './customer.model';
import RequestWithUser from '../utils/interfaces/requestWithUser.interface';
import authMiddleware from '../utils/middleware/auth.middleware';
import { UserNotFoundException } from '../utils/exceptions/NotFoundExceptions';
import CustomerService from './customer.service';

class CustomerController implements Controller {
    path = '/customer';
    router = Router();
    customerService = new CustomerService();
    customer = CustomerModel;

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}/single/:id`, authMiddleware, this.getCustomerById);
        this.router.post(`${this.path}/single`, authMiddleware, this.createCustomer);
        this.router.post(`${this.path}/list`, authMiddleware, this.createCustomersList);
    }

    getCustomerById = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const customer = await this.customer.findById(id);
        if (customer) {
            response.send(customer);
        } else {
            next(new UserNotFoundException(id));
        }
    }

    createCustomer = async (request: Request, response: Response) => {
        const customerData: any = request.body;

        const scrapedData = (await this.customerService.scrapeCustomer(customerData.profileUrl)).data;
        console.log("Scrapped Data = ", scrapedData);

        customerData.linkedinData = scrapedData;

        const createdCustomer = await this.customer.create(customerData);
        response.send(createdCustomer);
    }

    createCustomersList = async (request: Request, response: Response) => {
        const customersData: any = request.body;

        let customersList = [];

        for (const customer of customersData) {
            const scrapedData = (await this.customerService.scrapeCustomer(customer.profileUrl)).data;
            console.log("Scrapped Data = ", scrapedData);

            customer.linkedinData = scrapedData;

            const createdCustomer = await this.customer.create(customer);

            customersList.push(createdCustomer);
        };

        response.send(customersList);
    }

    // private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    //     const userId = request.params.id;
    //     if (userId === request.user._id.toString()) {
    //         const campaigns = await this.customer.find({ author: userId });
    //         response.send(campaigns);
    //     }
    //     next(new NotAuthorizedException());
    // }
}

export default CustomerController;
