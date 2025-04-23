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
  Send,
  X
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function DonationDetails() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Request states
  const [hasRequest, setHasRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCancellingRequest, setIsCancellingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);

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
          
          // Check if user is a receiver
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && user.role === "RECEIVER") {
            // Check if user has already requested this donation
            try {
              const requestResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/${id}/request`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (requestResponse.data.success) {
                setHasRequest(requestResponse.data.hasRequest);
                setRequestStatus(requestResponse.data.requestStatus);
              }
            } catch (requestError) {
              console.error("Error checking request status:", requestError);
            }
          }
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
  
  const handleSendRequest = async () => {
    try {
      setIsRequesting(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Send request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/${id}/request`,
        
        { message: requestMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setHasRequest(true);
        setRequestStatus("PENDING");
        setShowRequestDialog(false);
        setRequestMessage("");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setError("Failed to send request. Please try again later.");
    } finally {
      setIsRequesting(false);
    }
  };
  
  const handleCancelRequest = async () => {
    try {
      setIsCancellingRequest(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Cancel request
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/${id}/request`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setHasRequest(false);
        setRequestStatus(null);
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      setError("Failed to cancel request. Please try again later.");
    } finally {
      setIsCancellingRequest(false);
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
  
  // Get request status badge color and text
  const getRequestStatusDisplay = (status) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "Request Pending"
        };
      case "ACCEPTED":
        return {
          color: "bg-green-100 text-green-800",
          text: "Request Accepted"
        };
      case "REJECTED":
        return {
          color: "bg-red-100 text-red-800",
          text: "Request Rejected"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          text: "Unknown Status"
        };
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
  
  // Determine if the user is a receiver (can request)
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || '{}') : {};
  const isReceiver = user.role === "RECEIVER";
  const canRequest = isReceiver && donation.status === "AVAILABLE" && !hasRequest;

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
          
          {/* Request Status (if applicable) */}
          {hasRequest && (
            <div className="mt-4 p-4 rounded-lg border bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge className={`mr-2 ${getRequestStatusDisplay(requestStatus).color}`}>
                    {getRequestStatusDisplay(requestStatus).text}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {requestStatus === "PENDING" 
                      ? "Your request is waiting for donor approval" 
                      : requestStatus === "ACCEPTED"
                      ? "Your request has been accepted by the donor"
                      : "Your request has been rejected by the donor"}
                  </span>
                </div>
                
                {/* Cancel button (only for pending requests) */}
                {requestStatus === "PENDING" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleCancelRequest}
                    disabled={isCancellingRequest}
                  >
                    {isCancellingRequest ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          {/* Show request button only if user is a receiver and donation is available */}
          {canRequest && (
            <AlertDialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <AlertDialogTrigger asChild>
                <Button className="w-64">Request Donation</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Donation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Send a request to the donor. They will be able to see your profile information when deciding.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Donor (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell the donor why you need this donation or any special pickup arrangements..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full"
                    rows={4}
                  />
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button 
                      onClick={handleSendRequest}
                      disabled={isRequesting}
                    >
                      {isRequesting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Request
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {/* If request is already pending */}
          {hasRequest && requestStatus === "PENDING" && (
            <Button disabled className="w-64 bg-yellow-500 hover:bg-yellow-600">
              Request Pending
            </Button>
          )}
          
          {/* If request is accepted */}
          {hasRequest && requestStatus === "ACCEPTED" && (
            <Button disabled className="w-64 bg-green-500 hover:bg-green-600">
              Request Accepted
            </Button>
          )}
          
          {/* If request is rejected */}
          {hasRequest && requestStatus === "REJECTED" && (
            <Button disabled className="w-64 bg-red-500 hover:bg-red-600">
              Request Rejected
            </Button>
          )}
          
          {/* If user is not a receiver or donation is not available */}
          {(!isReceiver || donation.status !== "AVAILABLE") && !hasRequest && (
            <Button disabled className="w-64 opacity-60">
              {!isReceiver 
                ? "Only receivers can request donations" 
                : `Donation is ${donation.status.toLowerCase()}`}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}