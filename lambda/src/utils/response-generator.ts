export default class ResponseGenerator {
    private code: number;
    private message: any;

    private getResponse() {
        return {
            statusCode: this.code,
            body: JSON.stringify({
                message: this.message,
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            }
        };
    }

    public handleSuccessfullResponse(data: any) {
        this.message = data;
        this.code = 200;
        return this.getResponse();
    }

    public handleDataNotFound(type: string, id?: string) {
        this.message = `${type} data with id ${id} not found`;
        this.code = 400;
        return this.getResponse();
    }

    public handleCouldntInsert(type: string) {
        this.message = `Server couldn't insert ${type} data`;
        this.code = 400;
        return this.getResponse();
    }

    public handleGenericError(err: string) {
        this.message = `Server returns error: \n${err}`;
        this.code = 400;
        return this.getResponse();
    }

    public handleBusinessLoginError(err: string) {
        this.message = `Server returns error: \n${err}`;
        this.code = 500;
        return this.getResponse();
    }

    public handleAuthorizationError() {
        this.message = `Invalid authorization token`;
        this.code = 401;
        return this.getResponse();
    }

    public handleAuthenticationError(err: any) {
        this.message = {
            message: "Authentication failed",
            reason: err.message,
            code: err.code
        };
        this.code = 401;
        return this.getResponse();
    }
}
