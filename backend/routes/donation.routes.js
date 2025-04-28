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

// Add to donor routes
router.get('/accepted-requests', async (req, res) => {
  try {
    const requests = await prisma.donationRequest.findMany({
      where: {
        status: 'ACCEPTED',
        donation: {
          donorId: req.user.donor.id
        }
      },
      include: {
        donation: true,
        receiver: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching accepted requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching accepted requests'
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
        status: 'AVAILABLE' // Added status filter
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

// Add these routes to your donation routes file

/**
 * @route POST /api/donations/:id/request
 * @description Create a request for a donation
 * @access Private (Receivers only)
 */
router.post('/:id/request', isReceiver, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Find donation with donor info
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {  // Added include for donor relationship
        donor: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }
    
    
    
    // Check if donation is available
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot request this donation as it is ${donation.status.toLowerCase()}`,
      });
    }
    
    // Find receiver
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true
      }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver profile not found',
      });
    }
    
    // Check if request already exists
    const existingRequest = await prisma.donationRequest.findFirst({
      where: {
        donationId: id,
        receiverId: receiver.id,
        status: 'PENDING'
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested this donation',
      });
    }
    
    // Create the request
    const request = await prisma.donationRequest.create({
      data: {
        donationId: id,
        receiverId: receiver.id,
        message: message || null,
        status: 'PENDING'
      }
    });
    
      // Create notification for the donor
     const notification= await prisma.notification.create({
        data: {
          userId: donation.donor.userId, // Now properly accessed
          title: "New Donation Request",
          message: `${receiver.user.name} has requested your donation: ${donation.title}`,
          type: "REQUEST_SENT",
          requestId: request.id
        }
      });
    console.log('Notification created:', notification);

    res.status(201).json({
      success: true,
      message: 'Donation request sent successfully',
      data: request
    });
    
  } catch (error) {
    console.error('Create donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating donation request',
    });
  }
});

/**
 * @route DELETE /api/donations/:id/request
 * @description Cancel a request for a donation
 * @access Private (Receivers only)
 */
router.delete('/:id/request', isReceiver, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find receiver
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver profile not found',
      });
    }
    
    // Find the request
    const request = await prisma.donationRequest.findFirst({
      where: {
        donationId: id,
        receiverId: receiver.id,
        status: 'PENDING'
      }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or already processed',
      });
    }
    
    // Delete the request
    await prisma.donationRequest.delete({
      where: { id: request.id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Donation request cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling donation request',
    });
  }
});

/**
 * @route GET /api/donations/:id/request
 * @description Check if user has a pending request for this donation
 * @access Private (Receivers only)
 */
router.get('/:id/request', isReceiver, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find receiver
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver profile not found',
      });
    }
    
    // Find the request
    const request = await prisma.donationRequest.findFirst({
      where: {
        donationId: id,
        receiverId: receiver.id
      }
    });
    
    res.status(200).json({
      success: true,
      hasRequest: !!request,
      requestStatus: request?.status || null,
      data: request || null
    });
    
  } catch (error) {
    console.error('Check donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking donation request',
    });
  }
});

// Change the accepted donations route
router.get('/:userId/accepted', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find donor using the userId from URL params
    const donor = await prisma.donor.findUnique({
      where: { userId: userId }
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    const donations = await prisma.donation.findMany({
      where: {
        donorId: donor.id,
        status: 'CLAIMED'
      },
      include: {
        receiver: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching accepted donations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching accepted donations'
    });
  }
});

/**
 * @route PATCH /api/donations/requests/:requestId/respond
 * @description Donor responds to a donation request (accept/reject)
 * @access Private (Donors only)
 */
router.patch('/requests/:requestId/respond', isDonor, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    
    // Validate action
    if (action !== 'ACCEPT' && action !== 'REJECT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be ACCEPT or REJECT',
      });
    }
    
    // Find the request
    const request = await prisma.donationRequest.findUnique({
      where: { id: requestId },
      include: {
        donation: true,
        receiver: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }
    
    // Check if request is pending
    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}`,
      });
    }
    
    // Get donor
    const donor = await prisma.donor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true
      }
    });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }
    
    // Check if this donor owns the donation
    if (request.donation.donorId !== donor.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to respond to this request',
      });
    }
    
    // Begin transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update request status
      const updatedRequest = await prisma.donationRequest.update({
        where: { id: requestId },
        data: {
          status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
        }
      });
      
      // If accepted, update donation status and assign receiver
      if (action === 'ACCEPT') {
        await prisma.donation.update({
          where: { id: request.donationId },
          data: {
            status: 'CLAIMED',
            receiverId: request.receiverId
          }
        });
        
        // Add 10 points to the donor
        await prisma.donor.update({
          where: { id: donor.id },
          data: {
            points: {
              increment: 10
            }
          }
        });
        
        // Reject all other pending requests for this donation
        await prisma.donationRequest.updateMany({
          where: {
            donationId: request.donationId,
            id: { not: requestId },
            status: 'PENDING'
          },
          data: {
            status: 'REJECTED'
          }
        });
      }
      
      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: request.receiver.userId,
          title: action === 'ACCEPT' ? "Donation Request Accepted" : "Donation Request Rejected",
          message: action === 'ACCEPT' 
            ? `${donor.user.name} has accepted your request for: ${request.donation.title}`
            : `${donor.user.name} has rejected your request for: ${request.donation.title}`,
          type: action === 'ACCEPT' ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED",
          requestId: requestId
        }
      });
      
      return updatedRequest;
    });
    
    res.status(200).json({
      success: true,
      message: `Request ${action === 'ACCEPT' ? 'accepted' : 'rejected'} successfully`,
      data: result
    });
    
  } catch (error) {
    console.error('Respond to donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to donation request',
    });
  }
});

/**
 * @route GET /api/donations/requests/inbox
 * @description Get all incoming donation requests for donor
 * @access Private (Donors only)
 */
router.get('/requests/inbox', isDonor, async (req, res) => {
  try {
    // Find donor
    const donor = await prisma.donor.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }
    
    // Get all donations by this donor
    const donations = await prisma.donation.findMany({
      where: { donorId: donor.id }
    });
    
    const donationIds = donations.map(d => d.id);
    
    // Get all requests for these donations
    const requests = await prisma.donationRequest.findMany({
      where: {
        donationId: { in: donationIds }
      },
      include: {
        donation: true,
        receiver: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
    
  } catch (error) {
    console.error('Get donation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation requests',
    });
  }
});

/**
 * @route GET /api/donations/requests/outbox
 * @description Get all outgoing donation requests from receiver
 * @access Private (Receivers only)
 */
router.get('/requests/outbox', isReceiver, async (req, res) => {
  try {
    // Find receiver
    const receiver = await prisma.receiver.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver profile not found',
      });
    }
    
    // Get all requests by this receiver
    const requests = await prisma.donationRequest.findMany({
      where: {
        receiverId: receiver.id
      },
      include: {
        donation: {
          include: {
            donor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
    
  } catch (error) {
    console.error('Get donation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation requests',
    });
  }
});



module.exports = router;