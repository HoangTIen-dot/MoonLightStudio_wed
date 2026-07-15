export type AdminRole = 'owner' | 'admin';

export type Env = {
  DB: D1Database;
  CLIENT_ORIGIN: string;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_FOLDER?: string;
};

export type AdminSession = {
  userId: string;
  role: AdminRole;
};

export type Variables = {
  admin: AdminSession;
};
