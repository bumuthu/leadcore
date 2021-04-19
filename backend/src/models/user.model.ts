import mongoose, { Schema } from 'mongoose';
import User from '../interfaces/user.interface';

const userSchema = new Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        linkedinUrl: String,
        linkedinAccessToken: String,
        campaigns: [new Schema({
            campaignId: String,
            roleId: String
        })],
        conversation: [
            new Schema({
                timestamp: Schema.Types.Date,
                sender: Schema.Types.ObjectId,
                reciever: Schema.Types.ObjectId,
                message: String
            })
        ],
        linkedinData: Schema.Types.Mixed,
        activityHistory: Schema.Types.Mixed,
        notifications: Schema.Types.Mixed,
    },
    {
        toJSON: {
            virtuals: true,
            getters: true,
        },
    },
);

// userSchema.virtual('fullName').get(function () {
//     return `${this.firstName} ${this.lastName}`;
// });

// userSchema.virtual('posts', {
//     ref: 'Post',
//     localField: '_id',
//     foreignField: 'author',
// });

const UserModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default UserModel;
