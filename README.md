# 🚀 Rise Social Backend

Backend API untuk platform Rise Social menggunakan Fastify, Prisma, dan PostgreSQL.

## 📋 Prerequisites

- Node.js v18 atau lebih baru
- PostgreSQL database
- npm atau yarn

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `env.example` ke `.env` dan isi dengan konfigurasi database:
```bash
cp env.example .env
```

Edit file `.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/rise_social"
PORT=3001
NODE_ENV=development
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database (untuk development)
npm run db:push

# Atau jalankan migration (untuk production)
npm run db:migrate

# Buka Prisma Studio untuk melihat data
npm run db:studio
```

### 4. Start Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

## 📝 API Testing Examples

### Create User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Users
```bash
curl http://localhost:3001/api/users
```

## 🗄️ Database Schema

### User Model
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.js          # Database connection
│   └── server.js              # Main server file
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
├── env.example
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server dengan nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema ke database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🔒 Security Notes

⚠️ **PERINGATAN**: Saat ini password disimpan sebagai plain text untuk testing. 
Untuk production, gunakan bcrypt untuk hashing password.

## 🐛 Troubleshooting

### Database Connection Error
1. Pastikan PostgreSQL running
2. Cek connection string di `.env`
3. Pastikan database `rise_social` sudah dibuat

### Port Already in Use
```bash
# Ganti port di .env file
PORT=3002
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
``` 