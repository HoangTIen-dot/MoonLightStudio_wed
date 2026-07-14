import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailPublicId: {
      type: String,
      required: true,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ isPublished: 1, isFeatured: 1, createdAt: -1 });
projectSchema.index({ brandId: 1, isPublished: 1 });

export type Project = InferSchemaType<typeof projectSchema>;

export const ProjectModel =
  (mongoose.models.Project as Model<Project> | undefined) ?? mongoose.model<Project>('Project', projectSchema);
