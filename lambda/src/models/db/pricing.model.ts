import mongoose, { Document, Schema } from 'mongoose';
import { entity } from '../entities';

export interface PricingDocument extends Document, entity.Pricing { }

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

const PricingDBModel = mongoose.model<PricingDocument>('Pricing', pricingSchema);

export default PricingDBModel;