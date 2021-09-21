import { Types } from "mongoose";

export namespace db {
    export interface User {
        firstName: String,
        lastName?: String,
        username: String,
        email: String,
        linkedinUrl?: String,
        linkedinToken?: {
            accessToken: String,
            expiresIn: Number,
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
            activityType: String
        }[],
        notifications: {
            timestamp: Date,
            doneBy: User,
            activityType: String
        }[],
    }

    export interface Team {
        pricing: Pricing,
        type: String,
        users: Types.ObjectId[],
        customers: Types.ObjectId[]
    }

    export interface Role {
        name: String,
        permissions: {
            name: String,
            type: String,
            description: String
        }[]
    }

    export interface Pricing {
        name: String,
        price: String,
        features: {
            name: String,
            value: any,
            description: String
        }[]
    }

    export interface Customer {
        firstName: String,
        lastName: String,
        score: Number,
        worth: Number,
        media: String,
        campaigns: {
            campaign: Types.ObjectId,
            stageId: String
        }[],
        team: Team,
        email: String,
        conversation: {
            timestamp: Date,
            sender: User,
            message: String
        }[],
        nextMessageSuggestions: String[],
        analysis: any,
        linkedinData: any
    }

    export interface Campaign {
        status: String,
        name: String,
        keywords: String[],
        stages: {
            name: String
        }[],
        analysis: any,
        roles: {
            role: Types.ObjectId,
            user: Types.ObjectId
        }[],
        customers: {
            customer: String,
            firstName: String,
            lastName: String,
            score: Number,
            worth: Number,
            media: String,
            stageId: String
        }[],
        activityRecords: {
            timestamp: Date,
            doneBy: User,
            activityType: String
        }[]
    }
}