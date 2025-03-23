"use client";

import { useUser } from "@/app/context/UserContext";
import { handleButtonClick } from "../actions/recomendations";
import { useState } from "react";
import { NewConnection } from "@/utils/types/types";

export default function RecommendationForm() {
  const { user, loading } = useUser();
  const [connections, setConnections] = useState<NewConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Record<number, string>>({});

  async function onSubmit(formData: FormData) {
    try {
      setIsLoading(true);

      // Create a modified FormData
      const modifiedFormData = new FormData();

      // Copy existing form data
      for (const [key, value] of formData.entries()) {
        modifiedFormData.append(key, value);
      }

      // Call the server action with user ID
      const result = await handleButtonClick(modifiedFormData, user?.id);
      setConnections(result);

      // Initialize messages with the custom_message from the API response
      const initialMessages: Record<number, string> = {};
      result.forEach((connection, index) => {
        initialMessages[index] = connection.custom_message || "";
      });
      setMessages(initialMessages);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleMessageChange = (index: number, message: string) => {
    setMessages((prev) => ({
      ...prev,
      [index]: message,
    }));
  };

  const handleSendMessage = (connection: NewConnection, index: number) => {
    if (!messages[index]?.trim()) return;

    // Replace with actual send functionality
    console.log(
      `Sending message to ${connection.first_name} ${connection.last_name}: ${messages[index]}`
    );
    alert(`Message sent to ${connection.first_name} ${connection.last_name}!`);

    // Clear the message after sending
    handleMessageChange(index, "");
  };

  return (
    <div className="max-w-3xl mx-auto my-8">
      <form action={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="jobPostingUrl" className="block text-sm font-medium">
            Job Posting URL
          </label>
          <input
            id="jobPostingUrl"
            name="input"
            type="url"
            placeholder="https://www.linkedin.com/jobs/view/..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
        >
          {isLoading
            ? "Getting Recommendations..."
            : "Get Connection Recommendations"}
        </button>
      </form>

      {connections.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recommended Connections</h2>
          <ul className="space-y-6">
            {connections.map((connection, index) => (
              <li key={index} className="border rounded-md p-6 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {connection.profile_picture ? (
                      <img
                        src={connection.profile_picture}
                        alt={`${connection.first_name} ${connection.last_name}`}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                        <svg
                          className="h-14 w-14 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {connection.first_name} {connection.last_name}
                    </div>
                    <div className="font-medium">{connection.job_title}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      {connection.headline}
                    </div>
                    <div className="text-sm text-gray-500">
                      {connection.location.city}, {connection.location.state}
                      {connection.location.country
                        ? `, ${connection.location.country}`
                        : ""}
                    </div>
                    <a
                      href={connection.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View Profile
                    </a>

                    <div className="mt-4">
                      <textarea
                        value={messages[index] || ""}
                        onChange={(e) =>
                          handleMessageChange(index, e.target.value)
                        }
                        placeholder="Write a custom message..."
                        className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none"
                      />
                      <button
                        onClick={() => handleSendMessage(connection, index)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
