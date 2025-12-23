// Load system statistics
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        document.getElementById('totalUsers').textContent = data.users || '0';
        document.getElementById('activeMiners').textContent = data.miners || '0';
    } catch (error) {
        console.log('Error loading stats:', error);
    }
}

// Countdown to 2027
function updateCountdown() {
    const targetDate = new Date('2027-01-01T00:00:00');
    const now = new Date();
    const diff = targetDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdown').textContent = 
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Initialize
loadStats();
setInterval(loadStats, 30000); // Refresh every 30 seconds

updateCountdown();
setInterval(updateCountdown, 1000);
