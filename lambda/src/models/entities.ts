import { Types } from "mongoose";
import { PricingType, RoleType, TeamType } from "./common";

export namespace entity {
    export class Entity {
        _id?: any;
    }

    export interface User extends Entity {
        firstName: string,
        lastName?: string,
        email: string,
        cognitoUserSub: string,
        linkedinUrl?: string,
        linkedinToken?: {
            accessToken: string,
            expiresIn: number,
            authorizedAt: Date
        },
        teams: {
            team: Types.ObjectId,
            role: RoleType,
            campaigns: Types.ObjectId[]
        }[],
        activityRecords: {
            timestamp: Date,
            doneBy: User,
            activityType: string
        }[],
        notifications: {
            timestamp: Date,
            doneBy: User,
            activityType: string
        }[],
    }

    export interface Team extends Entity {
        pricing: PricingType,
        type: TeamType,
        users: Types.ObjectId[],
        customers: Types.ObjectId[]
    }

    export interface Role extends Entity {
        name: string,
        permissions: {
            name: string,
            type: string,
            description: string
        }[]
    }

    export interface Pricing extends Entity {
        name: string,
        price: string,
        features: {
            name: string,
            value: any,
            description: string
        }[]
    }

    export interface Customer extends Entity {
        firstName: string,
        lastName: string,
        score: number,
        worth: number,
        media: string,
        campaigns: {
            campaign: Types.ObjectId,
            stageId: string
        }[],
        team: Types.ObjectId,
        email: string,
        conversation: {
            timestamp: Date,
            sender: User,
            message: string
        }[],
        nextMessageSuggestions: string[],
        analysis: any,
        linkedinData: any
    }

    export interface Campaign extends Entity {
        status: string,
        name: string,
        keywords: string[],
        stages: string[],
        analysis: any,
        roles: {
            role: Types.ObjectId,
            user: Types.ObjectId
        }[],
        customers: {
            customer: string,
            firstName: string,
            lastName: string,
            score: number,
            worth: number,
            media: string,
            stageId: string
        }[],
        activityRecords: {
            timestamp: Date,
            doneBy: User,
            activityType: string
        }[]
    }
}