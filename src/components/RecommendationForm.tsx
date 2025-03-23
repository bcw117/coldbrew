"use client";

import { useUser } from "@/context/UserContext";
import { handleButtonClick } from "@/actions/recomendations";
import { createChat } from "@/actions/chats";
import { createConnection } from "@/actions/connections";
import { useState, useEffect } from "react";
import { NewConnection } from "@/utils/types/types";
import { toast } from "sonner";

interface RecommendationFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function RecommendationForm({
  onLoadingChange,
}: RecommendationFormProps) {
  const { user, loading } = useUser();
  const [connections, setConnections] = useState<NewConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [sendingStatus, setSendingStatus] = useState<Record<number, boolean>>(
    {}
  );

  // Notify parent component when loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Modified onSubmit to use a client-side handler instead of directly as form action
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Set loading state immediately
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Copy existing form data
      const modifiedFormData = new FormData();
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
      toast.error("Failed to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageChange = (index: number, message: string) => {
    setMessages((prev) => ({
      ...prev,
      [index]: message,
    }));
  };

  const handleSendMessage = async (
    connection: NewConnection,
    index: number
  ) => {
    if (!messages[index]?.trim() || !user?.id) return;

    try {
      // Set the status to sending
      setSendingStatus((prev) => ({
        ...prev,
        [index]: true,
      }));

      // Show a loading toast
      const toastId = toast.loading("Sending message...");

      // Step 1: Create a chat first
      const status = "Sent"; // Or any default status you want to set
      const notes = "Message: " + messages[index]; // Using the message as notes

      // Create chat and get the chat_id directly from the result
      const chatResult = await createChat(user.id, notes, status);

      if (!chatResult.success || !chatResult.chat_id) {
        throw new Error("Failed to create chat");
      }

      // Step 2: Create a connection using the chat_id returned from createChat
      const connectionResult = await createConnection(
        connection,
        chatResult.chat_id
      );

      if (!connectionResult.success) {
        throw new Error("Failed to create connection");
      }

      // Success! Copy message to clipboard
      try {
        await navigator.clipboard.writeText(messages[index]);

        // Dismiss the loading toast and show a success toast
        toast.dismiss(toastId);
        toast.success(
          "Message copied to clipboard. Opening LinkedIn profile..."
        );

        // Short delay before redirect to ensure the toast is seen
        setTimeout(() => {
          // Redirect to LinkedIn profile
          window.open(connection.link, "_blank");
        }, 1500);
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);

        // Dismiss the loading toast and show a warning toast
        toast.dismiss(toastId);
        toast.warning(
          "Message sent but couldn't copy to clipboard. Please open the LinkedIn profile manually."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      // Reset the sending status
      setSendingStatus((prev) => ({
        ...prev,
        [index]: false,
      }));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="w-full mb-8">
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="w-full">
            <label
              htmlFor="jobPostingUrl"
              className="block text-sm font-medium"
            >
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
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                Getting Recommendations...
              </div>
            ) : (
              "Get Connection Recommendations"
            )}
          </button>
        </form>
      </div>

      {connections.length > 0 && (
        <div className="w-full">
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
                        disabled={sendingStatus[index]}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400"
                      >
                        {sendingStatus[index] ? "Sending..." : "Send Message"}
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
