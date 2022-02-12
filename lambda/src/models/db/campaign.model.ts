import mongoose, { Document, Schema } from 'mongoose';
import { entity } from '../entities';

export interface CampaignDocument extends Document, entity.Campaign { }

const campaignSchema = new mongoose.Schema({
    status: String,
    name: String,
    keywords: [String],
    stages: [new Schema({
        name: String
    })],
    analysis: Schema.Types.Mixed,
    roles: [new Schema({
        role: {
            type: Schema.Types.ObjectId,
            ref: 'Role'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    })],
    customers: [new Schema({
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer'
        },
        firstName: String,
        lastName: String,
        score: Number,
        worth: Number,
        media: String,
        stageId: Schema.Types.ObjectId
    })],
    activityRecords: [new Schema({
        timestamp: Schema.Types.Date,
        doneBy: { ref: 'User', type: Schema.Types.ObjectId, },
        activityType: String
    })]
});

const CampaignDBModel = mongoose.model<CampaignDocument>('Campaign', campaignSchema);

export default CampaignDBModel;