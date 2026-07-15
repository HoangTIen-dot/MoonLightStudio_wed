export type AdminRole = 'owner' | 'admin';

export type Env = {
  DB: D1Database;
  CLIENT_ORIGIN: string;
  JWT_SECRET: string;
  SEED_SECRET?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_ROLE?: AdminRole;
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
