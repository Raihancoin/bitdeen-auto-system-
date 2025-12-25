const TelegramBot = require('node-telegram-bot');
const admin = require('firebase-admin');

const token = '8582457296:AAEuB5SNNRwRch06YOnPQgQVtFqI3KSUfOg'; // ইউজার বট টোকেন
const bot = new TelegramBot(token, { polling: true });

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bitdeen-a1ebe-default-rtdb.firebaseio.com'
});
const db = admin.database();

const MINI_APP_URL = 'https://your-bitdeen-miniapp.vercel.app'; // তোমার Vercel URL

const welcomeKeyboard = {
  inline_keyboard: [
    [{ text: '🚀 Open Bitdeen App', web_app: { url: MINI_APP_URL } }]
  ]
};

bot.onText(/\/start$/, (msg) => {
  const chatId = msg.chat.id.toString();
  db.ref('users/' + chatId).set({
    balance: 0,
    referrals: 0,
    boostLevel: 0,
    lastDaily: 0,
    lastHourly: 0,
    lastFreeBoost: 0
  }).catch(() => {});
  bot.sendMessage(chatId, 'স্বাগতম Bitdeen (BDN)-এ! 🚀', { reply_markup: welcomeKeyboard });
});

bot.onText(/\/start ref_(\d+)/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const referrerId = match[1];

  if (referrerId === chatId) return bot.sendMessage(chatId, 'সেল্ফ রেফারেল না 😅');

  await db.ref('users/' + chatId).set({
    balance: 0,
    referrals: 0,
    boostLevel: 0,
    lastDaily: 0,
    lastHourly: 0,
    lastFreeBoost: 0
  });

  db.ref('users/' + referrerId + '/balance').transaction(current => (current || 0) + 100);
  db.ref('users/' + referrerId + '/referrals').transaction(current => (current || 0) + 1);

  bot.sendMessage(chatId, 'রেফারেলের জন্য ধন্যবাদ! 🚀', { reply_markup: welcomeKeyboard });
  bot.sendMessage(referrerId, 'নতুন রেফারেল! +100 BDN বোনাস! 🎉').catch(() => {});
});

console.log('User Bot Running');        await adminBot.setMyCommands([
            { command: 'admin', description: 'Open admin panel' },
            { command: 'stats', description: 'System statistics' },
            { command: 'users', description: 'User management' },
            { command: 'tasks', description: 'Task management' },
            { command: 'mining', description: 'Mining settings' },
            { command: 'token', description: 'Token settings' },
            { command: 'broadcast', description: 'Broadcast message' }
        ]);
        
        console.log('✅ Admin Bot commands set');
        
        // Get bot info
        const adminBotInfo = await adminBot.getMe();
        console.log(`✅ Admin Bot: @${adminBotInfo.username}`);
        
    } catch (error) {
        console.log('❌ Admin Bot setup failed:', error.message);
    }
    
    console.log('\n🎉 Bot setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm start');
    console.log('2. Visit your Vercel URL');
    console.log('3. Start using the bots!');
    
    process.exit(0);
}

setupBot();
