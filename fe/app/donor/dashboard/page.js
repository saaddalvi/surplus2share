"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Correct Badge import
import { Calendar, MapPin, PackageOpen, Plus, Trophy, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios"; // Added axios import

export default function DonorDashboardPage()   {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      console.log('Dashboard API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
      });
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use((response) => {
      console.log('Dashboard API Response:', {
        status: response.status,
        data: response.data,
      });
      return response;
    });

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const [donationsResponse, statsResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations/all/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donor/stats`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        ]);

        if (donationsResponse.data.success) {
          setDonations(donationsResponse.data.data);
        } else {
          setError("Failed to load your donations. Server response indicated failure.");
        }

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
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

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your donations...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      ) : (
        <div>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.points}</div>
                  <p className="text-sm text-gray-500 mt-1">Earned from donations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-500" />
                    Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">#{stats.rank}</div>
                  <p className="text-sm text-gray-500 mt-1">Among all donors</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalImpact}</div>
                  <p className="text-sm text-gray-500 mt-1">People helped</p>
                </CardContent>
              </Card>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Your Donations</h2>
          {donations.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardContent className="py-12">
                <div className="text-center">
                  <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No donations yet</h3>
                  <p className="mt-2 text-gray-500">
                    Get started by creating your first food donation.
                  </p>
                  <Link href="/donor/create-donation" className="mt-6 inline-block">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Donation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <Card key={donation.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{donation.title}</CardTitle>
                      <Badge className={getStatusBadgeColor(donation.status)}>
                        {donation.status}
                      </Badge>
                    </div>
                    <CardDescription>{donation.foodType}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <PackageOpen className="mr-2 h-4 w-4 text-gray-500" />
                        <span>
                          {donation.quantity} {donation.quantityUnit}
                        </span>
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
                  <CardFooter>
                    <Link href={`/donor/donations/${donation.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};