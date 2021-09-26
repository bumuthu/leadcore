import { AuthType } from "src/services/auth-service";

export namespace ingress {

    export interface LoginInput {
        type: AuthType,
        email?: string,
        password?: string
    }

    export interface SignUpInput {
        type: AuthType,
        firstName: string,
        lastName?: string,
        email?: string,
        linkedinUrl?: string,
        password?: string
    }
}