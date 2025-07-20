import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data
const loadUserData = () => {
  try {
    const dataPath = join(__dirname, 'data', 'users.json');
    const rawData = readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    throw error;
  }
};

// Helper function untuk hash passwords secara batch
const hashPasswords = async (users) => {
  console.log('   🔐 Hashing passwords...');
  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      return {
        ...user,
        password: hashedPassword,
        email_verified_at: user.email_verified_at ? new Date() : null,
        phone_verified_at: user.phone_verified_at ? new Date() : null,
      };
    })
  );
  console.log(`   ✅ Hashed ${hashedUsers.length} passwords`);
  return hashedUsers;
};

// Helper function untuk generate username unik
const generateUniqueUsernames = async (users) => {
  console.log('   👤 Generating unique usernames...');
  const processedUsers = [];

  for (const user of users) {
    let username = user.username || `${user.first_name.toLowerCase()}${user.last_name.toLowerCase()}`;
    let counter = 1;

    // Check if username exists in database atau dalam batch yang sedang diproses
    while ((await prisma.user.findUnique({ where: { username } })) || processedUsers.some((u) => u.username === username)) {
      username = `${user.username || `${user.first_name.toLowerCase()}${user.last_name.toLowerCase()}`}${counter}`;
      counter++;
    }

    processedUsers.push({
      ...user,
      username,
    });
  }

  console.log(`   ✅ Generated ${processedUsers.length} unique usernames`);
  return processedUsers;
};

// Data validation function
const validateUserData = (users) => {
  console.log('   🔍 Validating user data...');

  const errors = [];

  users.forEach((user, index) => {
    // Required fields validation
    if (!user.first_name || user.first_name.length < 1) {
      errors.push(`User ${index + 1}: first_name is required`);
    }
    if (!user.last_name || user.last_name.length < 1) {
      errors.push(`User ${index + 1}: last_name is required`);
    }
    if (!user.email || !user.email.includes('@')) {
      errors.push(`User ${index + 1}: valid email is required`);
    }
    if (!user.password || user.password.length < 6) {
      errors.push(`User ${index + 1}: password must be at least 6 characters`);
    }

    // Length validations
    if (user.first_name && user.first_name.length > 100) {
      errors.push(`User ${index + 1}: first_name too long (max 100 chars)`);
    }
    if (user.email && user.email.length > 255) {
      errors.push(`User ${index + 1}: email too long (max 255 chars)`);
    }
    if (user.username && user.username.length > 50) {
      errors.push(`User ${index + 1}: username too long (max 50 chars)`);
    }
  });

  if (errors.length > 0) {
    console.error('❌ Validation errors:', errors);
    throw new Error(`Data validation failed: ${errors.join(', ')}`);
  }

  console.log('   ✅ All user data validated successfully');
};

export async function seedUsers() {
  console.log('🗑️  Cleaning existing user data...');

  try {
    // Clean existing data dalam transaction
    await prisma.$transaction(async (tx) => {
      await tx.userSetting.deleteMany();
      await tx.user.deleteMany();

      // Reset auto-increment sequences
      await tx.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
      await tx.$executeRawUnsafe(`ALTER SEQUENCE user_settings_id_seq RESTART WITH 1`);
    });

    console.log('✅ Deleted all existing user data and reset sequences.');

    // Load and process data
    const { users } = loadUserData();
    console.log(`📊 Loaded ${users.length} users from JSON`);

    // Validate data
    validateUserData(users);

    // Process users: hash passwords, generate usernames
    const hashedUsers = await hashPasswords(users);
    const processedUsers = await generateUniqueUsernames(hashedUsers);

    console.log('👤 Creating users with bulk operations...');

    // Bulk create users dalam transaction untuk consistency
    const createdUsers = await prisma.$transaction(async (tx) => {
      // Prepare user data untuk bulk insert
      const usersData = processedUsers.map((user) => {
        const { user_setting, ...userData } = user;
        return userData;
      });

      // Bulk create users
      await tx.user.createMany({
        data: usersData,
        skipDuplicates: true,
      });

      // Get created users untuk relationship mapping
      const createdUsers = await tx.user.findMany({
        orderBy: { id: 'asc' },
      });

      // Prepare user settings data
      const userSettingsData = createdUsers.map((user, index) => ({
        user_id: user.id,
        job_notification: processedUsers[index].user_setting?.job_notification ?? true,
        program_notification: processedUsers[index].user_setting?.program_notification ?? true,
        promo_notification: processedUsers[index].user_setting?.promo_notification ?? false,
      }));

      // Bulk create user settings
      await tx.userSetting.createMany({
        data: userSettingsData,
        skipDuplicates: true,
      });

      return createdUsers;
    });

    // Success logging dengan details
    console.log(`   ✅ Created ${createdUsers.length} users successfully`);

    createdUsers.forEach((user) => {
      console.log(`   👤 ${user.first_name} ${user.last_name} (@${user.username}) - ${user.role}`);
    });

    console.log('');
    console.log('📋 Test credentials:');
    console.log('   👨‍💼 Admin: admin@risesocial.org / password123');
    console.log('   👤 User: demo@risesocial.org / password123');
    console.log('   👩‍💼 Sarah: sarah@risesocial.org / password123');
    console.log('');
    console.log('🔐 Security features applied:');
    console.log('   ✅ Password hashing dengan bcrypt (12 rounds)');
    console.log('   ✅ Role system dengan enum [admin, user]');
    console.log('   ✅ Auto-generated unique usernames');
    console.log('   ✅ Complete user profiles dengan verification status');
    console.log('   ✅ User notification settings');
    console.log('   ✅ Data validation dan bulk operations');

    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}
