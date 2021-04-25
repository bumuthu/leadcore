import HttpException from './HttpException';

export class AuthenticationTokenMissingException extends HttpException {
    constructor() {
        super(401, 'Authentication token missing');
    }
}

export class NotAuthorizedException extends HttpException {
    constructor() {
        super(403, "You're not authorized");
    }
}

export class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(email: string) {
        super(400, `User with email ${email} already exists`);
    }
}

export class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, 'Wrong authentication token');
    }
}

export class WrongCredentialsException extends HttpException {
    constructor() {
        super(401, 'Wrong credentials provided');
    }
}
