export default function handler(req, res) {
  const tasks = [
    { id: 1, name: "Join Telegram", reward: 100, icon: "telegram" },
    { id: 2, name: "Follow Twitter", reward: 150, icon: "twitter" },
    { id: 3, name: "Subscribe YouTube", reward: 200, icon: "youtube" },
    { id: 4, name: "Invite Friends", reward: 500, icon: "users" },
    { id: 5, name: "Daily Login", reward: 300, icon: "calendar" }
  ];
  
  return res.status(200).json({ 
    success: true, 
    tasks: tasks 
  });
}        }
    ];

    res.status(200).json({
        success: true,
        tasks: tasks,
        total: tasks.length,
        timestamp: Date.now()
    });
}
