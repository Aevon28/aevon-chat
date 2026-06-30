const User = require('../models/User');

const socketEvents = (io, socket) => {
  socket.on('user_online', async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      socket.join(`user_${userId}`);
      io.emit('user_status_changed', { userId, isOnline: true });
    } catch (error) {
      console.error('Error in user_online:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      io.emit('user_disconnected', { socketId: socket.id });
    } catch (error) {
      console.error('Error in disconnect:', error);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, receiverId, content, messageType } = data;

      io.to(`user_${receiverId}`).emit('receive_message', {
        conversationId,
        sender: data.senderId,
        content,
        messageType,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error in send_message:', error);
    }
  });

  socket.on('typing', (data) => {
    try {
      const { receiverId, senderId, conversationId } = data;
      io.to(`user_${receiverId}`).emit('user_typing', {
        conversationId,
        userId: senderId,
        isTyping: true,
      });
    } catch (error) {
      console.error('Error in typing:', error);
    }
  });

  socket.on('stop_typing', (data) => {
    try {
      const { receiverId, senderId, conversationId } = data;
      io.to(`user_${receiverId}`).emit('user_typing', {
        conversationId,
        userId: senderId,
        isTyping: false,
      });
    } catch (error) {
      console.error('Error in stop_typing:', error);
    }
  });

  socket.on('message_read', (data) => {
    try {
      const { messageId, receiverId, senderId } = data;
      io.to(`user_${receiverId}`).emit('message_read_receipt', {
        messageId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error in message_read:', error);
    }
  });

  socket.on('update_status', async (data) => {
    try {
      const { userId, status } = data;
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });

      io.emit('user_status_updated', { userId, status });
    } catch (error) {
      console.error('Error in update_status:', error);
    }
  });

  socket.on('initiate_call', (data) => {
    try {
      const { receiverId, callerId, callType } = data;
      io.to(`user_${receiverId}`).emit('incoming_call', {
        callerId,
        callType,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error in initiate_call:', error);
    }
  });

  socket.on('end_call', (data) => {
    try {
      const { receiverId, callerId } = data;
      io.to(`user_${receiverId}`).emit('call_ended', {
        callerId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error in end_call:', error);
    }
  });

  socket.on('webrtc_signal', (data) => {
    try {
      const { receiverId, signal, type } = data;
      io.to(`user_${receiverId}`).emit('webrtc_signal', {
        signal,
        type,
      });
    } catch (error) {
      console.error('Error in webrtc_signal:', error);
    }
  });
};

module.exports = socketEvents;