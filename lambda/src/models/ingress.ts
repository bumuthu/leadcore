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

    export interface UserModificationRequest {
        firstName?: string,
        lastName?: string,
        linkedinUrl?: string,
        linkedinToken?: {
            accessToken: string,
            expiresIn: number,
            authorizedAt: Date
        }
    }
}