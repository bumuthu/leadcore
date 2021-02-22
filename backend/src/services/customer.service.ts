import axios from "axios";
import config from 'config';

export default class CustomerService {
    constructor() { }

    scrapeCustomer(profileUrl: string) {
        const token = config.get("scrapping.session-token")
        const baseUrl = config.get("scrapping.urls.base-url")
        const singleUrl = config.get("scrapping.urls.single")

        return axios.post(baseUrl + singleUrl, {
            "sessionToken": token,
            "profileUrl": profileUrl
        })
    }
}   