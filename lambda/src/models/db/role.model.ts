import mongoose, { Schema } from 'mongoose';

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

const RoleModel = mongoose.model('Role', roleSchema);

export default RoleModel;