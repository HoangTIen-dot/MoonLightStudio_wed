import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDatabase } from '../config/database.js';
import { AdminUserModel } from '../modules/auth/admin-user.model.js';

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),
});

async function seedAdmin() {
  const seedEnv = seedEnvSchema.parse(process.env);
  const email = seedEnv.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(seedEnv.ADMIN_PASSWORD, 12);

  await connectDatabase();

  const admin = await AdminUserModel.findOneAndUpdate(
    { email },
    {
      email,
      passwordHash,
      role: 'admin',
    },
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  console.log(`Seeded admin user: ${admin.email}`);
}

try {
  await seedAdmin();
} finally {
  await mongoose.disconnect();
}
