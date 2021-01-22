import mongoose from 'mongoose';
import Campaign from './campaign.interface';

const campaignSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    keywords: String,
    createdBy: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
    },
});

const campaignModel = mongoose.model<Campaign & mongoose.Document>('Campaign', campaignSchema);

export default campaignModel;