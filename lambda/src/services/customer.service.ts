import axios from "axios";
import { EntityService } from "./entity-service";
// import config from 'config';

export default class CustomerService extends EntityService {
    constructor() {
        super();
     }

    scrapeCustomer(profileUrl: string) {
        // const token = config.get("scrapping.session-token")
        // const baseUrl = config.get("scrapping.urls.base-url")
        // const singleUrl = config.get("scrapping.urls.single")

        // return axios.post(baseUrl + singleUrl, {
        //     "sessionToken": token,
        //     "profileUrl": profileUrl
        // })
    }
}   