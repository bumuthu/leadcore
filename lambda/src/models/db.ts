import { Types } from "mongoose";

export namespace db {
    export interface User {
        firstName: string,
        lastName?: string,
        email: string,
        linkedinUrl?: string,
        linkedinToken?: {
            accessToken: string,
            expiresIn: number,
            authorizedAt: Date
        },
        teams: {
            team: Types.ObjectId,
            role: Types.ObjectId,
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

    export interface Team {
        pricing: Pricing,
        type: string,
        users: Types.ObjectId[],
        customers: Types.ObjectId[]
    }

    export interface Role {
        name: string,
        permissions: {
            name: string,
            type: string,
            description: string
        }[]
    }

    export interface Pricing {
        name: string,
        price: string,
        features: {
            name: string,
            value: any,
            description: string
        }[]
    }

    export interface Customer {
        firstName: string,
        lastName: string,
        score: number,
        worth: number,
        media: string,
        campaigns: {
            campaign: Types.ObjectId,
            stageId: string
        }[],
        team: Team,
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

    export interface Campaign {
        status: string,
        name: string,
        keywords: string[],
        stages: {
            name: string
        }[],
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