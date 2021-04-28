import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
    firstName: String,
    lastName: String,
    score: Number,
    worth: Number,
    media: String,
    stageIdx: Number,
    email: String,
    conversation: [ new Schema({
        timestamp: Schema.Types.Date,
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        message: String
    })],
    nextMessageSuggestions: [String],
    analysis: Schema.Types.Mixed,
    linkedinData: Schema.Types.Mixed
});

const CustomerModel = mongoose.model('Customer', customerSchema);

export default CustomerModel;