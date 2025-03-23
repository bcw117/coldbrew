"use client";

import { useState } from "react";
import RecommendationForm from "@/components/RecommendationForm";

export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="flex justify-center text-3xl font-bold mb-8">
        Brew Up Your Recommendations
      </h1>
      {isGenerating && (
        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <svg
              className="animate-spin h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-lg font-medium">
              Brewing AI recommendations...
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            This might take a minute as we analyze the job posting and find the
            best matches
          </p>
        </div>
      )}
      <RecommendationForm onLoadingChange={setIsGenerating} />
    </div>
  );
}
