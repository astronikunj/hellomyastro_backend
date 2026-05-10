# 🌟 Astrolly Backend

> **Production-ready REST API** for the Astrolly astrology mobile application  
> Built with **Node.js · Express.js · MySQL · Sequelize · Socket.IO · Razorpay · Firebase FCM**

---

## 🚀 Quick Start

### 1. Prerequisites
| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| MySQL | ≥ 8.0 |
| npm | ≥ 9.x |

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd astrolly-backend
npm install
```

### 3. Configure Environment
```bash
cp .env .env.local    # or just edit .env directly
```
Fill in all required values in `.env` (see Environment Variables section below).

### 4. Create MySQL Database
```sql
CREATE DATABASE astrolly_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run the Server
```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

The server will automatically sync Sequelize models to the database on startup.

---

## 📖 API Documentation
After starting the server, open:
```
http://localhost:5000/api/docs
```
Interactive Swagger UI is available for all endpoints.

---

## 🏗️ Architecture

```
src/
├── config/          # DB, Socket, Firebase, Cloudinary, Razorpay
├── controllers/     # Business logic (11 controllers)
├── middleware/      # Auth, Admin, Upload, Error, Validate (6 files)
├── models/          # Sequelize models + associations (13 models)
├── routes/          # Express route definitions (11 files)
├── services/        # Reusable services (Socket, Payment, Wallet, Notifications, OTP, Kundli)
├── utils/           # Helpers (tokens, response, asyncHandler, validators, constants)
├── uploads/         # Temp upload directory
├── app.js           # Express app setup
└── server.js        # HTTP server + Socket.IO bootstrap
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `DB_HOST` | MySQL host |
| `DB_NAME` | MySQL database name |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | Access token expiry (e.g. `7d`) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |
| `KUNDLI_API_KEY` | Astrology API key |
| `KUNDLI_API_URL` | Astrology API base URL |

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register user/astrologer |
| POST | `/login` | Email/phone + password login |
| POST | `/send-otp` | Send OTP to phone |
| POST | `/verify-otp` | Verify OTP → get tokens |
| POST | `/refresh-token` | Refresh access token |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset with token |
| POST | `/logout` | Invalidate refresh token |

### Users (`/api/users`) — 🔒 Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update profile |
| POST | `/upload-avatar` | Upload profile image |
| GET | `/favorites` | Get favorite astrologers |
| POST | `/favorites/:id` | Add to favorites |
| DELETE | `/favorites/:id` | Remove from favorites |
| GET | `/notifications` | Get notifications |

### Astrologers (`/api/astrologers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all (public) |
| GET | `/:id` | Get profile (public) |
| POST | `/profile` | Create profile 🔒 |
| PUT | `/profile` | Update profile 🔒 |
| PUT | `/status` | Toggle online/offline 🔒 |
| POST | `/schedule` | Set weekly schedule 🔒 |
| GET | `/earnings` | Earnings dashboard 🔒 |

### Bookings (`/api/bookings`) — 🔒 Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create booking |
| GET | `/` | List bookings |
| GET | `/:id` | Get booking detail |
| PUT | `/:id/accept` | Accept booking |
| PUT | `/:id/reject` | Reject booking |
| PUT | `/:id/cancel` | Cancel booking |
| PUT | `/:id/complete` | Complete booking |

### Wallet (`/api/wallet`) — 🔒 Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get balance |
| POST | `/recharge/create-order` | Create Razorpay order |
| POST | `/recharge/verify` | Verify & credit wallet |
| GET | `/transactions` | Transaction history |
| POST | `/refund` | Issue refund (admin) |

### Admin (`/api/admin`) — 🔒 Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Analytics dashboard |
| GET | `/revenue` | Revenue reports |
| GET | `/users` | All users |
| PUT | `/users/:id/ban` | Ban/unban user |
| GET | `/astrologers/pending` | Pending approvals |
| PUT | `/astrologers/:id/approve` | Approve/reject |
| GET/POST | `/banners` | Banner management |
| GET | `/reports` | User reports |

### Kundli (`/api/kundli`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/horoscope/daily/:sign` | Daily horoscope |
| GET | `/horoscope/weekly/:sign` | Weekly horoscope |
| GET | `/horoscope/monthly/:sign` | Monthly horoscope |
| POST | `/generate` | Generate Kundli 🔒 |
| POST | `/match` | Kundli matching 🔒 |

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `userId` | Register user as online |
| `chat:join` | `{ roomId }` | Join a chat room |
| `chat:message` | `{ roomId, content, type }` | Send message |
| `chat:typing` | `{ roomId, userId, isTyping }` | Typing indicator |
| `call:initiate` | `{ targetUserId, callType, bookingId }` | Start call |
| `call:accepted` | `{ callerId }` | Accept call |
| `call:rejected` | `{ callerId }` | Reject call |
| `call:ended` | `{ roomId }` | End call |

### Server → Client
| Event | Description |
|-------|-------------|
| `user:online` | User came online |
| `user:offline` | User went offline |
| `chat:message` | Incoming message |
| `chat:typing` | Typing indicator |
| `call:incoming` | Incoming call |
| `call:missed` | Missed call notification |

---

## 🗄️ Database Models

| Model | Key Fields |
|-------|-----------|
| `User` | id, name, email, phone, role, isBanned |
| `Astrologer` | userId, chatRate, callRate, isApproved |
| `Booking` | userId, astrologerId, type, status |
| `Chat` | bookingId, roomId, status |
| `Message` | chatId, senderId, type, isRead |
| `Wallet` | userId, balance |
| `WalletTransaction` | walletId, type, amount, balanceBefore/After |
| `Review` | bookingId (unique), rating (1-5) |
| `Notification` | userId, type, isRead |
| `CallHistory` | bookingId, agoraChannelName, durationSeconds |
| `Schedule` | astrologerId, dayOfWeek, startTime, endTime |
| `Banner` | title, imageUrl, position, isActive |
| `Report` | reportedBy, reportedUser, status |

---

## 🛡️ Security Features
- **Helmet** — Security HTTP headers
- **CORS** — Origin whitelist
- **Rate Limiting** — 100 req/15min global, 20 req/15min on auth
- **JWT** — Access + Refresh token pattern
- **bcrypt** — Password hashing (12 rounds)
- **Input Validation** — express-validator on all inputs
- **SQL Injection** — Sequelize ORM parameterized queries
- **XSS** — Helmet CSP headers
- **Row-level locking** — Atomic wallet transactions

---

## 🧪 Postman Collection Structure

Import the following endpoints into Postman:

```
Astrolly API
├── 🔐 Auth
│   ├── POST Register
│   ├── POST Login
│   ├── POST Send OTP
│   ├── POST Verify OTP
│   └── POST Refresh Token
├── 👤 Users
├── 🔮 Astrologers
├── 📅 Bookings
├── 💬 Chat
├── 📞 Calls
├── 💰 Wallet
├── ⭐ Reviews
├── 🔔 Notifications
├── 🛠️ Admin
└── 📊 Kundli
```

---

## 📦 Tech Stack
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MySQL + Sequelize ORM | Database + ORM |
| Socket.IO | Real-time chat & calls |
| Razorpay | Payment gateway |
| Firebase Admin (FCM) | Push notifications |
| Cloudinary | Media storage |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Helmet + Rate-limit | Security |
| Swagger UI | API documentation |

---

## 📄 License
MIT © Astrolly Team
