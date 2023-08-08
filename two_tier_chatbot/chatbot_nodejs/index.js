const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const path = require('path'); // Add this line to import the 'path' module.

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/chatbotdb';

mongoose.connect(mongoDBUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const messageSchema = new mongoose.Schema({
  content: String,
  sender: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('new_message', async (data) => {
    console.log('New message:', data);

    const message = new Message({
      content: data.message,
      sender: data.sender,
    });

    await message.save();

    io.emit('new_message', message);
  });
});

// Add this middleware to serve the static files (index.html and client-side JS) from the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 80;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
