export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }
    
    try {
        const { userId, type, amount } = req.body;
        
        if (!userId || !type || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Simulate processing claim
        const claimId = 'claim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        res.status(200).json({
            success: true,
            claimId,
            userId,
            type,
            amount,
            status: 'processed',
            timestamp: Date.now(),
            message: 'Claim processed successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
