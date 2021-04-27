import mongoose, { Schema } from 'mongoose';

const roleSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    features: [{
        type: Schema.Types.ObjectId,
        ref: 'Feature'
    }]
});

const RoleModel = mongoose.model('Role', roleSchema);

export default RoleModel;