import mongoose, { Schema } from 'mongoose';
import Campaign from '../interfaces/campaign.interface';

const campaignSchema = new mongoose.Schema({
    name: String,
    keywords: [String],
    stages: [String],
    customers: Schema.Types.Mixed,
    createdBy: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
    },
});

const CampaignModel = mongoose.model<Campaign & mongoose.Document>('Campaign', campaignSchema);

export default CampaignModel;