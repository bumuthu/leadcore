import mongoose, { Schema } from "mongoose";

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

const CustomerModel = mongoose.model('Customer', customerSchema);

export default CustomerModel;