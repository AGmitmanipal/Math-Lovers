import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId; // Reference to User
    image?: string; // Optional image for the doubt
    tags: string[];
    likes: mongoose.Types.ObjectId[]; // Array of User IDs who liked
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        content: {
            type: String,
            required: [true, 'Please provide content for your doubt'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        image: {
            type: String, // URL to image if any
        },
        tags: {
            type: [String],
            default: [],
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
