import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";
import { BaseProvider } from "./providers/base";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize providers only when API keys are available
  const providers = new Map<string, BaseProvider>();
  
  // Only add providers that have API keys configured
  const openaiProvider = new OpenAIProvider();
  if (openaiProvider.isAvailable()) {
    providers.set('openai', openaiProvider);
  }
  
  const geminiProvider = new GeminiProvider();
  if (geminiProvider.isAvailable()) {
    providers.set('gemini', geminiProvider);
  }

  // Helper function to get available providers
  const getAvailableProviders = () => {
    const available: any = {};
    providers.forEach((provider, name) => {
      available[name] = {
        name: provider.name,
        models: provider.models,
      };
    });
    return available;
  };

  // Create a default user for demo purposes
  const ensureDefaultUser = async () => {
    let user = await storage.getUserByUsername("demo_user");
    if (!user) {
      try {
        user = await storage.createUser({
          username: "demo_user",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
        });
      } catch (error) {
        // User might already exist due to race condition, try to fetch again
        user = await storage.getUserByUsername("demo_user");
        if (!user) {
          throw error;
        }
      }
    }
    return user;
  };

  // API Routes

  // Get current user (demo user for now)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get available providers
  app.get("/api/providers", (req, res) => {
    res.json(getAvailableProviders());
  });

  // Get user sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const sessions = await storage.getUserSessions(user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get session with messages
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSessionWithMessages(id);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const sessionData = insertSessionSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Update session
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const session = await storage.updateSession(id, updates);
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete session
  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSession(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Send message with streaming response
  app.post("/api/sessions/:id/messages", async (req, res) => {
    try {
      const { id: sessionId } = req.params;
      const { content, provider, model } = req.body;

      // Validate session exists
      const session = await storage.getSessionWithMessages(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Get provider instance
      const providerInstance = providers.get(provider);
      if (!providerInstance || !providerInstance.isAvailable()) {
        return res.status(400).json({ error: `Provider ${provider} not available` });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        sessionId,
        role: 'user',
        content,
        provider,
        model,
      });

      // Set up SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // Send user message first
      res.write(`data: ${JSON.stringify({
        type: 'message',
        message: userMessage
      })}\n\n`);

      let assistantContent = "";
      let tokensUsed = 0;

      // Prepare conversation history
      const conversationHistory = session.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content,
      });

      try {
        // Stream AI response
        const response = await providerInstance.streamChat(
          conversationHistory,
          model,
          (chunk) => {
            if (chunk.type === 'token' && chunk.content) {
              assistantContent += chunk.content;
              res.write(`data: ${JSON.stringify({
                type: 'token',
                content: chunk.content
              })}\n\n`);
            } else if (chunk.type === 'error') {
              res.write(`data: ${JSON.stringify({
                type: 'error',
                error: chunk.error
              })}\n\n`);
            } else if (chunk.type === 'done') {
              res.write(`data: ${JSON.stringify({
                type: 'done'
              })}\n\n`);
            }
          }
        );

        tokensUsed = response.tokensUsed || 0;

        // Save assistant message
        const assistantMessage = await storage.createMessage({
          sessionId,
          role: 'assistant',
          content: assistantContent,
          provider,
          model,
          tokensUsed,
        });

        // Send final message
        res.write(`data: ${JSON.stringify({
          type: 'message',
          message: assistantMessage
        })}\n\n`);

        // Update session title if it's the first exchange
        if (session.messages.length === 0) {
          const title = content.length > 50 ? content.substring(0, 47) + "..." : content;
          await storage.updateSession(sessionId, { title });
        }

      } catch (streamError) {
        console.error("Streaming error:", streamError);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: 'Failed to generate response'
        })}\n\n`);
      }

      res.end();

    } catch (error) {
      console.error("Error in message endpoint:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });

  // Get session messages
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getSessionMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
