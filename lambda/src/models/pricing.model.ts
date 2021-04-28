import mongoose, { Schema } from 'mongoose';

const pricingSchema = new mongoose.Schema({
    name: String,
    price: String,
    features: [
        new Schema({
            name: String,
            value: Schema.Types.Mixed,
            description: String
        })
    ]
});

const PricingModel = mongoose.model('Pricing', pricingSchema);

export default PricingModel;