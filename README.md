# 🚀 Aevon Chat

A modern, feature-rich WhatsApp-like desktop application built with Electron, React, Node.js, and MongoDB.

## ✨ Features

- 💬 **Real-time Messaging** - Instant messaging with Socket.io
- 📞 **Voice & Video Calls** - WebRTC-powered communication
- 📱 **Status Updates** - Share stories and updates
- 🔐 **Secure Authentication** - JWT-based login system
- 👥 **User Profiles** - Customize your profile
- 🔔 **Notifications** - Real-time push notifications
- 📁 **File Sharing** - Share media and documents

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop** | Electron |
| **Frontend** | React, Redux, Material-UI |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Real-time** | Socket.io, WebRTC |
| **Auth** | JWT |

## 📁 Project Structure

```
aevon-chat/
├── electron/           # Electron main process
├── src/                # React frontend
├── server/             # Express backend
├── public/             # Static assets
└── docs/               # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Aevon28/aevon-chat.git
cd aevon-chat

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Variables

Create `.env` file in root:
```
MONGODB_URI=mongodb://localhost:27017/aevon-chat
JWT_SECRET=your_secret_key_here
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

## 📝 License

MIT License - Aevon 2024

## 👨‍💻 Author

Created by Aevon28

---

**Status**: 🚧 In Development
