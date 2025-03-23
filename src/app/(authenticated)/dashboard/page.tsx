"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getWeeklyChatsCount, getRecentChats } from "@/actions/chats";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Dummy data for industry professionals
const industryProfessionals = [
  {
    id: 1,
    name: "Timothy Chang",
    role: "Software Engineer",
    company: "Aritzia",
    avatar: "/j1.jpeg",
    expertise: ["Frontend Development", "JavaScript", "React"],
  },
  {
    id: 2,
    name: "Sophie Chu",
    role: "Product Manager @ Splunk",
    company: "Splunk",
    avatar: "/j2.jpeg",
    expertise: ["Product Strategy", "User Research", "Agile Methodologies"],
  },
  {
    id: 3,
    name: "Sunny Han",
    role: "AVP, RBCx",
    company: "RBCx",
    avatar: "/j3.jpeg",
    expertise: ["Investment Strategy", "Venture Capital", "Fintech"],
  },
  {
    id: 4,
    name: "Charles Jibblit",
    role: "Founder @ TechVentures",
    company: "TechVentures",
    avatar: "/j4.png",
    expertise: ["Entrepreneurship", "Startup Funding", "Business Development"],
  },
];

// Define types for our chat data
type Connection = {
  id: number;
  first_name: string;
  last_name: string;
  job_title: string;
  profile_picture: string | null;
};

type Chat = {
  id: number;
  user_id: string;
  notes: string;
  status: string;
  created_at: string;
  connections: Connection[];
};

export default function DashboardPage() {
  const { user, loading } = useUser();
  const [weeklyChatsCount, setWeeklyChatsCount] = useState(0);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatsLoading, setIsChatsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeeklyChatsCount() {
      if (!user?.id) return;
      try {
        const result = await getWeeklyChatsCount(user.id);
        setWeeklyChatsCount(result.count);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching weekly chats count:", error);
        setIsLoading(false);
      }
    }

    async function fetchRecentChats() {
      if (!user?.id) return;
      try {
        setIsChatsLoading(true);
        const data = await getRecentChats(user.id);
        setRecentChats(data);
        setIsChatsLoading(false);
      } catch (error) {
        console.error("Error fetching recent chats:", error);
        setIsChatsLoading(false);
      }
    }

    if (user?.id && !loading) {
      fetchWeeklyChatsCount();
      fetchRecentChats();
    }
  }, [user?.id, loading]);

  // Function to get name from connection or fallback
  const getContactName = (chat: Chat) => {
    const connection = chat.connections?.[0];
    if (connection) {
      return `${connection.first_name} ${connection.last_name}`;
    }
    return "Unknown Contact";
  };

  // Function to get avatar from connection or fallback
  const getContactAvatar = (chat: Chat) => {
    const connection = chat.connections?.[0];
    if (connection && connection.profile_picture) {
      return connection.profile_picture;
    }
    return `https://i.pravatar.cc/150?u=${chat.id}`;
  };

  // Function to get job title from connection or fallback
  const getJobTitle = (chat: Chat) => {
    const connection = chat.connections?.[0];
    if (connection && connection.job_title) {
      return connection.job_title;
    }
    return "";
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Weekly Chats</h2>
          <p className="text-gray-500">Total chats created in the past week.</p>
          <div className="mt-4 text-lg font-medium">
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                {weeklyChatsCount}
              </span>
            )}{" "}
            new chats
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Weekly Goal</h2>
          <p className="text-gray-500">Your target number of chats per week.</p>
          <div className="mt-4 text-lg font-medium">
            <span className="text-2xl font-bold text-primary">10</span> chats
            {!isLoading && (
              <div className="mt-2 text-sm">
                <span
                  className={
                    weeklyChatsCount >= 10 ? "text-green-600" : "text-amber-600"
                  }
                >
                  {weeklyChatsCount >= 10
                    ? "Goal achieved! 🎉"
                    : `${10 - weeklyChatsCount} more to go`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Industry Professionals Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Popular Industry Professionals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industryProfessionals.map((professional) => (
            <div
              key={professional.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 mr-4">
                    <img
                      src={professional.avatar}
                      alt={professional.name}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-gray-600">{professional.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {professional.company}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {professional.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/chat/${professional.id}`}
                  className="block w-full py-2 text-center bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Start Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Chats Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recent Chats</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isChatsLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-pulse space-y-4 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentChats.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentChats.map((chat) => (
                <li key={chat.id} className="hover:bg-gray-50">
                  <Link href={`/chat/${chat.id}`} className="block p-4">
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 mr-4">
                        <img
                          src={getContactAvatar(chat)}
                          alt={getContactName(chat)}
                          className="rounded-full object-cover w-12 h-12"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getContactName(chat)}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {getJobTitle(chat)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimestamp(chat.created_at)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No recent chats found.</p>
              <p className="text-sm mt-2">
                Start a new conversation with an industry professional!
              </p>
            </div>
          )}
          <div className="p-4 border-t">
            <Link
              href="/chats"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all chats →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
