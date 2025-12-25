// Firebase এবং টেলিগ্রাম সেটআপ
const firebaseConfig = {
    apiKey: "AIzaSyBxQ4EiH_aTCyJm5_VT0cRSDD97F_ObG1o",
    authDomain: "bitdeen-a1ebe.firebaseapp.com",
    databaseURL: "https://bitdeen-a1ebe-default-rtdb.firebaseio.com",
    projectId: "bitdeen-a1ebe",
    storageBucket: "bitdeen-a1ebe.firebasestorage.app",
    messagingSenderId: "957332775205",
    appId: "1:957332775205:web:e34cc38d4d5282adc43acc",
    measurementId: "G-FY8TBYBJ58"
};

// টেলিগ্রাম ওয়েব অ্যাপ ইনিশিয়ালাইজেশন
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// ইউজার ডাটা
let userId = null;
let data = {
    balance: 0,
    referrals: 0,
    boostLevel: 0,
    lastDaily: 0,
    lastHourly: 0,
    lastFreeBoost: 0
};

// DOM Elements
const elements = {
    balance: document.getElementById('token-balance'),
    refCount: document.getElementById('ref-count'),
    boostLevel: document.getElementById('boost-level'),
    boostLevelDisplay: document.getElementById('boost-level-display'),
    multiplier: document.getElementById('multiplier'),
    multiplierDisplay: document.getElementById('multiplier-display'),
    boostCost: document.getElementById('boost-cost'),
    refLink: document.getElementById('ref-link'),
    hourlyTimer: document.getElementById('hourly-timer'),
    progressTimer: document.getElementById('progress-timer'),
    hourlyProgress: document.getElementById('hourly-progress'),
    tasksList: document.getElementById('tasks-list'),
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notification-text')
};

// Notification System
function showNotification(message, type = 'success') {
    elements.notificationText.textContent = message;
    
    if (type === 'error') {
        elements.notification.style.background = 'linear-gradient(135deg, var(--danger), #FF6B81)';
    } else if (type === 'warning') {
        elements.notification.style.background = 'linear-gradient(135deg, var(--primary), #FFAA00)';
    } else {
        elements.notification.style.background = 'linear-gradient(135deg, var(--primary), var(--success))';
    }
    
    elements.notification.style.display = 'flex';
    
    setTimeout(() => {
        elements.notification.style.display = 'none';
    }, 3000);
}

// Confetti Effect
function triggerConfetti() {
    if (typeof confetti !== 'function') return;
    
    confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFAA00', '#6C63FF', '#FFFFFF']
    });
}

