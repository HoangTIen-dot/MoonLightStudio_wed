import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    videoProvider: {
      type: String,
      enum: ['vimeo', 'youtube', 'upload'],
      default: 'vimeo',
      required: true,
      index: true,
    },
    videoId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    embedUrl: {
      type: String,
      required: true,
      trim: true,
    },
    videoPublicId: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailPublicId: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
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

videoSchema.index({ projectId: 1, isPublished: 1, displayOrder: 1 });

export type Video = InferSchemaType<typeof videoSchema>;

export const VideoModel = (mongoose.models.Video as Model<Video> | undefined) ?? mongoose.model<Video>('Video', videoSchema);
