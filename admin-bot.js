const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

const token = '7520922050:AAE-bdCNbYj1GBrqHEoPR8VUecXQvXnS4k8'; // অ্যাডমিন বট টোকেন
const bot = new TelegramBot(token, { polling: true });
const ADMIN_ID = '6925986776';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bitdeen-a1ebe-default-rtdb.firebaseio.com'
});
const db = admin.database();
const tasksRef = db.ref('tasks');

bot.onText(/\/start/, (msg) => {
  if (msg.from.id.toString() === ADMIN_ID) {
    bot.sendMessage(ADMIN_ID, 'অ্যাডমিন বট চালু!');
  }
});

// টাস্ক অ্যাড
bot.onText(/\/addtask (.+) \+(\d+) BDN/, async (msg, match) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;
  const name = match[1];
  const reward = parseInt(match[2]);
  await tasksRef.push({ name, reward });
  bot.sendMessage(ADMIN_ID, `টাস্ক যোগ হয়েছে: \( {name} (+ \){reward} BDN)`);
});

// অন্য কমান্ডস (tasks, removetask, broadcast, stats, addbalance) পূর্বের মতো যোগ করো

console.log('Admin Bot Running');
