export enum ErrorCode {
    VALIDATION_ERROR = "ValidationError",
    NOT_AUTHORIZED_ERROR = "NotAuthorizedError",
    DATA_NOT_FOUND_ERROR = "DataNotFoundError",
    USERNAME_EXISTS_EXCEPTION = "UsernameExistsException",
    USER_NOT_CONFIRMED_EXCEPTION = "UserNotConfirmedException",
    DATABASE_OPERATION_ERROR = "DatabaseOperationError",
    USER_SIGN_UP_EXCEPTION = "UserSignUpException",  
    USER_SIGN_OUT_EXCEPTION = "UserSignOutException",
    ACCESS_TOKEN_NULL_EXCEPTION = "AccessTokenNullException",
    LINKEDIN_TOKEN_EXCEPTION = "LinkedinTokenException",
    NOT_IMPLEMENTED_ERROR = "NotImplementedError"
}

class KnownError extends Error {
    public status: number;
    public code: ErrorCode;

    constructor(status: number, code: ErrorCode, message: string) {
        super(message);

        this.status = status;
        this.code = code;
        this.message = message;
    }
}

export class ValidationError extends KnownError {
    constructor(message: string) {
        super(400, ErrorCode.VALIDATION_ERROR, message)
    }
}

export class NotImplementedError extends KnownError {
    constructor(message: string) {
        super(400, ErrorCode.NOT_IMPLEMENTED_ERROR, message);
    }
}

export class BusinessReject extends KnownError {
    constructor(message: string) {
        super(400, ErrorCode.VALIDATION_ERROR, message)
    }
}

export class NotAuthorizedError extends KnownError {
    constructor(message: string) {
        super(403, ErrorCode.NOT_AUTHORIZED_ERROR, message)
    }
}

export class DataNotFoundError extends KnownError {
    constructor(message: string) {
        super(404, ErrorCode.DATA_NOT_FOUND_ERROR, message);
    }
}

export class UserLoginError extends KnownError {
    constructor(message: string, code: ErrorCode) {
        super(401, code, message);
    }
}

export class UserSignUpError extends KnownError {
    constructor(message: string, code: ErrorCode) {
        super(401, code, message);
    }
}

export class UserSignOutError extends KnownError {
    constructor(message: string) {
        super(401, ErrorCode.USER_SIGN_OUT_EXCEPTION, message);
    }
}

export class UserVerificationError extends KnownError {
    constructor(message: string, code: ErrorCode) {
        super(400, code, message);
    }
}

export class UserAuthenticationError extends KnownError {
    constructor(message: string, code: ErrorCode) {
        super(400, code, message);
    }
}

export class UserVerificationResendError extends KnownError {
    constructor(message: string, code: ErrorCode) {
        super(400, code, message);
    }
}

export class AccessTokenNullError extends KnownError {
    constructor(message: string) {
        super(401, ErrorCode.ACCESS_TOKEN_NULL_EXCEPTION, message);
    }
}

export class LinkedinAccessTokenException extends KnownError {
    constructor(message: string) {
        super(401, ErrorCode.LINKEDIN_TOKEN_EXCEPTION, message);
    }
}

export class DatabaseOperationError extends KnownError {
    constructor(message: string) {
        super(500, ErrorCode.DATABASE_OPERATION_ERROR, message);
    }
}


