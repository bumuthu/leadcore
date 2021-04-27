import mongoose, { Schema } from 'mongoose';

const activitySchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    timestamp: Schema.Types.Date,
    doneBy: { type: Schema.Types.ObjectId, ref: 'User' },
    activityType: String
});

const RoleModel = mongoose.model('Activity', activitySchema);

export default RoleModel;