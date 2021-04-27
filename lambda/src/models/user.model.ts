import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    email: String,
    linkedinUrl: String,
    linkedinAccessToken: String,
    teams: [
        new Schema({
            team: { type: Schema.Types.ObjectId, ref: 'Team' },
            role: { type: Schema.Types.ObjectId, ref: 'Role' },
            campaigns: [new Schema({
                campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
                role: { type: Schema.Types.ObjectId, ref: 'Role' }
            })]
        })
    ],
    activityRecords: { type: Schema.Types.ObjectId, ref: 'Activity' },
    notifications: { type: Schema.Types.ObjectId, ref: 'Activity' },
    analysis: Schema.Types.Mixed,
    linkedinData: Schema.Types.Mixed
});

// userSchema.virtual('fullName').get(function () {
//     return `${this.firstName} ${this.lastName}`;
// });

// userSchema.virtual('posts', {
//     ref: 'Post',
//     localField: '_id',
//     foreignField: 'author',
// });

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
