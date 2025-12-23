const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase Setup
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: `firebase-adminsdk@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('✅ Firebase connected');
} catch (error) {
  console.log('⚠️  Using default Firebase config');
}

const db = admin.firestore();
const rtdb = admin.database();

// Telegram Bots
const userBot = new TelegramBot(process.env.USER_BOT_TOKEN, { polling: false });
const adminBot = new TelegramBot(process.env.ADMIN_BOT_TOKEN, { polling: false });

// Webhook setup for Vercel
app.use(express.json());

// User Bot Webhook
app.post(`/bot${process.env.USER_BOT_TOKEN}`, (req, res) => {
  userBot.processUpdate(req.body);
  res.sendStatus(200);
});

// Admin Bot Webhook
app.post(`/bot${process.env.ADMIN_BOT_TOKEN}`, (req, res) => {
  adminBot.processUpdate(req.body);
  res.sendStatus(200);
});

// User Bot Commands
userBot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const welcomeMsg = `🎉 Welcome to BitDeeN Token!\n\n` +
    `Earn BDN tokens by:\n` +
    `✅ Completing daily tasks\n` +
    `⛏️ 24/7 auto mining\n` +
    `👥 Referring friends\n\n` +
    `Use /menu to get started!`;
  
  await userBot.sendMessage(chatId, welcomeMsg);
});

userBot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  
  const menu = {
    reply_markup: {
      keyboard: [
        ['📋 Tasks', '⛏️ Mining'],
        ['👥 Referrals', '💰 Balance'],
        ['🎁 Rewards', '📊 Stats']
      ],
      resize_keyboard: true
    }
  };
  
  await userBot.sendMessage(chatId, 'Main Menu:', menu);
});

// Admin Bot Commands
adminBot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (chatId.toString() !== process.env.ADMIN_USER_ID) {
    return adminBot.sendMessage(chatId, '❌ Unauthorized');
  }
  
  const adminMenu = {
    reply_markup: {
      keyboard: [
        ['📊 System Stats', '👥 User Management'],
        ['📋 Task Control', '⛏️ Mining Settings'],
        ['💰 Token Settings', '⚙️ System Config']
      ],
      resize_keyboard: true
    }
  };
  
  await adminBot.sendMessage(chatId, '🛠️ Admin Panel', adminMenu);
});

// Auto Systems
async function autoTaskSystem() {
  console.log('✅ Auto Task System Running');
  
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      // Create daily tasks
      await createDailyTasks();
    }
  }, 60000);
}

async function autoMiningSystem() {
  console.log('✅ Auto Mining System Running');
  
  setInterval(async () => {
    try {
      const minersRef = db.collection('mining_sessions')
        .where('status', '==', 'active');
      const snapshot = await minersRef.get();
      
      snapshot.forEach(async (doc) => {
        const miner = doc.data();
        const hours = (Date.now() - new Date(miner.lastReward).getTime()) / (1000 * 60 * 60);
        
        if (hours >= 1) {
          const reward = miner.power;
          
          // Update user balance
          await db.collection('users').doc(miner.userId).update({
            balance: admin.firestore.FieldValue.increment(reward)
          });
          
          // Update mining session
          await doc.ref.update({
            lastReward: new Date().toISOString(),
            totalEarned: admin.firestore.FieldValue.increment(reward)
          });
        }
      });
    } catch (error) {
      console.error('Mining error:', error);
    }
  }, 60000); // Check every minute
}

// API Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/stats', async (req, res) => {
  try {
    const usersCount = await db.collection('users').count().get();
    const activeMiners = await db.collection('mining_sessions')
      .where('status', '==', 'active')
      .count()
      .get();
    
    res.json({
      users: usersCount.data().count,
      miners: activeMiners.data().count,
      status: 'active',
      version: '1.0.0',
      withdrawal: '2027-01-01'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Start Server
async function startServer() {
  // Set webhooks for production
  if (process.env.NODE_ENV === 'production') {
    const webhookUrl = `https://${req.headers.host}`;
    await userBot.setWebHook(`${webhookUrl}/bot${process.env.USER_BOT_TOKEN}`);
    await adminBot.setWebHook(`${webhookUrl}/bot${process.env.ADMIN_BOT_TOKEN}`);
    console.log('✅ Webhooks set');
  } else {
    userBot.startPolling();
    adminBot.startPolling();
    console.log('✅ Polling started');
  }
  
  // Start auto systems
  autoTaskSystem();
  autoMiningSystem();
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ User Bot: @bitdeen_bot`);
    console.log(`✅ Admin ID: ${process.env.ADMIN_USER_ID}`);
  });
}

startServer();

module.exports = app;
