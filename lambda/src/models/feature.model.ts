import mongoose, { Schema } from 'mongoose';

const featureSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    type: String,
    description: String
});

const FeatureModel = mongoose.model('Feature', featureSchema);

export default FeatureModel;