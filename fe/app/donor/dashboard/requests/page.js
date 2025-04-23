"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, MapPin, Check, X } from "lucide-react";

export default function RequestPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  const [user, setUser] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);

  // Fetch user once on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, []);

  // Fetch data when user is available
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        const [notificationsResponse, donationsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/donations/${user.id}/accepted`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setNotifications(notificationsResponse.data.data);
        console.log("Notifications:", notificationsResponse.data.data);
        setAcceptedDonations(donationsResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);


  const handleRequestAction = async (requestId, action) => {
    try {
      setProcessingRequest(requestId);
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      await axios.patch(
        `${API_URL}/api/donations/requests/${requestId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data after successful action
      const [notificationsResponse, donationsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/donations/${user.id}/accepted`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setNotifications(notificationsResponse.data.data);
      setAcceptedDonations(donationsResponse.data.data);
    } catch (error) {
      console.error("Error handling request:", error);
      setError("Failed to process request. Please try again.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleShowAddress = (donation) => {
    setSelectedDonation(selectedDonation?.id === donation.id ? null : donation);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "notifications" ? "default" : "outline"}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell className="mr-2 h-4 w-4" /> Notifications
        </Button>
        <Button
          variant={activeTab === "accepted" ? "default" : "outline"}
          onClick={() => setActiveTab("accepted")}
        >
          <CheckCircle className="mr-2 h-4 w-4" /> Accepted Requests
        </Button>
      </div>

      {activeTab === "notifications" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Notifications</h2>
          {notifications.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No notifications found</p>
              </CardContent>
            </Card>
          ) : (
// In the notifications.map section, update the Card content:
notifications.map((notification) => (
    <Card key={notification.id}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{notification.title}</CardTitle>
            {notification.request?.status && (
              <Badge variant="outline" className={`${notification.request?.status === "PENDING"?"bg-[#fcce5b] text-white": notification.request?.status === "ACCEPTED"?"bg-[#00b799] text-white": notification.request?.status === "REJECTED"?"bg-[#de3a3b] text-white":"bg-gray-100 text-gray-800"}`}>
                {notification.request.status}
              </Badge>
            )}
          </div>
          <Badge variant="outline">
            {new Date(notification.createdAt).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      
      {/* Add this section for message display */}
      <CardContent className="pt-0">
      {notification.type === "REQUEST_SENT" && notification.request?.status === "" && (
            <div className="flex flex-col">
                <span className="text-sm">{notification.message}</span>
                <span className="text-sm">{notification.request?.message}</span>
            </div>
        ) }
        
        {notification.type === "REQUEST_SENT" && notification.request?.status === "PENDING" && (
          <div className="flex gap-2 justify-end mt-4">
            {/* Keep existing action buttons */}
            <Button 
              variant="outline" 
              className="text-green-600 hover:bg-green-50"
              onClick={() => handleRequestAction(notification.requestId, 'ACCEPT')}
              disabled={processingRequest === notification.requestId}
            >
              {processingRequest === notification.requestId ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Accept
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleRequestAction(notification.requestId, 'REJECT')}
              disabled={processingRequest === notification.requestId}
            >
              {processingRequest === notification.requestId ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  ))
          )}
        </div>
      )}

      {activeTab === "accepted" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Accepted Requests</h2>
          {acceptedDonations.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No accepted requests found</p>
              </CardContent>
            </Card>
          ) : (
            acceptedDonations.map((donation) => (
              <Card key={donation.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="pt-4" onClick={() => handleShowAddress(donation)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{donation.title}</h3>
                      <p className="text-sm text-gray-600">
                        Accepted on: {new Date(donation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusBadgeColor(donation.status)}>
                      {donation.status}
                    </Badge>
                  </div>

                  {selectedDonation?.id === donation.id && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="font-medium">Receiver Address:</p>
                          <p className="text-gray-600">
                            {donation.receiver?.address || "Address not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "CLAIMED":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};