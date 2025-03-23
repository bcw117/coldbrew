"use client";

import RecommendationForm from "./components/RecommendationForm";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black p-4">
      <h1 className="text-2xl font-bold mb-6">Job Recommendation Tool</h1>
      <RecommendationForm />
    </div>
  );
}
