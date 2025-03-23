import { NewConnection } from "@/utils/types/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Create a new connection in the database
export async function createConnections(connections: NewConnection[]) {
  try {
    const supabase = await createClient();

    const mappedConnections = connections.map((connection) => ({
      first_name: connection.first_name,
      last_name: connection.last_name,
      job_title: connection.job_title,
      headline: connection.headline,
      location: connection.location,
      link: connection.link,
      profile_picture: connection.profile_picture,
    }));

    const { data, error } = await supabase
      .from("connections")
      .insert(mappedConnections)
      .select();

    if (error) {
      console.error("Error inserting connections:", error);
      throw new Error("Failed to create connections");
    }

    // Revalidate any paths that might display connections
    revalidatePath("/");

    return { success: true, message: "Connections created successfully" };
  } catch (error) {
    console.error("Error in createConnections:", error);
    throw error;
  }
}
