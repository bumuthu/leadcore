import mongoose, { Schema } from "mongoose";
import Customer from './customer.interface'

const customerSchema = new Schema({
    linkedinData: {
        type: Schema.Types.Mixed
    },
    profileUrl: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    media: {
        type: String
    },
    worth: {
        type: Number
    },
    conversation: {
        type: []
    },
    pipelineStatus: {
        type: String
    },
    events: {
        type: [Schema.Types.Mixed]
    },
    analysis: {
        type: Schema.Types.Mixed
    }
});

const CustomerModel = mongoose.model<Customer & mongoose.Document>('Customer', customerSchema);

export default CustomerModel;