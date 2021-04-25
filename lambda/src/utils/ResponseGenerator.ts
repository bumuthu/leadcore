export default class ResponseGenerator {
    private code: number;
    private message: any;

    private getResponse() {
        return {
            statusCode: this.code,
            body: JSON.stringify({
                message: this.message,
            })
        };
    }

    public doSuccessfullResponse(data: any) {
        this.message = data;
        this.code = 200;
        return this.getResponse();
    }

    public doDataNotFound(type: string, id: string) {
        this.message = `${type} data with id ${id} not found`;
        this.code = 400;
        return this.getResponse();
    }

    public couldntInsert(type: string) {
        this.message = `server couldn't insert ${type} data`;
        this.code = 400;
        return this.getResponse();
    }
}
