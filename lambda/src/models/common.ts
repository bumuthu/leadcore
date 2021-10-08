// Role related

export enum RoleType {
    MANAGER = "MANAGER",
    AGENT = "AGENT"
}

export enum RoleActionType {
    MANAGE = "MANAGE",
    CREATE = "CREATE",
    EDIT = "EDIT"
}

export enum RoleEventEntity {
    CHAT = "CHAT",
    CAMPAIGN = "CAMPAIGN",
    PIPELINE = "PIPELINE"
}

export enum TeamType {
    INDIVIDUAL = "INDIVIDUAL",
    TEAM = "TEAM"
}

export interface RolePermissionModel {
    entity: RoleEventEntity,
    actions: RoleActionType[],
    description?: string
}

export interface RoleModel {
    name: RoleType,
    permissions: RolePermissionModel[]
}


// Pricing ralted

export enum PricingType {
    BASIC = "BASIC",
    PERSONAL = "PERSONAL",
    TEAM = "TEAM"
}

export interface PricingFeatureModel {
    name: string,
    value: any,
    description?: string
}

export interface PricingModel {
    name: PricingType,
    price: string,
    features: PricingFeatureModel[]
}


// Customer related

export enum MediaType {
    LINKEDIN = "LINKEDIN",
    EMAIL = "EMAIL",
    PHONE = "PHONE"
}