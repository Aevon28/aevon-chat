const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversationId: req.params.conversationId,
    });

    res.json({
      messages: messages.reverse(),
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [body('content', 'Message content is required').notEmpty(), body('receiverId').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content, receiverId, messageType = 'text', attachments = [] } = req.body;

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      const sender = await User.findById(req.user.id);
      if (sender.blockedUsers.includes(receiverId) || receiver.blockedUsers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Cannot send message to this user' });
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, receiverId] },
        isGroup: false,
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user.id, receiverId],
          isGroup: false,
        });
        await conversation.save();
      }

      const message = new Message({
        sender: req.user.id,
        receiver: receiverId,
        content,
        messageType,
        attachments,
        conversationId: conversation._id,
      });

      await message.save();

      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      await message.populate('sender', 'username avatar');
      await message.populate('receiver', 'username avatar');

      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;