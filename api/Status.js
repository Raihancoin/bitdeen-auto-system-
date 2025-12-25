export default function handler(request, response) {
  response.status(200).json({
    status: 'online',
    timestamp: Date.now(),
    version: '3.0.0'
  });
}        
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
