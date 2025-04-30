const express = require('express');
const router = express.Router();
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');
const prisma = require('../prisma/client');

const createDonationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  foodType: z.string().min(2, 'Food type must be at least 2 characters'),
  quantity: z.number().positive('Quantity must be a positive number'),
  quantityUnit: z.string().optional(),
  pickupAddress: z.string().min(5, 'Please provide a valid pickup address'),
  pickupDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid pickup date',
  }),
  expirationDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid expiration date',
  }).optional(),
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

// Check if user is a donor
const isDonor = (req, res, next) => {
  if (req.user.role !== 'DONOR') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Donor role required',
    });
  }
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

// Protect all donation routes
router.use(authMiddleware);

/**
 * @route POST /api/donations
 * @description Create a new food donation
 * @access Private (Donors only)
 */
router.post('/', isDonor, validate(createDonationSchema), async (req, res) => {
  try {
    const {
      title,
      description,
      foodType,
      quantity,
      quantityUnit,
      pickupAddress,
      pickupDate,
      expirationDate,
    } = req.validatedData;

    // Find donor associated with the user
    const donor = await prisma.donor.findUnique({
      where: { userId: req.user.id },
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        title,
        description,
        foodType,
        quantity,
        quantityUnit: quantityUnit || 'kg',
        pickupAddress,
        pickupDate: new Date(pickupDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        donorId: donor.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: donation,
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating donation',
    });
  }
});

/**
 * @route GET /api/donations
 * @description Get all donations (with filters)
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { status, foodType } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (foodType) {
      filter.foodType = foodType;
    }
    
    // Get donations
    const donations = await prisma.donation.findMany({
      where: filter,
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        receiver: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donations',
    });
  }
});

/**
 * @route GET /api/donations/:id
 * @description Get a single donation by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the donation
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        receiver: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }
    
    // Check if user has permission to view this donation
    if (req.user.role === 'DONOR') {
      const donor = await prisma.donor.findUnique({
        where: { userId: req.user.id },
      });
      
      if (donation.donorId !== donor?.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this donation',
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation',
    });
  }
});

/**
 * @route PATCH /api/donations/:id/cancel
 * @description Cancel a donation
 * @access Private (Donor only)
 */
router.patch('/:id/cancel', isDonor, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the donation
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: true,
      },
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }
    
    // Get donor
    const donor = await prisma.donor.findUnique({
      where: { userId: req.user.id },
    });
    
    // Verify ownership
    if (donation.donorId !== donor?.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this donation',
      });
    }
    
    // Check if donation can be cancelled
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Donation cannot be cancelled because it is ${donation.status.toLowerCase()}`,
      });
    }
    
    // Cancel the donation
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully',
      data: updatedDonation,
    });
  } catch (error) {
    console.error('Cancel donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling donation',
    });
  }
});

/**
 * @route GET /api/donations/all/available
 * @description Get all available donations for receivers
 * @access Private (Receivers only)
 */
router.get('/all/available', isReceiver, async (req, res) => {
  try {
    // Find receiver associated with the user
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver profile not found',
      });
    }

    // Query all available donations
    const availableDonations = await prisma.donation.findMany({
      where: { 
        status: 'AVAILABLE',
        // Only show donations that haven't expired
        expirationDate: {
          gte: new Date()
        }
      },
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: availableDonations.length,
      data: availableDonations,
    });
  } catch (error) {
    console.error('Get available donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available donations',
    });
  }
});

/**
 * @route GET /api/donations/all/me
 * @description Get logged in user's donations
 * @access Private
 */
router.get('/all/me', async (req, res) => {
  try {
    // Find all donations by user based on role
    if (req.user.role === 'DONOR') {
      const donor = await prisma.donor.findUnique({
        where: { userId: req.user.id },
      });
      
      if (!donor) {
        return res.status(404).json({
          success: false,
          message: 'Donor profile not found',
        });
      }
      
      const donations = await prisma.donation.findMany({
        where: { donorId: donor.id },
        orderBy: { createdAt: 'desc' },
      });
      
      return res.status(200).json({
        success: true,
        count: donations.length,
        data: donations,
      });
    } else if (req.user.role === 'RECEIVER') {
      const receiver = await prisma.receiver.findUnique({
        where: { userId: req.user.id },
      });
      
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: 'Receiver profile not found',
        });
      }
      
      const donations = await prisma.donation.findMany({
        where: { receiverId: receiver.id },
        orderBy: { createdAt: 'desc' },
      });
      
      return res.status(200).json({
        success: true,
        count: donations.length,
        data: donations,
      });
    }
    
    // Should not reach here if middleware is working correctly
    return res.status(400).json({
      success: false,
      message: 'Invalid user role',
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donations',
    });
  }
});

module.exports = router;