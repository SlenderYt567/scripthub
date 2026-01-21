export type TaskType = 'youtube_subscribe' | 'youtube_like' | 'discord_join' | 'visit_url';

export interface Task {
  id: string;
  type: TaskType;
  url: string;
  text: string;
  isCompleted?: boolean;
}

export interface Script {
  id: string;
  title: string;
  gameName: string;
  description: string;
  imageUrl: string;
  author: string;
  author_id?: string; // Optional linkage to user ID
  views: number;
  rawLink?: string; // Made Optional: Can be empty if shortenerLink is the main access
  // Dynamic task system
  tasks: Task[];
  shortenerLink?: string; // e.g., Linkvertise (optional final step)
  createdAt: number;
  verified?: boolean; // Admin verification status
  isOfficial?: boolean; // SlenderHub Official Script
  keySystem: boolean; // New field: Does it require a key?
}

export interface Executor {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  status: 'Working' | 'Patched' | 'Updating' | 'Detected';
  platform: 'Windows' | 'Android' | 'iOS' | 'Mac';
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'Owner' | 'Admin';
}

export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  youtube_url?: string;
  discord_url?: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  file_name?: string;
  file_content?: string;
  created_at: string;
}