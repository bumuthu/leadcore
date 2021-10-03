import { AuthType } from "src/services/auth-service";
import { PricingType, TeamType } from "./common";

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

    export interface TeamModificationRequest {
        pricing?: PricingType,
        users?: string[],
        customers?: string[]
    }

    export interface TeamCreateRequest {
        pricing: PricingType,
        type: TeamType,
        users?: string[],
        customers?: string[]
    }
}