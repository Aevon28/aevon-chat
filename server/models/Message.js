const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'video'],
      default: 'text',
    },
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    reactions: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        emoji: String,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);