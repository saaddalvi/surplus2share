"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Calendar, MapPin, User, CheckCircle } from "lucide-react";

export default function ReceiverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      console.log('Dashboard API Request:', config);
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use((response) => {
      console.log('Dashboard API Response:', response);
      return response;
    });

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);

        const [availableResponse, acceptedResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/all/available`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/all/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setAvailableDonations(availableResponse.data.data);
        setAcceptedRequests(acceptedResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAvailableCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableDonations.map((donation) => (
        <Card key={donation.id} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{donation.title}</CardTitle>
              <Badge className={getStatusBadgeStyle(donation.status)}>
                {donation.status}
              </Badge>
            </div>
            <CardDescription>{donation.foodType}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span>Donor: {donation.donor?.user?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <PackageOpen className="mr-2 h-4 w-4 text-gray-500" />
                <span>{donation.quantity} {donation.quantityUnit}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>Pickup: {formatDate(donation.pickupDate)}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 text-gray-500 mt-0.5" />
                <span className="flex-1">{donation.pickupAddress}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t">
            <Link href={`/receiver/donations/${donation.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderAcceptedList = () => (
    <div className="space-y-4">
      {acceptedRequests.map((donation) => (
        <Card key={donation.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getStatusBadgeStyle(donation.status)}>
                    {donation.status}
                  </Badge>
                  <div>
                    <h3 className="font-semibold">{donation.title}</h3>
                    <p className="text-sm text-gray-600">{donation.foodType}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(donation.pickupDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{donation.pickupAddress}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4 text-right">
                <p className="text-sm font-medium">
                  {donation.quantity} {donation.quantityUnit}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {donation.expirationDate && `Expires: ${formatDate(donation.expirationDate)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

    const dataToShow = activeTab === "available" ? availableDonations : acceptedRequests;
    const emptyMessage = activeTab === "available" 
      ? "No available donations found"
      : "No accepted requests found";

    return (
      <>
        {dataToShow.length === 0 ? (
          <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">{emptyMessage}</h3>
            </CardContent>
          </Card>
        ) : (
          activeTab === "available" ? renderAvailableCards() : renderAcceptedList()
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Food Donations</h1>
        <p className="text-gray-600 mt-2">
          Welcome{user ? `, ${user.name}` : ""}! Manage your food donations here.
        </p>
        
        <div className="flex gap-4 mt-6">
          <Button
            variant={activeTab === "available" ? "default" : "outline"}
            onClick={() => setActiveTab("available")}
          >
            <PackageOpen className="mr-2 h-4 w-4" /> Available
          </Button>
          <Button
            variant={activeTab === "accepted" ? "default" : "outline"}
            onClick={() => setActiveTab("accepted")}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Accepted
          </Button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

const getStatusBadgeStyle = (status) => {
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