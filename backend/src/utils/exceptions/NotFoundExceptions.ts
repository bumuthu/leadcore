import HttpException from './HttpException';

export class UserNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `User with id ${id} not found`);
    }
}

export class CampaignNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Campaign with id ${id} not found`);
    }
}