// LocalStorage Functions
function saveToLocalStorage() {
    const userData = {
        ...data,
        userId: userId,
        lastUpdated: Date.now()
    };
    localStorage.setItem('bitdeen_user_data', JSON.stringify(userData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('bitdeen_user_data');
    if (saved) {
        const savedData = JSON.parse(saved);
        data = { ...data, ...savedData };
        updateUI();
    }
}

// Generate User ID
function generateUserId() {
    if (tg.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id.toString();
    }
    
    // Generate a random ID if not from Telegram
    const savedId = localStorage.getItem('bitdeen_user_id');
    if (savedId) return savedId;
    
    const newId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bitdeen_user_id', newId);
    return newId;
}

// Update UI
function updateUI() {
    const multiplier = 1 + (data.boostLevel * 0.1);
    elements.balance.textContent = data.balance.toLocaleString();
    elements.refCount.textContent = data.referrals;
    elements.boostLevel.textContent = data.boostLevel;
    elements.boostLevelDisplay.textContent = data.boostLevel;
    elements.multiplier.textContent = `x${multiplier.toFixed(1)}`;
    elements.multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;
    elements.boostCost.textContent = (1000 * Math.pow(2, data.boostLevel)).toLocaleString();
    
    const botUsername = 'bitdeen_bot';
    elements.refLink.textContent = `https://t.me/${botUsername}?start=ref_${userId}`;
    
    updateHourlyProgress();
}

// Hourly Progress Timer
function updateHourlyProgress() {
    const now = Date.now();
    const lastHourly = data.lastHourly || 0;
    const diff = (now - lastHourly) / 60000; // minutes
    const progress = Math.min(diff / 60 * 100, 100);
    
    elements.hourlyProgress.style.width = `${progress}%`;
    
    const hourlyBtn = document.getElementById('hourly-claim');
    
    if (diff >= 60) {
        hourlyBtn.disabled = false;
        elements.hourlyTimer.textContent = '+50 BDN';
        elements.progressTimer.textContent = 'READY!';
    } else {
        hourlyBtn.disabled = true;
        const mins = Math.floor(60 - diff);
        const secs = Math.floor((60 - diff % 1) * 60);
        const timeText = `${mins}:${secs.toString().padStart(2, '0')}`;
        elements.hourlyTimer.textContent = `Ready in ${timeText}`;
        elements.progressTimer.textContent = timeText;
    }
}

// Load Tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const result = await response.json();
        
        if (result.success && result.tasks) {
            displayTasks(result.tasks);
        } else {
            displayDefaultTasks();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        displayDefaultTasks();
    }
}

function displayTasks(tasks) {
    elements.tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-icon">
                <i class="fas fa-${task.icon || 'star'}"></i>
            </div>
            <div class="task-name">${task.name}</div>
            <div class="task-reward">+${task.reward} BDN</div>
            <button class="copy-btn" style="padding: 8px 15px; font-size: 14px;">Complete</button>
        `;
        
        taskCard.querySelector('button').onclick = () => completeTask(task);
        elements.tasksList.appendChild(taskCard);
    });
}

function displayDefaultTasks() {
    const defaultTasks = [
        { id: 1, name: "Join Telegram", reward: 100, icon: "paper-plane" },
        { id: 2, name: "Follow Twitter", reward: 150, icon: "twitter" },
        { id: 3, name: "Subscribe YouTube", reward: 200, icon: "youtube" },
        { id: 4, name: "Invite Friends", reward: 500, icon: "user-friends" },
        { id: 5, name: "Daily Login", reward: 300, icon: "calendar-check" }
    ];
    
    displayTasks(defaultTasks);
}

// Task Completion
function completeTask(task) {
    const reward = Math.floor(task.reward * (1 + data.boostLevel * 0.1));
    data.balance += reward;
    saveToLocalStorage();
    updateUI();
    triggerConfetti();
    showNotification(`+${reward} BDN! Task Completed!`);
}

// Event Handlers
function setupEventHandlers() {
    // Daily Check-In
    document.getElementById('daily-check').onclick = () => {
        const now = Date.now();
        if (!data.lastDaily || now - data.lastDaily > 86400000) {
            const reward = Math.floor(100 * (1 + data.boostLevel * 0.1));
            data.balance += reward;
            data.lastDaily = now;
            saveToLocalStorage();
            updateUI();
            triggerConfetti();
            showNotification(`+${reward} BDN! Daily Claimed!`);
        } else {
            showNotification('Already claimed today!', 'warning');
        }
    };
    
    // Hourly Claim
    document.getElementById('hourly-claim').onclick = () => {
        const now = Date.now();
        if (!data.lastHourly || now - data.lastHourly >= 3600000) {
            const reward = Math.floor(50 * (1 + data.boostLevel * 0.1));
            data.balance += reward;
            data.lastHourly = now;
            saveToLocalStorage();
            updateUI();
            triggerConfetti();
            showNotification(`+${reward} BDN! Hourly Claimed!`);
        } else {
            showNotification('Not ready yet!', 'warning');
        }
    };
    
    // Free Boost
    document.getElementById('free-boost').onclick = () => {
        const now = Date.now();
        if (!data.lastFreeBoost || now - data.lastFreeBoost > 86400000) {
            data.lastHourly = now - 3600000; // +1 hour
            data.balance += 50;
            data.lastFreeBoost = now;
            saveToLocalStorage();
            updateUI();
            triggerConfetti();
            showNotification('+50 BDN & +1 Hour Time Boost!');
        } else {
            showNotification('Free Boost Already Used Today!', 'warning');
        }
    };
    
    // Paid Boost
    document.getElementById('paid-boost').onclick = () => {
        const cost = 1000 * Math.pow(2, data.boostLevel);
        if (data.balance >= cost) {
            data.balance -= cost;
            data.boostLevel += 1;
            saveToLocalStorage();
            updateUI();
            triggerConfetti();
            showNotification(`Boost Level ${data.boostLevel}! +10% Bonus Activated!`);
        } else {
            showNotification('Not Enough BDN!', 'error');
        }
    };
    
    // Copy Referral Link
    document.getElementById('copy-ref').onclick = () => {
        const link = elements.refLink.textContent;
        navigator.clipboard.writeText(link).then(() => {
            showNotification('Referral link copied!');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Referral link copied!');
        });
    };
    
    // Share Referral
    document.getElementById('share-ref').onclick = () => {
        const link = elements.refLink.textContent;
        const text = `🚀 Join Bitdeen and Earn Free BDN Tokens! Earn crypto rewards daily with simple tasks! ${link}`;
        
        if (tg.platform !== 'unknown') {
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
        } else {
            if (navigator.share) {
                navigator.share({
                    title: 'BitDeeN - Earn Crypto',
                    text: text,
                    url: link
                });
            } else {
                navigator.clipboard.writeText(text);
                showNotification('Link copied to clipboard!');
            }
        }
        
        const reward = Math.floor(100 * (1 + data.boostLevel * 0.1));
        data.balance += reward;
        data.referrals += 1;
        saveToLocalStorage();
        updateUI();
        triggerConfetti();
        showNotification(`Referral Shared! +${reward} BDN Bonus!`);
    };
    
    // Airdrop
    document.getElementById('airdrop-btn').onclick = () => {
        showNotification('Airdrop Requested! Processing...');
        triggerConfetti();
    };
    
    // Withdraw
    document.getElementById('withdraw-btn').onclick = () => {
        showNotification('Withdraw Coming Soon!', 'warning');
    };
}

// Initialize App
function initApp() {
    userId = generateUserId();
    
    // Load initial data
    loadFromLocalStorage();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load tasks
    loadTasks();
    
    // Start hourly timer
    setInterval(updateHourlyProgress, 1000);
    
    // Initial UI update
    updateUI();
    
    // Set theme
    tg.setHeaderColor('#0A0A0F');
    tg.setBackgroundColor('#0A0A0F');
    
    showNotification('Welcome to BitDeeN! Start earning now!');
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
      }}

async function getFromFirebase(path) {
  try {
    const response = await axios.get(`${FIREBASE_DB_URL}/${path}.json`);
    return response.data;
  } catch (error) {
    console.log('Firebase get error:', error.message);
    return null;
  }
}

async function updateInFirebase(path, data) {
  try {
    const response = await axios.patch(`${FIREBASE_DB_URL}/${path}.json`, data);
    return response.data;
  } catch (error) {
    console.log('Firebase update error:', error.message);
    return null;
  }
}

// User Bot Commands
userBot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name || `User_${userId}`;
  
  try {
    // Save user to Firebase
    await saveToFirebase(`users/${userId}`, {
      telegramId: userId,
      username: username,
      balance: 0,
      referralCode: `BDN${userId.toString().slice(-6)}`,
      tasksCompleted: 0,
      miningEarnings: 0,
      referralEarnings: 0,
      joinedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      isActive: true,
      lastActive: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    
    const welcomeMsg = `🎉 *Welcome to BitDeeN Token* 🎉\n\n` +
                      `👋 Hello, ${username}!\n\n` +
                      `💰 *Your Balance:* 0 BDN\n` +
                      `🔗 *Referral Code:* BDN${userId.toString().slice(-6)}\n` +
                      `👥 *Referral Bonus:* 15%\n\n` +
                      `*Available Commands:*\n` +
                      `/tasks - Daily tasks\n` +
                      `/mining - Start mining\n` +
                      `/balance - Check balance\n` +
                      `/referral - Your referral link\n` +
                      `/help - Help center`;
    
    await userBot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.log('Start command error:', error);
    await userBot.sendMessage(chatId, 'Welcome to BitDeeN Token! 🚀\nUse /help for available commands.');
  }
});

userBot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const userData = await getFromFirebase(`users/${userId}`);
    
    if (userData) {
      const balanceMsg = `💰 *Your BitDeeN Balance* 💰\n\n` +
                        `*Available:* ${userData.balance || 0} BDN\n` +
                        `*Tasks Completed:* ${userData.tasksCompleted || 0}\n` +
                        `*Mining Earnings:* ${userData.miningEarnings || 0} BDN\n` +
                        `*Referral Earnings:* ${userData.referralEarnings || 0} BDN\n` +
                        `*Total Earned:* ${(userData.balance || 0) + (userData.miningEarnings || 0) + (userData.referralEarnings || 0)} BDN\n\n` +
                        `💡 *Tip:* Complete tasks and invite friends to earn more!`;
      
      await userBot.sendMessage(chatId, balanceMsg, { parse_mode: 'Markdown' });
    } else {
      await userBot.sendMessage(chatId, 'Please use /start to register first.');
    }
  } catch (error) {
    await userBot.sendMessage(chatId, 'Unable to fetch balance. Please try again.');
  }
});

userBot.onText(/\/tasks/, async (msg) => {
  const chatId = msg.chat.id;
  
  const tasks = [
    { id: 1, title: "✅ Join Telegram Channel", reward: 25, emoji: "📢" },
    { id: 2, title: "✅ Follow on Twitter", reward: 30, emoji: "🐦" },
    { id: 3, title: "✅ Invite 1 Friend", reward: 50, emoji: "👥" },
    { id: 4, title: "✅ Daily Check-in", reward: 10, emoji: "📅" }
  ];
  
  let tasksMsg = `📋 *Daily Tasks - Earn BDN* 📋\n\n`;
  
  tasks.forEach((task, index) => {
    tasksMsg += `${task.emoji} *${task.title}*\n🎁 Reward: ${task.reward} BDN\n\n`;
  });
  
  tasksMsg += `*How to complete:*\nSend screenshot after completing task to @bitdeen_support`;
  
  await userBot.sendMessage(chatId, tasksMsg, { parse_mode: 'Markdown' });
});

userBot.onText(/\/mining/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const miningKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⛏️ Start Mining (10 BDN/hr)", callback_data: "start_mining_10" },
          { text: "⚡ Start Mining (25 BDN/hr)", callback_data: "start_mining_25" }
        ],
        [
          { text: "💰 Check Earnings", callback_data: "check_mining" },
          { text: "❌ Stop Mining", callback_data: "stop_mining" }
        ]
      ]
    }
  };
  
  const miningMsg = `⛏️ *BitDeeN Mining System* ⛏️\n\n` +
                   `*Passive Income 24/7*\n\n` +
                   `• Basic: 10 BDN/hour\n` +
                   `• Advanced: 25 BDN/hour\n\n` +
                   `*Features:*\n` +
                   `✅ Auto mining in background\n` +
                   `✅ No need to keep app open\n` +
                   `✅ Withdraw anytime from 2027\n\n` +
                   `Select mining power:`;
  
  await userBot.sendMessage(chatId, miningMsg, { 
    parse_mode: 'Markdown',
    reply_markup: miningKeyboard.reply_markup 
  });
});

// Mining Callbacks
userBot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  
  if (data.startsWith('start_mining_')) {
    const power = parseInt(data.replace('start_mining_', ''));
    
    await saveToFirebase(`mining/${userId}`, {
      userId: userId,
      power: power,
      startedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: 'active',
      totalEarned: 0
    });
    
    await userBot.answerCallbackQuery(callbackQuery.id, {
      text: `✅ Mining started at ${power} BDN/hour!`,
      show_alert: true
    });
    
    await userBot.sendMessage(msg.chat.id, 
      `⛏️ *Mining Started Successfully!* ⛏️\n\n` +
      `*Power:* ${power} BDN/hour\n` +
      `*Started:* ${moment().format('HH:mm:ss')}\n` +
      `*Estimated Daily:* ${power * 24} BDN\n\n` +
      `Mining runs automatically. You'll earn ${power} BDN every hour!`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Admin Bot Commands
adminBot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (userId.toString() !== (process.env.ADMIN_USER_ID || '6925986776')) {
    return adminBot.sendMessage(chatId, '❌ Unauthorized access!');
  }
  
  const adminKeyboard = {
    reply_markup: {
      keyboard: [
        ['📊 System Stats', '👥 Users List'],
        ['📋 Add Task', '💰 Add Balance'],
        ['📢 Broadcast', '⚙️ Settings']
      ],
      resize_keyboard: true
    }
  };
  
  await adminBot.sendMessage(chatId, 
    `🛠️ *Admin Control Panel* 🛠️\n\n` +
    `*Welcome back, Admin!*\n\n` +
    `Select an option below:`,
    { 
      parse_mode: 'Markdown',
      reply_markup: adminKeyboard.reply_markup 
    }
  );
});

