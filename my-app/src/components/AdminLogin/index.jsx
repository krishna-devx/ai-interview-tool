// // "use client";

// // import { useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Shield, Eye, EyeOff, LogIn } from "lucide-react";
// // import Link from "next/link";

// // export default function AdminLogin() {
// //   const [showPassword, setShowPassword] = useState(false);

// //   return (
// //     <div className="flex min-h-screen w-full overflow-hidden bg-gray-950">
// //       {/* Left side - Tech-themed background with illustration */}
// //       <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
// //         <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
// //           <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
// //           <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
// //             <Shield className="w-24 h-24 text-cyan-400" />
// //           </div>
// //           <div className="absolute -right-4 top-12 z-20">
// //             <LogIn className="w-10 h-10 text-blue-400" />
// //           </div>
// //           <div className="absolute -left-8 bottom-12 z-20">
// //             <Shield className="w-10 h-10 text-cyan-400" strokeWidth={1} />
// //           </div>
// //         </div>
// //         <h2 className="text-cyan-400 text-xl font-semibold mb-4">
// //           Admin Access
// //         </h2>
// //         <p className="text-gray-400 text-center text-sm max-w-xs">
// //           Secure login portal for interview system administrators
// //         </p>
// //       </div>

// //       {/* Right side - Login form */}
// //       <div className="w-full md:w-2/3 bg-gray-950 flex items-center justify-center p-6">
// //         <div className="w-full max-w-md">
// //           <div className="bg-cyan-950/50 text-cyan-400 text-sm font-medium py-2 px-4 rounded-md inline-block mb-6 border border-cyan-900/50">
// //             Admin Portal
// //           </div>

// //           <h1 className="text-2xl font-medium text-white mb-8">
// //             Login to Dashboard
// //           </h1>

// //           <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
// //             <form className="space-y-6">
// //               <div className="space-y-2">
// //                 <Label htmlFor="email" className="text-sm text-gray-400">
// //                   Email Address
// //                 </Label>
// //                 <Input
// //                   id="email"
// //                   type="email"
// //                   className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
// //                   placeholder="Enter your email"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <div className="flex items-center justify-between">
// //                   <Label htmlFor="password" className="text-sm text-gray-400">
// //                     Password
// //                   </Label>
// //                   <Link
// //                     href="/forgot-password"
// //                     className="text-xs text-cyan-400 hover:text-cyan-300"
// //                   >
// //                     Forgot password?
// //                   </Link>
// //                 </div>
// //                 <div className="relative">
// //                   <Input
// //                     id="password"
// //                     type={showPassword ? "text" : "password"}
// //                     className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 pr-10 text-white"
// //                     placeholder="Enter your password"
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
// //                   >
// //                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
// //                   </button>
// //                 </div>
// //               </div>

// //               <Button
// //                 type="submit"
// //                 className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded-md border border-cyan-600 mt-4"
// //               >
// //                 <LogIn size={18} className="mr-2" />
// //                 Login
// //               </Button>
// //             </form>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Shield, Eye, EyeOff, LogIn } from "lucide-react";
// import Link from "next/link";
// import { loginAdmin } from "@/actions/admin";
// import { redirect, RedirectType } from "next/navigation";

// export default function AdminLogin() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const handleFormAction = async (formData) => {
//     const result = await loginAdmin(null, formData);
//     localStorage.setItem("admin_id", result.user_id);
//   };

//   useEffect(() => {
//     const id = localStorage.getItem("admin_id");
//     if (id) {
//       redirect("/admin");
//     } else {
//       redirect("/admin/login");
//     }
//   }, [error]);

//   return (
//     <div className="flex min-h-screen w-full overflow-hidden bg-gray-950">
//       {/* Left Side */}
//       <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
//         <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
//           <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
//             <Shield className="w-24 h-24 text-cyan-400" />
//           </div>
//           <div className="absolute -right-4 top-12 z-20">
//             <LogIn className="w-10 h-10 text-blue-400" />
//           </div>
//           <div className="absolute -left-8 bottom-12 z-20">
//             <Shield className="w-10 h-10 text-cyan-400" strokeWidth={1} />
//           </div>
//         </div>
//         <h2 className="text-cyan-400 text-xl font-semibold mb-4">
//           Admin Access
//         </h2>
//         <p className="text-gray-400 text-center text-sm max-w-xs">
//           Secure login portal for interview system administrators
//         </p>
//       </div>

//       {/* Right Side */}
//       <div className="w-full md:w-2/3 bg-gray-950 flex items-center justify-center p-6">
//         <div className="w-full max-w-md">
//           <div className="bg-cyan-950/50 text-cyan-400 text-sm font-medium py-2 px-4 rounded-md inline-block mb-6 border border-cyan-900/50">
//             Admin Portal
//           </div>

//           <h1 className="text-2xl font-medium text-white mb-8">
//             Login to Dashboard
//           </h1>

//           <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
//             {error && (
//               <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
//             )}

//             <form className="space-y-6" action={handleFormAction}>
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm text-gray-400">
//                   Email Address
//                 </Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
//                   placeholder="Enter your email"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password" className="text-sm text-gray-400">
//                     Password
//                   </Label>
//                 </div>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 pr-10 text-white"
//                     placeholder="Enter your password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 pt-1 rounded-md border border-cyan-600 mt-4"
//               >
//                 <LogIn size={18} className="mr-2" />
//                 Login
//               </Button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { loginAdmin } from "@/actions/admin";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check authentication status only once when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const adminId = localStorage.getItem("admin_id");
      if (adminId) {
        router.push("/admin");
      }
    };

    checkAuth();
  }, [router]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData(e.target);
      const result = await loginAdmin(null, formData);

      if (result.error) {
        setError(result.error);
      } else if (result.user_id) {
        localStorage.setItem("admin_id", result.user_id);
        router.push("/admin");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-950">
      {/* Left Side */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
        <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
          <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
            <Shield className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="absolute -right-4 top-12 z-20">
            <LogIn className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute -left-8 bottom-12 z-20">
            <Shield className="w-10 h-10 text-cyan-400" strokeWidth={1} />
          </div>
        </div>
        <h2 className="text-cyan-400 text-xl font-semibold mb-4">
          Admin Access
        </h2>
        <p className="text-gray-400 text-center text-sm max-w-xs">
          Secure login portal for interview system administrators
        </p>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-2/3 bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-cyan-950/50 text-cyan-400 text-sm font-medium py-2 px-4 rounded-md inline-block mb-6 border border-cyan-900/50">
            Admin Portal
          </div>

          <h1 className="text-2xl font-medium text-white mb-8">
            Login to Dashboard
          </h1>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-400">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-gray-400">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-gray-800 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 pr-10 text-white"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded-md border border-cyan-600 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Login
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
