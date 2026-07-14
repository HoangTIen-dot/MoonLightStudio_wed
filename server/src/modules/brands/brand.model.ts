import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    logoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    logoPublicId: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

brandSchema.index({ isPublished: 1, displayOrder: 1 });

export type Brand = InferSchemaType<typeof brandSchema>;

export const BrandModel = (mongoose.models.Brand as Model<Brand> | undefined) ?? mongoose.model<Brand>('Brand', brandSchema);