adminBot.onText(/📊 System Stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const usersData = await getFromFirebase('users');
    const miningData = await getFromFirebase('mining');
    
    const totalUsers = usersData ? Object.keys(usersData).length : 0;
    const activeMiners = miningData ? Object.keys(miningData).filter(key => 
      miningData[key]?.status === 'active'
    ).length : 0;
    
    let totalBalance = 0;
    if (usersData) {
      Object.values(usersData).forEach(user => {
        totalBalance += user.balance || 0;
      });
    }
    
    await adminBot.sendMessage(chatId,
      `📊 *System Statistics* 📊\n\n` +
      `*Total Users:* ${totalUsers}\n` +
      `*Active Miners:* ${activeMiners}\n` +
      `*Total Balance:* ${totalBalance} BDN\n` +
      `*System Status:* ✅ Online\n` +
      `*Withdrawal:* 🗓️ 2027-01-01\n\n` +
      `*Last Updated:* ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await adminBot.sendMessage(chatId, '❌ Error fetching statistics.');
  }
});

// Auto Mining Calculator (Background)
setInterval(async () => {
  try {
    const miningData = await getFromFirebase('mining');
    
    if (miningData) {
      Object.entries(miningData).forEach(async ([userId, miner]) => {
        if (miner.status === 'active') {
          const startTime = moment(miner.startedAt);
          const hoursPassed = moment().diff(startTime, 'hours', true);
          
          if (hoursPassed >= 1) {
            const earned = miner.power;
            
            // Update user balance
            const userData = await getFromFirebase(`users/${userId}`);
            if (userData) {
              await updateInFirebase(`users/${userId}`, {
                balance: (userData.balance || 0) + earned,
                miningEarnings: (userData.miningEarnings || 0) + earned,
                lastActive: moment().format('YYYY-MM-DD HH:mm:ss')
              });
              
              // Update mining session
              await updateInFirebase(`mining/${userId}`, {
                totalEarned: (miner.totalEarned || 0) + earned,
                lastReward: moment().format('YYYY-MM-DD HH:mm:ss')
              });
            }
          }
        }
      });
    }
  } catch (error) {
    console.log('Auto mining error:', error.message);
  }
}, 60000); // Check every minute

// API Routes
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'BitDeeN Token',
    version: '2.0.0',
    features: [
      'Telegram Bot',
      'Auto Mining',
      'Daily Tasks',
      'Firebase Database',
      '2027 Withdrawal'
    ],
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      users: '/api/users'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    bots: {
      userBot: 'active',
      adminBot: 'active'
    },
    database: 'firebase',
    uptime: process.uptime()
  });
});

app.get('/api/stats', async (req, res) => {
  try {
    const usersData = await getFromFirebase('users');
    const totalUsers = usersData ? Object.keys(usersData).length : 0;
    
    res.json({
      totalUsers: totalUsers,
      systemStatus: 'online',
      version: '2.0.0',
      withdrawalDate: '2027-01-01',
      features: ['tasks', 'mining', 'referral', 'auto-rewards']
    });
  } catch (error) {
    res.json({
      totalUsers: 0,
      systemStatus: 'online',
      version: '2.0.0',
      withdrawalDate: '2027-01-01'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ BitDeeN Server running on port ${PORT}`);
  console.log(`✅ User Bot: Ready`);
  console.log(`✅ Admin Bot: Ready`);
  console.log(`✅ Firebase: Connected via REST API`);
  console.log(`✅ Auto Mining: Active`);
  console.log(`✅ Withdrawal Date: 2027-01-01`);
});

module.exports = app;app.use(express.json());

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
