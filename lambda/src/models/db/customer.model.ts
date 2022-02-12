import mongoose, { Document, Schema } from "mongoose";
import { entity } from "../entities";

export interface CustomerDocument extends Document, entity.Customer { }

const customerSchema = new Schema({
    firstName: String,
    lastName: String,
    score: Number,
    worth: Number,
    media: String,
    campaigns: [new Schema({
        campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
        stageId: Schema.Types.ObjectId
    })],
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    email: String,
    conversation: [new Schema({
        timestamp: Schema.Types.Date,
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        message: String
    })],
    nextMessageSuggestions: [String],
    analysis: Schema.Types.Mixed,
    linkedinUrl: String,
    linkedinData: Schema.Types.Mixed
});

const CustomerDBModel = mongoose.model<CustomerDocument>('Customer', customerSchema);

export default CustomerDBModel;