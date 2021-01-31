import mongoose, { Schema } from 'mongoose';
import User from './user.interface';

const userSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        linkedinUrl: String,
        linkedinData: Schema.Types.Mixed,
        role: String,
        activityHistory: Schema.Types.Mixed,
        notifications: Schema.Types.Mixed,
        password: {
            type: String,
            get: (): undefined => undefined,
        },
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
