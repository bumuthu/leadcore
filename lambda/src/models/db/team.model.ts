import mongoose, { Schema, Document } from 'mongoose';
import { entity } from '../entities';

export interface TeamDocument extends Document, entity.Team { }

const teamSchema = new mongoose.Schema({
    pricing: String,
    type: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    customers: [{ type: Schema.Types.ObjectId, ref: 'Customer' }]
});

const TeamDBModel = mongoose.model<TeamDocument>('Team', teamSchema);

export default TeamDBModel;