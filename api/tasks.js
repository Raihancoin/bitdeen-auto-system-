export default function handler(req, res) {
    const tasks = [
        {
            id: 1,
            name: "Join Telegram Channel",
            reward: 100,
            description: "Join our official Telegram channel",
            icon: "paper-plane"
        },
        {
            id: 2,
            name: "Follow on Twitter",
            reward: 150,
            description: "Follow us on Twitter/X",
            icon: "twitter"
        },
        {
            id: 3,
            name: "Subscribe YouTube",
            reward: 200,
            description: "Subscribe to our YouTube channel",
            icon: "youtube"
        },
        {
            id: 4,
            name: "Invite 5 Friends",
            reward: 500,
            description: "Invite 5 friends to join BitDeeN",
            icon: "user-friends"
        },
        {
            id: 5,
            name: "Daily Login Streak",
            reward: 300,
            description: "Login for 7 consecutive days",
            icon: "calendar-check"
        }
    ];

    res.status(200).json({
        success: true,
        tasks: tasks,
        total: tasks.length,
        timestamp: Date.now()
    });
}
