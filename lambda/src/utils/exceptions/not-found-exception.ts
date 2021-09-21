import HttpException from './http-exception';

export class DataNotFoundException extends HttpException {
    constructor(type: string, id: string) {
        super(404, `${type} data with id ${id} not found`);
    }
}



