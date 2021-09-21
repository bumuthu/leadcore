export default class ResponseGenerator {
    private code: number;
    private response: any;

    private getResponse() {
        return {
            statusCode: this.code,
            body: JSON.stringify({
                ...this.response
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            }
        };
    }

    public handleSuccessfullResponse(data: any) {
        this.response = { payload: data };
        this.code = 200;
        return this.getResponse();
    }

    public handleDataNotFound(type: string, id?: string) {
        this.response = { errorMessage: `${type} data with id ${id} not found` };
        this.code = 400;
        return this.getResponse();
    }

    public handleCouldntInsert(type: string) {
        this.response = { errorMessage: `Server couldn't insert ${type} data` };
        this.code = 400;
        return this.getResponse();
    }

    public handleGenericError(err: string) {
        this.response = { errorMessage: `Server returns error: \n${err}` };
        this.code = 400;
        return this.getResponse();
    }

    public handleBusinessLoginError(err: string) {
        this.response = { errorMessage: `Server returns error: \n${err}` };
        this.code = 500;
        return this.getResponse();
    }

    public handleAuthorizationError() {
        this.response = { errorMessage: `Invalid authorization token` };
        this.code = 401;
        return this.getResponse();
    }

    public handleAuthenticationError(err: any) {
        this.response = {
            errorMessage: "Authentication failed",
            reason: err.reason,
            code: err.code
        };
        this.code = 401;
        return this.getResponse();
    }
}
