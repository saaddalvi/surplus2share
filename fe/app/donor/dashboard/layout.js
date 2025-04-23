"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DonorLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      console.log('Dashboard API Request:', config);
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use((response) => {
      console.log('Dashboard API Response:', response);
      return response;
    });

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

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Donor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome{user ? `, ${user.name}` : ""}! Manage your food donations here.
          </p>
        </div>
       <div className="space-x-4">
         <Link href="/donor/dashboard/requests">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Requests
            </Button>
          </Link>
          <Link href="/donor/create-donation">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Create Donation
            </Button>
          </Link>
       </div>
      </div>

      {children}
    </div>
  );
}