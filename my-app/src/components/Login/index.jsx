"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Code } from "lucide-react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950">
      {/* Left side - Tech-themed background with illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
        <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
          <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
            <Terminal className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="absolute -right-4 top-12 z-20">
            <Code className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute -left-8 bottom-12 z-20">
            <Code className="w-10 h-10 text-cyan-400 rotate-180" />
          </div>
        </div>
        <p className="text-gray-400 text-center text-sm max-w-xs">
          Access your developer workspace and tools with our secure
          authentication system
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-cyan-950/50 text-cyan-400 text-sm font-medium py-2 px-4 rounded-md inline-block mb-6 border border-cyan-900/50">
            Welcome back
          </div>

          <h1 className="text-2xl font-medium text-white mb-8">
            Login your account
          </h1>

          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-gray-400">
                Username
              </label>
              <Input
                id="username"
                type="text"
                className="w-full bg-gray-900 mt-1.5 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-400">
                Password
              </label>
              <Input
                id="password"
                type="password"
                className="w-full bg-gray-900 mt-1.5 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                placeholder="Enter your password"
              />
            </div>

            <Link href="/candidate-details" className="w-full">
              <Button className="w-full bg-cyan-700 mt-2 hover:bg-cyan-600 text-white py-2 rounded-md border border-cyan-600">
                Login
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
