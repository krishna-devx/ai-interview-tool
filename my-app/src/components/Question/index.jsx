"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star, RefreshCw, Send, MessageSquare } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function CodingQuestionPage() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Your solution here
  
}

// Example usage:
// console.log(twoSum([2,7,11,15], 9));`);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-950">
      {/* Left side - Tech-themed background with illustration */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-b from-gray-900 to-gray-950 flex-col items-center justify-center p-8 relative border-r border-gray-800">
        <div className="relative w-64 h-64 bg-gray-800/50 rounded-full flex items-center justify-center mb-12 overflow-hidden">
          <div className="animate-pulse absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full"></div>
          <div className="absolute w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center z-10">
            <code className="text-gray-100 text-4xl font-mono">{`{ }`}</code>
          </div>
          <div className="absolute -right-4 top-12 z-20">
            <code className="text-blue-400 text-xl font-mono">()</code>
          </div>
          <div className="absolute -left-8 bottom-12 z-20">
            <code className="text-gray-100 text-xl font-mono">[]</code>
          </div>
        </div>
        <h2 className="text-gray-100 text-xl font-semibold mb-4">
          Coding Challenge
        </h2>
        <p className="text-gray-400 text-center text-sm max-w-xs">
          Solve this algorithmic problem to demonstrate your coding skills and
          problem-solving abilities
        </p>
      </div>

      {/* Right side - Coding question and IDE */}
      <div className="w-full md:w-2/3 bg-gray-950 flex flex-col p-6">
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          {/* Header with badge and actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-cyan-950/50 text-gray-100 text-sm font-medium py-2 px-4 rounded-md inline-block border border-cyan-900/50">
              Algorithm Challenge
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => {}}
              >
                <RefreshCw size={16} className="mr-2" />
                Change Question
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                  isBookmarked ? "text-yellow-400" : "text-gray-500"
                } hover:bg-gray-900`}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Star size={20} fill={isBookmarked ? "currentColor" : "none"} />
              </Button>
            </div>
          </div>

          {/* Question title and content */}
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-white mb-4">Question</h1>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <p className="text-gray-300 mb-4">
                Given an array of integers{" "}
                <code className="bg-gray-800 px-1 rounded text-gray-100">
                  nums
                </code>{" "}
                and an integer{" "}
                <code className="bg-gray-800 px-1 rounded text-gray-100">
                  target
                </code>
                , return indices of the two numbers such that they add up to{" "}
                <code className="bg-gray-800 px-1 rounded text-gray-100">
                  target
                </code>
                .
              </p>
              <p className="text-gray-300 mb-4">
                You may assume that each input would have exactly one solution,
                and you may not use the same element twice.
              </p>
              {/* 
              <div className="mt-6">
                <h3 className="text-white text-lg font-medium mb-2">
                  Example:
                </h3>
                <div className="bg-gray-800 p-4 rounded-md font-mono text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-100">Input:</span> nums =
                    [2,7,11,15], target = 9
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-100">Output:</span> [0,1]
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-100">Explanation:</span> Because
                    nums[0] + nums[1] == 9, we return [0, 1].
                  </p>
                </div>
              </div> */}
            </div>
          </div>

          {/* IDE Section with CodeMirror integration */}
          <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 mb-6 min-h-[300px] overflow-hidden">
            <div className="h-full">
              <CodeMirror
                value={code}
                height="100%"
                theme="dark"
                extensions={[javascript({ jsx: true })]}
                onChange={handleCodeChange}
                className="h-full text-sm"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  searchKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <MessageSquare size={16} className="mr-2" />
              Feedback
            </Button>
            <Button className="bg-cyan-700 hover:bg-cyan-600 text-white rounded-md border border-cyan-600">
              <Send size={16} className="mr-2" />
              Submit Solution
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
