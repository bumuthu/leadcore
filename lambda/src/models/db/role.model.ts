import mongoose, { Document, Schema } from 'mongoose';
import { entity } from '../entities';

export interface RoleDocument extends Document, entity.Role { }

const roleSchema = new mongoose.Schema({
    name: String,
    permissions: [
        new Schema({
            name: String,
            type: String,
            description: String
        })
    ]
});

const RoleDBModel = mongoose.model<RoleDocument>('Role', roleSchema);

export default RoleDBModel;