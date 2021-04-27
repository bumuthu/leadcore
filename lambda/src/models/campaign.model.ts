import mongoose, { Schema } from 'mongoose';

const campaignSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
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
        _id: Schema.Types.ObjectId,
        firstName: String,
        lastName: String,
        score: Number,
        worth: Number,
        media: String,
        stageIdx: Number
    })],
    activityRecords: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
    },
});

const CampaignModel = mongoose.model('Campaign', campaignSchema);

export default CampaignModel;