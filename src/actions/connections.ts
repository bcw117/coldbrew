"use server";

import { NewConnection } from "@/utils/types/types";
import { createClient } from "@/utils/supabase/server";

// Create a new connection in the database
export async function createConnection(
  connection: NewConnection,
  chat_id: number
) {
  const supabase = await createClient();

  const { error } = await supabase.from("connections").insert({
    first_name: connection.first_name,
    last_name: connection.last_name,
    job_title: connection.job_title,
    headline: connection.headline,
    link: connection.link,
    profile_picture: connection.profile_picture,
    location: connection.location,
    chat_id: chat_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function getConnections(chat_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .eq("chat_id", chat_id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
} 