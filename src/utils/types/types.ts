export type User = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  linkedin_url?: string;
};

export type Connections = {
  id: string;
  linkedin_url: string;
  first_name: string;
  last_name: string;
  job_title: string;
  location: Location;
  headline: string;
  created_at: Date;
};

export type Chats = {
  id: string;
  user_id: string;
  connection_id: string;
  notes: string;
  created_at: Date;
};

export type NewConnection = {
  first_name: string;
  last_name: string;
  job_title: string;
  headline: string;
  link: string;
  profile_picture: string;
  location: Location;
  custom_message: string;
};

export type RecommendationResponse = {
  first_names: string[];
  last_names: string[];
  job_titles: string[];
  headlines: string[];
  links: string[];
  profile_pictures: string[];
  locations: Location[];
  custom_messages: string[];
};

export type Location = {
  city: string;
  state: string;
  country: string;
};
