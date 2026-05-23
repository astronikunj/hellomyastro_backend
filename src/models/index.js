'use strict';

/**
 * Central models index — imports all Sequelize models and
 * defines all associations (One-to-One, One-to-Many, Many-to-Many)
 */

const { sequelize } = require('../config/db');

// Import models
const User = require('./User');
const Astrologer = require('./Astrologer');
const Booking = require('./Booking');
const Chat = require('./Chat');
const Message = require('./Message');
const Wallet = require('./Wallet');
const WalletTransaction = require('./WalletTransaction');
const Review = require('./Review');
const Notification = require('./Notification');
const CallHistory = require('./CallHistory');
const Schedule = require('./Schedule');
const Banner = require('./Banner');
const Report = require('./Report');
const Skill = require('./Skill');
const Gift = require('./Gift');
const AstrologerCategory = require('./AstrologerCategory');
const Blog = require('./Blog');
const Coupon = require('./Coupon');
const WithdrawRequest = require('./WithdrawRequest');
const AstrologerStory = require('./AstrologerStory');

// ==============================================================
// ASSOCIATIONS
// ==============================================================

// --- User <-> Astrologer (One-to-One) ---
User.hasOne(Astrologer, { foreignKey: 'userId', as: 'astrologerProfile' });
Astrologer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Astrologer <-> Skill (Many-to-Many or fields) ---
// Note: Laravel used comma-separated strings for skills in Astrologer model.
// For Node.js, we could use a junction table if needed, but for now we follow the existing pattern or define associations if they exist.

// --- Astrologer <-> AstrologerCategory (Many-to-One) ---
AstrologerCategory.hasMany(Astrologer, { foreignKey: 'astrologerCategoryId', as: 'astrologers' });
Astrologer.belongsTo(AstrologerCategory, { foreignKey: 'astrologerCategoryId', as: 'category' });

// --- Astrologer <-> WithdrawRequest (One-to-Many) ---
Astrologer.hasMany(WithdrawRequest, { foreignKey: 'astrologerId', as: 'withdrawRequests' });
WithdrawRequest.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- Astrologer <-> AstrologerStory (One-to-Many) ---
Astrologer.hasMany(AstrologerStory, { foreignKey: 'astrologerId', as: 'stories' });
AstrologerStory.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- User <-> Wallet (One-to-One) ---
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Wallet <-> WalletTransaction (One-to-Many) ---
Wallet.hasMany(WalletTransaction, { foreignKey: 'walletId', as: 'transactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

// --- User <-> WalletTransaction (One-to-Many) ---
User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'walletTransactions' });
WalletTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- User <-> Booking (One-to-Many) ---
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Astrologer <-> Booking (One-to-Many) ---
Astrologer.hasMany(Booking, { foreignKey: 'astrologerId', as: 'bookings' });
Booking.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- Booking <-> Chat (One-to-One) ---
Booking.hasOne(Chat, { foreignKey: 'bookingId', as: 'chat' });
Chat.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// --- Chat <-> Message (One-to-Many) ---
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

// --- User <-> Message (One-to-Many) ---
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// --- Booking <-> CallHistory (One-to-One) ---
Booking.hasOne(CallHistory, { foreignKey: 'bookingId', as: 'callHistory' });
CallHistory.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// --- User <-> CallHistory (One-to-Many) ---
User.hasMany(CallHistory, { foreignKey: 'userId', as: 'callHistories' });
CallHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Astrologer <-> CallHistory (One-to-Many) ---
Astrologer.hasMany(CallHistory, { foreignKey: 'astrologerId', as: 'callHistories' });
CallHistory.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- Booking <-> Review (One-to-One) ---
Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// --- User <-> Review (One-to-Many) ---
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Astrologer <-> Review (One-to-Many) ---
Astrologer.hasMany(Review, { foreignKey: 'astrologerId', as: 'reviews' });
Review.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- User <-> Notification (One-to-Many) ---
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Astrologer <-> Schedule (One-to-Many) ---
Astrologer.hasMany(Schedule, { foreignKey: 'astrologerId', as: 'schedules' });
Schedule.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- Astrologer <-> User (Chat/Call participants via Booking) ---
User.hasMany(Chat, { foreignKey: 'userId', as: 'chats' });
Chat.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Astrologer.hasMany(Chat, { foreignKey: 'astrologerId', as: 'chats' });
Chat.belongsTo(Astrologer, { foreignKey: 'astrologerId', as: 'astrologer' });

// --- Many-to-Many: User <-> Astrologer (Favorites) ---
User.belongsToMany(Astrologer, {
  through: 'user_favorites',
  foreignKey: 'userId',
  otherKey: 'astrologerId',
  as: 'favoriteAstrologers',
  timestamps: true,
});
Astrologer.belongsToMany(User, {
  through: 'user_favorites',
  foreignKey: 'astrologerId',
  otherKey: 'userId',
  as: 'favoritedByUsers',
  timestamps: true,
});

// --- Reports ---
User.hasMany(Report, { foreignKey: 'reportedBy', as: 'reportsFiled' });
Report.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });

User.hasMany(Report, { foreignKey: 'reportedUser', as: 'reportsReceived' });
Report.belongsTo(User, { foreignKey: 'reportedUser', as: 'reportedUserDetails' });

module.exports = {
  sequelize,
  User,
  Astrologer,
  Booking,
  Chat,
  Message,
  Wallet,
  WalletTransaction,
  Review,
  Notification,
  CallHistory,
  Schedule,
  Banner,
  Report,
  Skill,
  Gift,
  AstrologerCategory,
  Blog,
  Coupon,
  WithdrawRequest,
  AstrologerStory,
};
