import User from './User.js';
import Book from './Book.js';
import Order from './Order.js';
import Cart from './Cart.js';
import Message from './Message.js';

// Associations
User.hasMany(Book, { foreignKey: 'sellerId' });
Book.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Order, { foreignKey: 'buyerId' });
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

export { User, Book, Order, Cart, Message };
