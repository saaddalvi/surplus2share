"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StatisticsPage() {
  const router = useRouter();
  const [donorStats, setDonorStats] = useState(null);
  const [receiverStats, setReceiverStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const API_URL = 'http://localhost:5000';
        
        // Fetch donor statistics
        const donorResponse = await axios.get(`${API_URL}/api/donor/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDonorStats(donorResponse.data.data);

        // Fetch receiver statistics
        const receiverResponse = await axios.get(`${API_URL}/api/receiver/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReceiverStats(receiverResponse.data.data);

      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
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

  if (!donorStats && !receiverStats) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600">
        No statistics available yet. Start making donations or requests to see your progress!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Donor Statistics */}
      {donorStats && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Donor Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Accepted Requests</p>
                    <p className="text-2xl font-bold">{donorStats.acceptedRequests}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completed Donations</p>
                    <p className="text-2xl font-bold">{donorStats.completedDonations}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">{donorStats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Impact</p>
                    <p className="text-2xl font-bold">{donorStats.totalImpact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Donations Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donorStats.monthlyDonations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="donations" fill="#8884d8" name="Number of Donations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Donation Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donorStats.donationCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {donorStats.donationCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receiver Statistics */}
      {receiverStats && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Your Receiver Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Accepted Requests</p>
                    <p className="text-2xl font-bold">{receiverStats.acceptedRequests}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completed Requests</p>
                    <p className="text-2xl font-bold">{receiverStats.completedRequests}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">{receiverStats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Impact</p>
                    <p className="text-2xl font-bold">{receiverStats.totalImpact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Requests Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={receiverStats.monthlyRequests}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#8884d8" name="Number of Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Request Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Request Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={receiverStats.requestCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {receiverStats.requestCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 