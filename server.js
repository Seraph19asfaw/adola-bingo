// Replace with your real ID from @userinfobot
const MESFIN_ADMIN_ID = "8025426736"; 

io.on('connection', (socket) => {
    
    // 1. Handle Deposit Submission
    socket.on('submitDeposit', async (data) => {
        // Sends the player's info and SMS to your Admin view
        console.log(`Deposit Request from ${data.userName}: ${data.smsText}`);
        
        // Notify Mesfin (The Admin)
        io.to(MESFIN_ADMIN_ID).emit('adminNotification', {
            player: data.userName,
            playerId: data.tgId,
            sms: data.smsText
        });
    });

    // 2. The Approval Logic (The "Incredible" Part)
    socket.on('approveByAdmin', async (data) => {
        // Security check: Only Mesfin can approve
        if (socket.handshake.query.adminKey === "SECRET_ADOLA_KEY") { 
            const user = await User.findOne({ tgId: data.playerId });
            if (user) {
                user.balance += parseFloat(data.amount);
                await user.save();
                
                // Tell the player the money is in their wallet!
                io.emit(`balanceUpdate_${data.playerId}`, user.balance);
                console.log(`Approved ${data.amount} for ${user.name}`);
            }
        }
    });
});
