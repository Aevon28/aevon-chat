const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: Date,
    name: String,
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupAdmin: mongoose.Schema.Types.ObjectId,
    groupPicture: String,
    groupDescription: String,
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isMuted: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    isArchived: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);