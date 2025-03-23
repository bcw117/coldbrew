"use server";
import { createClient } from "@/utils/supabase/server";

export async function createChat(
  user_id: string,
  notes: string,
  status: string = "Sent"
) {
  const supabase = await createClient();

  // Insert the new chat and return the ID
  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: user_id,
      notes: notes,
      status: status,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    chat_id: data.id,
  };
}

// Retrieves all chats for a user
export async function getChats(user_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Count chats created by a user in the past week
export async function getWeeklyChatsCount(user_id: string) {
  const supabase = await createClient();

  // Calculate date 7 days ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoISOString = oneWeekAgo.toISOString();

  // Query for chats created after that date
  const { count, error } = await supabase
    .from("chats")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user_id)
    .gte("created_at", oneWeekAgoISOString);

  if (error) {
    throw new Error(error.message);
  }

  return { count: count || 0 };
}

// Update chat notes
export async function updateChatNotes(chat_id: number, notes: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .update({ notes })
    .eq("id", chat_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    chat: data,
  };
}

// Update chat status
export async function updateChatStatus(chat_id: number, status: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .update({ status })
    .eq("id", chat_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    chat: data,
  };
}

// Retrieves all chats for a user with their associated connections (inner join)
export async function getChatsWithConnections(user_id: string) {
  const supabase = await createClient();

  // First, get all chats for the user
  const { data: chats, error: chatsError } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user_id);

  if (chatsError) {
    throw new Error(chatsError.message);
  }

  if (!chats || chats.length === 0) {
    return [];
  }

  // Extract chat IDs
  const chatIds = chats.map((chat) => chat.id);

  // Use .in() to get all connections that have a chat_id in the list of chat IDs
  const { data: connectionsWithChats, error: connectionsError } = await supabase
    .from("connections")
    .select(
      `
      *,
      chats:chat_id (*)
    `
    )
    .in("chat_id", chatIds);

  if (connectionsError) {
    throw new Error(connectionsError.message);
  }

  return {
    chats,
    connectionsWithChats,
  };
}

// Retrieves recent chats for a user from the past week
export async function getRecentChats(user_id: string, limit: number = 5) {
  const supabase = await createClient();

  // Calculate date 7 days ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoISOString = oneWeekAgo.toISOString();

  // Get recent chats with their connections
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      *,
      connections:connections(*)
    `
    )
    .eq("user_id", user_id)
    .gte("created_at", oneWeekAgoISOString)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
