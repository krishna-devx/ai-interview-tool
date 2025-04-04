"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast"; // or your preferred toast library
import { createInterviewer } from "@/actions/admin";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      const formData = new FormData(e.target);
      const result = await createInterviewer(formData);

      if (result.success) {
        toast.success("Interviewer created successfully!");
        router.push("/");
      } else {
        setFormError(result.message || "Failed to create interviewer");
        toast.error(result.message || "Failed to create interviewer");
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-950">
      {/* Left side - Tech-themed background with illustration */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
        <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
          <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
            <Shield className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="absolute -right-4 top-12 z-20">
            <UserPlus className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute -left-8 bottom-12 z-20">
            <Shield className="w-10 h-10 text-cyan-400" strokeWidth={1} />
          </div>
        </div>
        <h2 className="text-cyan-400 text-xl font-semibold mb-4">
          Admin Dashboard
        </h2>
        <p className="text-gray-400 text-center text-sm max-w-xs">
          Manage your interview team by creating and configuring interviewer
          accounts
        </p>
      </div>

      {/* Right side - Admin form */}
      <div className="w-full md:w-2/3 bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-cyan-950/50 text-cyan-400 text-sm font-medium py-2 px-4 rounded-md inline-block mb-6 border border-cyan-900/50">
            Admin Panel
          </div>

          <h1 className="text-2xl font-medium text-white mb-8">
            Create Interviewer
          </h1>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            {formError && (
              <p className="text-red-500 text-sm mb-4 text-center">
                {formError}
              </p>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-400">
                  Name of the Interviewer
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                  placeholder="Enter interviewer's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-400">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isLoading}
                  className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-400">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 pr-10 text-white"
                    placeholder="Create a password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Company (required) */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm text-gray-400">
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  required
                  disabled={isLoading}
                  className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                  placeholder="Enter company name"
                />
              </div>

              {/* Position (optional) */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm text-gray-400">
                  Position (optional)
                </Label>
                <Input
                  id="position"
                  name="position"
                  disabled={isLoading}
                  className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                  placeholder="Enter position"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded-md border border-cyan-600 mt-4"
              >
                {isLoading ? (
                  "Creating..."
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    Create Interviewer
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
