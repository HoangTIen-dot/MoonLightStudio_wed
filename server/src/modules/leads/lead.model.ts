import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { Schema } = mongoose;

const leadSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index({ status: 1, createdAt: -1 });

export type Lead = InferSchemaType<typeof leadSchema>;

export const LeadModel = (mongoose.models.Lead as Model<Lead> | undefined) ?? mongoose.model<Lead>('Lead', leadSchema);
