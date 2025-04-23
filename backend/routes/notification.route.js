const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications (protected route)
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log("sup")
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            include: {
                request: {
                    include: {
                        donation: true,
                        receiver: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.status(200).json({
            success: true,
            data: notifications
        });
        
    } catch (error) {
        console.error('[NOTIFICATIONS ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
});

module.exports = router;