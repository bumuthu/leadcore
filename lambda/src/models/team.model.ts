import mongoose, { Schema } from 'mongoose';

const teamSchema = new mongoose.Schema({
    pricing: { type: Schema.Types.ObjectId, ref: 'Pricing' },
    type: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const TeamModel = mongoose.model('Team', teamSchema);

export default TeamModel;