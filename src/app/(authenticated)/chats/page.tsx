"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  getChatsWithConnections,
  updateChatNotes,
  updateChatStatus,
} from "@/actions/chats";
import { formatDistanceToNow } from "date-fns";
import { CircleUserRound, X, Save, Edit, Check } from "lucide-react";
import { toast } from "sonner";

// Status options
const STATUS_OPTIONS = [
  { value: "Sent", label: "Sent", color: "bg-blue-100 text-blue-800" },
  { value: "Ghosted", label: "Ghosted 👻", color: "bg-gray-100 text-gray-800" },
  { value: "Brewed", label: "Brewed", color: "bg-green-100 text-green-800" },
  {
    value: "Follow up",
    label: "Follow up",
    color: "bg-purple-100 text-purple-800",
  },
];

type Connection = {
  id: number;
  first_name: string;
  last_name: string;
  job_title: string;
  headline: string;
  profile_picture: string | null;
  location: {
    city: string;
    state: string;
    country?: string;
  };
  link: string;
  chat_id: number;
  created_at: string;
  chats: {
    id: number;
    user_id: string;
    notes: string;
    status: string;
    created_at: string;
  };
};

type SelectedNoteInfo = {
  chatId: number;
  note: string;
};

export default function ChatTrackingPage() {
  const { user, loading } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedNote, setSelectedNote] = useState<SelectedNoteInfo | null>(
    null
  );
  const [editedNote, setEditedNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchChatsWithConnections() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const result = await getChatsWithConnections(user.id);
        if (Array.isArray(result)) {
          setConnections([]);
        } else {
          setConnections(result.connectionsWithChats || []);
        }
      } catch (error) {
        console.error("Error fetching chats with connections:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id && !loading) {
      fetchChatsWithConnections();
    }
  }, [user?.id, loading]);

  // Close note modal when clicking escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleCloseModal = () => {
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedNote) return;

    try {
      setIsSaving(true);
      await updateChatNotes(selectedNote.chatId, editedNote);

      // Update the connections array with the new notes
      setConnections((prevConnections) =>
        prevConnections.map((connection) => {
          if (connection.chat_id === selectedNote.chatId) {
            return {
              ...connection,
              chats: {
                ...connection.chats,
                notes: editedNote,
              },
            };
          }
          return connection;
        })
      );

      toast.success("Notes updated successfully");
      setSelectedNote({
        ...selectedNote,
        note: editedNote,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    if (selectedNote) {
      setEditedNote(selectedNote.note);
      setIsEditing(true);
    }
  };

  const handleUpdateStatus = async (chatId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await updateChatStatus(chatId, newStatus);

      // Update local state
      setConnections((prevConnections) =>
        prevConnections.map((connection) => {
          if (connection.chat_id === chatId) {
            return {
              ...connection,
              chats: {
                ...connection.chats,
                status: newStatus,
              },
            };
          }
          return connection;
        })
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
      setEditingStatus(null);
    }
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(
      (option) => option.value === status
    );
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  // Get status label with emoji if needed
  const getStatusLabel = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(
      (option) => option.value === status
    );
    return statusOption?.label || status;
  };

  // Filter connections based on selected status
  const filteredConnections =
    filterStatus === "all"
      ? connections
      : connections.filter(
          (connection) => connection.chats?.status === filterStatus
        );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat Tracking</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Conversations</h2>
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border border-gray-300 text-sm py-1 px-3"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {connections.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No conversations found. Start a conversation by sending a
                message to a connection.
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm">
                <div className="col-span-4">Contact</div>
                <div className="col-span-3">Notes</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Date</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y">
                {filteredConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 items-center"
                  >
                    <div className="col-span-4 flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {connection.profile_picture ? (
                          <img
                            src={connection.profile_picture}
                            alt={`${connection.first_name} ${connection.last_name}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <CircleUserRound className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={connection.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm truncate hover:text-primary hover:underline block"
                        >
                          {connection.first_name} {connection.last_name}
                        </a>
                        <p className="text-xs text-gray-500 truncate">
                          {connection.job_title}
                        </p>
                      </div>
                    </div>

                    <div
                      className="col-span-3 text-sm text-gray-600 truncate cursor-pointer hover:text-primary hover:underline"
                      onClick={() =>
                        setSelectedNote({
                          chatId: connection.chats.id,
                          note: connection.chats?.notes || "No notes available",
                        })
                      }
                    >
                      {connection.chats?.notes}
                    </div>

                    <div className="col-span-2">
                      {editingStatus === connection.chat_id ? (
                        <div className="relative">
                          <select
                            className="text-xs py-1 px-2 border rounded-md pr-8 w-full bg-white"
                            value={connection.chats?.status || "Sent"}
                            onChange={(e) =>
                              handleUpdateStatus(
                                connection.chat_id,
                                e.target.value
                              )
                            }
                            disabled={updatingStatus}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {updatingStatus && (
                            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 ${getStatusColorClass(
                            connection.chats?.status || "Sent"
                          )}`}
                          onClick={() => setEditingStatus(connection.chat_id)}
                        >
                          {getStatusLabel(connection.chats?.status || "Sent")}
                        </span>
                      )}
                    </div>

                    <div className="col-span-3 text-xs text-gray-500">
                      {connection.chats?.created_at
                        ? formatDistanceToNow(
                            new Date(connection.chats.created_at),
                            { addSuffix: true }
                          )
                        : "Unknown date"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="p-4 border-t">
            <p className="text-center text-sm text-gray-500">
              Showing {filteredConnections.length} of {connections.length}{" "}
              conversations
            </p>
          </div>
        </div>
      )}

      {/* Notes Popup Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Notes</h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className={`text-green-600 hover:text-green-800 flex items-center gap-1 ${
                      isSaving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isEditing ? (
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="w-full h-full min-h-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="whitespace-pre-wrap">{selectedNote.note}</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
