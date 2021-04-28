import mongoose, { Schema } from 'mongoose';

const campaignSchema = new mongoose.Schema({
    status: String,
    name: String,
    keywords: [String],
    stages: [String],
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
        stageIdx: Number
    })],
    activityRecords: [new Schema({
        timestamp: Schema.Types.Date,
        doneBy: { ref: 'User', type: Schema.Types.ObjectId, },
        activityType: String
    })]
});

const CampaignModel = mongoose.model('Campaign', campaignSchema);

export default CampaignModel;