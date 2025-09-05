import { apiRequest } from "./queryClient";
import type { Session, SessionWithMessages, Message, InsertSession } from "@shared/schema";

export const api = {
  // Sessions
  async getSessions(): Promise<Session[]> {
    const response = await apiRequest("GET", "/api/sessions");
    return response.json();
  },

  async getSession(id: string): Promise<SessionWithMessages> {
    const response = await apiRequest("GET", `/api/sessions/${id}`);
    return response.json();
  },

  async createSession(data: InsertSession): Promise<Session> {
    const response = await apiRequest("POST", "/api/sessions", data);
    return response.json();
  },

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const response = await apiRequest("PATCH", `/api/sessions/${id}`, updates);
    return response.json();
  },

  async deleteSession(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/sessions/${id}`);
  },

  // Messages
  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}/messages`);
    return response.json();
  },

  // Providers
  async getProviders(): Promise<Record<string, { name: string; models: string[] }>> {
    const response = await apiRequest("GET", "/api/providers");
    return response.json();
  },
};
