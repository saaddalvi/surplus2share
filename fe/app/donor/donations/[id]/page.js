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
  AlertTriangle, 
  Edit, 
  Trash2,
  ArrowLeft,
  Phone,
  User
} from "lucide-react";

export default function DonationDetails() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        // Get token from localStorage
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

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Cancel donation
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setDonation({
          ...donation,
          status: "CANCELLED"
        });
      }
    } catch (error) {
      console.error("Error cancelling donation:", error);
      setError("Failed to cancel donation. Please try again later.");
    } finally {
      setIsCancelling(false);
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
                  <div className="font-medium">Expiration Date</div>
                  <div>{formatDate(donation.expirationDate)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Receiver Information (when claimed) */}
          {donation.status === "CLAIMED" && donation.receiver && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium mb-3 text-blue-800">Receiver Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <User className="mr-3 h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Organization</div>
                    <div>{donation.receiver.user?.name}</div>
                  </div>
                </div>
                
                {donation.receiver.phone && (
                  <div className="flex items-start">
                    <Phone className="mr-3 h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Contact Number</div>
                      <div>{donation.receiver.phone}</div>
                    </div>
                  </div>
                )}
                
                {donation.receiver.address && (
                  <div className="flex items-start col-span-full">
                    <MapPin className="mr-3 h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Receiver Address</div>
                      <div>{donation.receiver.address}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start col-span-full">
                  <Clock className="mr-3 h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Claimed On</div>
                    <div>{formatDate(donation.claimedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 text-sm text-gray-500 border-t">
            <p>Created: {formatDate(donation.createdAt)}</p>
            <p>Last Updated: {formatDate(donation.updatedAt)}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 border-t pt-4">
          {donation.status === "AVAILABLE" && (
            <>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/donor/donations/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Donation
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    disabled={isCancelling}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 
                    {isCancelling ? "Cancelling..." : "Cancel Donation"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your donation and make it unavailable to receivers.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      <AlertTriangle className="mr-2 h-4 w-4" /> 
                      Yes, Cancel Donation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {donation.status === "CLAIMED" && (
            <div className="w-full p-3 bg-blue-50 text-blue-700 rounded-md">
              This donation has been claimed by a receiver. Please use the contact information above to coordinate the pickup.
            </div>
          )}

          {donation.status === "COMPLETED" && (
            <div className="w-full p-3 bg-green-50 text-green-700 rounded-md">
              This donation has been successfully completed. Thank you for your contribution!
            </div>
          )}

          {donation.status === "CANCELLED" && (
            <div className="w-full p-3 bg-red-50 text-red-700 rounded-md">
              This donation has been cancelled and is no longer available to receivers.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 