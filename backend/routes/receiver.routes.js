const express = require('express');
const router = express.Router();
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');
const prisma = require('../prisma/client');

// Define Zod schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Validation middleware using safeParse
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }
  
  // Add the validated data to the request
  req.validatedData = result.data;
  next();
};

// Check if user is a receiver
const isReceiver = (req, res, next) => {
  if (req.user.role !== 'RECEIVER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Receiver role required',
    });
  }
  next();
};

// Protect all receiver routes
router.use(authMiddleware);
router.use(isReceiver);

// Get receiver profile
router.get('/profile', async (req, res) => {
  try {
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver profile not found',
      });
    }

    // Remove password from response
    const { password, ...userData } = receiver.user;
    
    res.status(200).json({
      success: true,
      message: 'Receiver profile retrieved successfully',
      data: {
        ...receiver,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Get receiver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching receiver profile',
    });
  }
});

// Update receiver profile
router.put('/profile', validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, phone, address } = req.validatedData;
    
    // Update user if name is provided
    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
      });
    }
    
    // Update receiver profile
    const updatedReceiver = await prisma.receiver.update({
      where: { userId: req.user.id },
      data: {
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
      },
      include: { user: true },
    });
    
    // Remove password from response
    const { password, ...userData } = updatedReceiver.user;
    
    res.status(200).json({
      success: true,
      message: 'Receiver profile updated successfully',
      data: {
        ...updatedReceiver,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Update receiver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating receiver profile',
    });
  }
});

// Get receiver statistics
router.get('/stats', async (req, res) => {
  try {
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id },
      include: {
        requests: {
          include: {
            donation: true
          }
        }
      }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Calculate statistics
    const totalRequests = receiver.requests.length;
    const acceptedRequests = receiver.requests.filter(r => r.status === 'ACCEPTED').length;
    const completedRequests = receiver.requests.filter(r => r.donation.status === 'COMPLETED').length;
    
    // Calculate points (5 points per completed request)
    const points = completedRequests * 5;

    // Calculate monthly requests
    const monthlyRequests = {};
    receiver.requests.forEach(request => {
      const month = new Date(request.createdAt).toLocaleString('default', { month: 'short' });
      monthlyRequests[month] = (monthlyRequests[month] || 0) + 1;
    });

    // Calculate request categories
    const requestCategories = {};
    receiver.requests.forEach(request => {
      if (request.donation.foodType) {
        requestCategories[request.donation.foodType] = (requestCategories[request.donation.foodType] || 0) + 1;
      }
    });

    // Calculate rank based on points
    const allReceivers = await prisma.receiver.findMany({
      include: {
        requests: {
          include: {
            donation: true
          }
        }
      }
    });

    const receiverRanks = allReceivers.map(r => ({
      id: r.id,
      points: r.requests.filter(req => req.donation.status === 'COMPLETED').length * 5
    })).sort((a, b) => b.points - a.points);

    const rank = receiverRanks.findIndex(r => r.id === receiver.id) + 1;

    res.status(200).json({
      success: true,
      message: 'Receiver statistics retrieved successfully',
      data: {
        totalRequests,
        acceptedRequests,
        completedRequests,
        points,
        rank,
        totalImpact: completedRequests, // Each completed request helps one NGO
        monthlyRequests: Object.entries(monthlyRequests).map(([month, requests]) => ({
          month,
          requests
        })),
        requestCategories: Object.entries(requestCategories).map(([name, value]) => ({
          name,
          value
        }))
      }
    });
  } catch (error) {
    console.error('Get receiver stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching receiver statistics',
    });
  }
});

module.exports = router;