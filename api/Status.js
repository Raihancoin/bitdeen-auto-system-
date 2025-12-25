export default function handler(req, res) {
    res.status(200).json({
        status: 'online',
        timestamp: Date.now(),
        version: '2.0.0',
        message: 'BitDeeN Auto System is running'
    });
}  const referrerId = match[1];

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
