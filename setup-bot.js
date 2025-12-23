const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

async function setupBot() {
    console.log('🤖 Setting up Telegram Bots...\n');
    
    // User Bot Setup
    const userBot = new TelegramBot(process.env.USER_BOT_TOKEN);
    
    try {
        // Set commands for user bot
        await userBot.setMyCommands([
            { command: 'start', description: 'Start the bot' },
            { command: 'menu', description: 'Open main menu' },
            { command: 'tasks', description: 'View daily tasks' },
            { command: 'mining', description: 'Start/stop mining' },
            { command: 'referral', description: 'Get referral link' },
            { command: 'balance', description: 'Check balance' },
            { command: 'help', description: 'Get help' }
        ]);
        
        console.log('✅ User Bot commands set');
        
        // Get bot info
        const userBotInfo = await userBot.getMe();
        console.log(`✅ User Bot: @${userBotInfo.username}`);
        
    } catch (error) {
        console.log('❌ User Bot setup failed:', error.message);
    }
    
    // Admin Bot Setup
    const adminBot = new TelegramBot(process.env.ADMIN_BOT_TOKEN);
    
    try {
        // Set commands for admin bot
        await adminBot.setMyCommands([
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
