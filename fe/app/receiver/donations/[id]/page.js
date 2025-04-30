"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  PackageOpen, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  ArrowLeft,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ReceiverDonationDetails() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        // Get token from localStorage or from context
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch donation details
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setDonation(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching donation:", error);
        setError("Failed to load donation details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonation();
  }, [id, router]);

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Claim donation
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/${id}/claim`,
        {}, // Empty body as backend finds receiver from token
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state with the returned donation data
        setDonation(response.data.data);
      }
    } catch (error) {
      console.error("Error claiming donation:", error);
      setError(
        error.response?.data?.message || 
        "Failed to claim donation. Please try again later."
      );
    } finally {
      setIsClaiming(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "CLAIMED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          Donation not found.
        </div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{donation.title}</CardTitle>
              <CardDescription className="text-lg mt-1">{donation.foodType}</CardDescription>
            </div>
            <Badge className={`text-sm px-3 py-1 ${getStatusBadgeColor(donation.status)}`}>
              {donation.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {donation.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{donation.description}</p>
            </div>
          )}

          {/* Details */}
          <div>
            <h3 className="text-lg font-medium mb-3">Donation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <PackageOpen className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Quantity</div>
                  <div>{donation.quantity} {donation.quantityUnit}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Pickup Date</div>
                  <div>{formatDate(donation.pickupDate)}</div>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Pickup Address</div>
                  <div>{donation.pickupAddress}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Created At</div>
                  <div>{formatDate(donation.createdAt)}</div>
                </div>
              </div>

              {donation.donor && (
                <div className="flex items-start">
                  <User className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Donor</div>
                    <div>{donation.donor.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Claim Status */}
          {donation.status === "CLAIMED" && donation.receiver && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-800">Claimed by</h4>
                  <p className="text-blue-700">
                    {donation.receiverId === user?.id ? 'You' : donation.receiver.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
          {/* Claim button - only show if donation is AVAILABLE */}
          {donation.status === "AVAILABLE" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Claim Donation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Claim</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to claim this donation? By claiming, you are committing to
                    pick up and distribute the items as described.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClaim} 
                    disabled={isClaiming} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isClaiming ? 'Processing...' : 'Confirm Claim'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Information for non-available donations */}
          {donation.status !== "AVAILABLE" && donation.status !== "CLAIMED" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-gray-500 italic">
                    This donation is no longer available for claiming.
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Donations with status {donation.status} cannot be claimed.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Show additional info if already claimed by someone else */}
          {donation.status === "CLAIMED" && donation.receiverId !== user?.id && (
            <div className="text-sm text-gray-500 italic">
              This donation has already been claimed by {donation.receiver?.name || 'another organization'}.
            </div>
          )}

          {/* Show info if already claimed by current user */}
          {donation.status === "CLAIMED" && donation.receiverId === user?.id && (
            <div className="text-sm text-primary font-medium">
              You have successfully claimed this donation. Please contact the donor to arrange pickup.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
