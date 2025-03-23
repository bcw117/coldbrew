"use server";

import { NewConnection, RecommendationResponse } from "@/utils/types/types";
import test from "./test.json";
import { createClient } from "@/utils/supabase/server";

export async function handleButtonClick(
  formData: FormData,
  id: string | undefined
): Promise<NewConnection[]> {
  const jobPostingUrl = formData.get("input") as string;

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select("linkedin_url")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const personalLinkedIn = user?.linkedin_url;

  console.log(personalLinkedIn);

  try {
    //Start the pipeline
    const response = await fetch(
      "https://api.gumloop.com/api/v1/start_pipeline",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GUMLOOP_API_KEY}`,
        },
        body: JSON.stringify({
          user_id: process.env.GUMLOOP_USER_ID,
          saved_item_id: process.env.GUMLOOP_SAVED_ITEM_ID,
          pipeline_inputs: [
            {
              input_name: "personal_linked_in",
              value: personalLinkedIn || "",
            },
            {
              input_name: "job_posting_url",
              value: jobPostingUrl,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gumloop API call failed");
    }

    const data = await response.json();
    console.log("Gumloop pipeline started:", data);

    // Get the run_id from the response
    const runId = data.run_id;

    // Get the pipeline run outputs
    const outputs = await getGumloopOutputs(runId);

    console.log(outputs);

    const citites = outputs.cities;
    const states = outputs.states;
    const countries = outputs.countries;

    const locations = citites.map((city: string, index: number) => ({
      city,
      state: states[index],
      country: countries[index],
    }));

    const parsedData: RecommendationResponse = {
      first_names: outputs.first_names,
      last_names: outputs.last_names,
      job_titles: outputs.job_titles,
      headlines: outputs.headlines,
      links: outputs.links,
      profile_pictures: outputs.profile_pictures,
      locations,
      custom_messages: outputs.custom_messages,
    };

    const connections: NewConnection[] = parsedData.first_names.map(
      (name, index) => ({
        first_name: name,
        last_name: parsedData.last_names[index],
        job_title: parsedData.job_titles[index],
        headline: parsedData.headlines[index],
        link: parsedData.links[index],
        profile_picture: parsedData.profile_pictures[index],
        location: parsedData.locations[index],
        custom_message: parsedData.custom_messages[index],
      })
    );

    return connections;
  } catch (error) {
    console.error("Error:", error);
    throw new Error((error as Error).message);
  }
}

// Function to poll and retrieve outputs
async function getGumloopOutputs(
  runId: string,
  maxAttempts = 30,
  delayMs = 2000
) {
  // Query parameters for the run_id and user_id
  const params = new URLSearchParams({
    run_id: runId,
    user_id: process.env.GUMLOOP_USER_ID as string,
  });

  let attempt = 0;

  while (attempt < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    attempt++;

    const response = await fetch(
      `https://api.gumloop.com/api/v1/get_pl_run?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GUMLOOP_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to retrieve run details: ${response.statusText}`);
    }

    const runData = await response.json();
    const state = runData.state;
    console.log(`Run state: ${state} (attempt ${attempt})`);

    // Continue polling if still running or terminating
    if (state === "RUNNING" || state === "TERMINATING") {
      continue;
    }

    // Return outputs if completed
    if (state === "DONE") {
      return runData.outputs;
    }

    // Handle failure states
    if (state === "FAILED" || state === "TERMINATED") {
      throw new Error(
        `Pipeline run ${state.toLowerCase()}: ${
          runData.log?.join("\n") || "No error logs provided"
        }`
      );
    }
  }

  throw new Error(
    `Pipeline run did not complete after ${maxAttempts} attempts`
  );
}
