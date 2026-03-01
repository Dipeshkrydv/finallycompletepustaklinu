import User from './User.js';
import Book from './Book.js';
import Order from './Order.js';
import Cart from './Cart.js';
import Message from './Message.js';
import Feedback from './Feedback.js';
import Otp from './Otp.js';
import AutomationLog from './AutomationLog.js';

// Export all models
export { User, Book, Order, Cart, Message, Feedback, Otp, AutomationLog };

// Define associations
User.hasMany(Book, { foreignKey: 'sellerId', as: 'books' });
Book.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Order, { foreignKey: 'buyerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Book.hasMany(Order, { foreignKey: 'bookId' });
Order.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Message Associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(Cart, { foreignKey: 'buyerId' });
Cart.belongsTo(User, { foreignKey: 'buyerId' });

Book.hasMany(Cart, { foreignKey: 'bookId' });
Cart.belongsTo(Book, { foreignKey: 'bookId' });

User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Default export for safe imports
export default {
  User,
  Book,
  Order,
  Cart,
  Message,
  Feedback,
  Otp,
  AutomationLog,
};
