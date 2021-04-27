import mongoose, { Schema } from 'mongoose';

const pricingSchema = new mongoose.Schema({
    _id: String,
    name: String,
    features: [{
        type: Schema.Types.ObjectId,
        ref: 'Feature'
    }]
});

const PricingModel = mongoose.model('Pricing', pricingSchema);

export default PricingModel;