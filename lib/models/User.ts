import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password?: string;
    googleId?: string;
    email?: string;
    createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // Allow multiple nulls (for username-only users)
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: function (this: IUser) { return !this.googleId; }, // Password required only if not Google auth
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);


const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
