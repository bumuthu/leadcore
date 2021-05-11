import mongoose, { Schema } from 'mongoose';

const teamSchema = new mongoose.Schema({
    pricing: { type: Schema.Types.ObjectId, ref: 'Pricing' },
    type: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    customers: [{ type: Schema.Types.ObjectId, ref: 'Customer' }]
});

const TeamModel = mongoose.model('Team', teamSchema);

export default TeamModel;