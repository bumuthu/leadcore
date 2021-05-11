import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    linkedinUrl: String,
    linkedinToken: {
        accessToken: String,
        expiresIn: Number,
        authorizedAt: Schema.Types.Date
    },
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
    activityRecords: [
        new Schema({
            timestamp: Schema.Types.Date,
            doneBy: { type: Schema.Types.ObjectId, ref: 'User' },
            activityType: String
        })
    ],
    notifications: [
        new Schema({
            timestamp: Schema.Types.Date,
            doneBy: { type: Schema.Types.ObjectId, ref: 'User' },
            activityType: String
        })
    ],
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
