export default function handler(req, res) {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID is required'
        });
    }
    
    // Generate some demo user data
    const userData = {
        userId,
        balance: Math.floor(Math.random() * 5000) + 1000,
        referrals: Math.floor(Math.random() * 20),
        boostLevel: Math.floor(Math.random() * 5),
        dailyStreak: Math.floor(Math.random() * 30) + 1,
        lastClaim: Date.now() - 3600000 * Math.floor(Math.random() * 10),
        createdAt: Date.now() - 86400000 * Math.floor(Math.random() * 30)
    };
    
    res.status(200).json({
        success: true,
        user: userData,
        timestamp: Date.now()
    });
}
