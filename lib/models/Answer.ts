import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswer extends Document {
    content: string;
    image?: string;
    questionId: mongoose.Types.ObjectId; // Reference to Question
    author: mongoose.Types.ObjectId; // Reference to User
    likes: mongoose.Types.ObjectId[]; // Array of User IDs
    createdAt: Date;
    updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
    {
        content: {
            type: String,
            required: [true, 'Please provide an answer'],
        },
        image: {
            type: String,
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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

// Force model rebuild in dev to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Answer;
}

const Answer: Model<IAnswer> = mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);

export default Answer;
