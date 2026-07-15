import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { Schema } = mongoose;

export type AdminRole = 'owner' | 'admin';

const adminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['owner', 'admin'],
      default: 'admin',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type AdminUser = InferSchemaType<typeof adminUserSchema>;

export const AdminUserModel =
  (mongoose.models.AdminUser as Model<AdminUser> | undefined) ?? mongoose.model<AdminUser>('AdminUser', adminUserSchema);
