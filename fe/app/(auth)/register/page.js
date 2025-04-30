"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "DONOR",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register", 
        formData
      );

      const token = response.data.data.token;
      const user = response.data.data.user;

      // Use the auth context login method
      login(user, token);

      // Redirect to dashboard based on role
      if (user.role === "DONOR") {
        router.push("/donor/dashboard");
      } else {
        router.push("/receiver/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl space-y-8 p-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Join Surplus2Share and start making a difference
          </p>
        </div>

        {error && (
          <div className="p-4 mb-5 text-base text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe or Organization Name"
                className="text-base py-2.5 px-4 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="text-base py-2.5 px-4 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="text-base py-2.5 px-4 h-12"
              />
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Register as</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("DONOR")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                    formData.role === "DONOR"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="font-medium text-base">Donor</span>
                  <span className="text-sm mt-1 text-center">Donate items to those in need</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("RECEIVER")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                    formData.role === "RECEIVER"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium text-base">NGO</span>
                  <span className="text-sm mt-1 text-center">Receive and distribute donations</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="text-base py-2.5 px-4 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-base">Address (optional)</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                className="text-base py-2.5 px-4 h-12"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 h-12 text-base font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-base text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
} 