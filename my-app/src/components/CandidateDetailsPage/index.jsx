"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, User, Code, Terminal } from "lucide-react";
import Link from "next/link";

export default function InterviewDetailsPage() {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-950">
      {/* Left side - Tech-themed background with illustration */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
        <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
          <div className="animate-pulse absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
          <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
            <Terminal className="w-24 h-24 text-gray-100" />
          </div>
          <div className="absolute -right-4 top-12 z-20">
            <Code className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute -left-8 bottom-12 z-20">
            <Code className="w-10 h-10 text-gray-100 rotate-180" />
          </div>
        </div>
        <h2 className="text-gray-100 text-xl font-semibold mb-4">
          Developer Interviews
        </h2>
        <p className="text-gray-400 text-center text-sm max-w-xs">
          Streamline your technical interview process with our comprehensive
          candidate management system
        </p>
      </div>

      {/* Right side - Interview details form */}
      <div className="w-full md:w-2/3 bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="bg-cyan-950/50 text-gray-100 text-sm font-medium py-2 px-4 rounded-md inline-block mb-6 border border-cyan-900/50">
            Candidate Details
          </div>

          <h1 className="text-2xl font-medium text-white mb-8">
            Interview Information
          </h1>

          <form className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column */}
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-400">
                    Name of the Candidate
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    className="w-full bg-gray-900 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                    placeholder="Enter candidate's full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college" className="text-sm text-gray-400">
                    Name of the College
                  </Label>
                  <Input
                    id="college"
                    type="text"
                    className="w-full bg-gray-900 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                    placeholder="Enter college name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-sm text-gray-400">
                    Branch
                  </Label>
                  <Input
                    id="branch"
                    type="text"
                    className="w-full bg-gray-900 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                    placeholder="E.g., Computer Science, Electronics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm text-gray-400">
                    Year
                  </Label>
                  <Select>
                    <SelectTrigger className="w-full bg-gray-900 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white">
                      <SelectValue placeholder="Select year of study" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border border-gray-800">
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Fourth Year</SelectItem>
                      <SelectItem value="5">Fifth Year</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right column */}
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm text-gray-400">
                    Role
                  </Label>
                  <Select>
                    <SelectTrigger className="w-full bg-gray-900 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border border-gray-800">
                      <SelectItem value="mern">MERN Stack Developer</SelectItem>
                      <SelectItem value="fullstack">
                        Full Stack Developer
                      </SelectItem>
                      <SelectItem value="frontend">
                        Frontend Developer
                      </SelectItem>
                      <SelectItem value="backend">Backend Developer</SelectItem>
                      <SelectItem value="mobile">Mobile Developer</SelectItem>
                      <SelectItem value="devops">DevOps Engineer</SelectItem>
                      <SelectItem value="qa">QA Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-sm text-gray-400">
                    Skills
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 bg-gray-900 border-b border-gray-700 focus:border-cyan-500 rounded-md pl-3 py-2 text-white"
                      placeholder="Add skills (e.g., React, Node.js)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="bg-cyan-700 hover:bg-cyan-600 text-white rounded-md"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-gray-800 text-gray-100 hover:bg-gray-700 px-3 py-1 border border-gray-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-gray-100 hover:text-cyan-300"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="profile-image"
                    className="text-sm text-gray-400"
                  >
                    Profile Image
                  </Label>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6 cursor-pointer hover:border-cyan-700 transition-colors bg-gray-900/50">
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="profile-image"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {profileImage ? (
                        <div className="relative w-32 h-32 mb-2">
                          <Image
                            src={profileImage || "/placeholder.svg"}
                            alt="Profile preview"
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-2 border border-gray-700">
                          <User size={40} className="text-gray-100" />
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-100">
                        <Upload size={16} className="mr-1" />
                        {profileImage ? "Change photo" : "Upload photo"}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/question-answer" className="w-full pt-4">
              <Button className="w-full bg-cyan-700 mt-2 hover:bg-cyan-600 text-white py-2 rounded-md border border-cyan-600">
                Save Candidate Details
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
