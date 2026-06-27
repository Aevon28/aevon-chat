const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversation/:userId1/:userId2', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.userId1, recipient: req.params.userId2 },
        { sender: req.params.userId2, recipient: req.params.userId1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
