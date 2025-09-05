# AI-ChatBot 
# Overview

This is a full-stack AI chatbot application that provides a ChatGPT-like interface for interacting with multiple AI providers (OpenAI, Anthropic Claude, and Google Gemini). The application features real-time streaming responses, session management, and a modern React frontend with a Node.js/Express backend.

The system is designed as a production-ready chatbot capstone project that demonstrates integration with multiple AI providers, real-time streaming communication, and comprehensive session/message persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: Server-Sent Events (SSE) for streaming AI responses

The frontend follows a component-based architecture with custom hooks for chat functionality, streaming, and mobile responsiveness. The UI supports both desktop and mobile layouts with a collapsible sidebar.

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **AI Provider Pattern**: Abstract base provider class with concrete implementations for OpenAI, Anthropic, and Gemini
- **Session Management**: RESTful API endpoints with streaming support via Server-Sent Events

The backend uses a provider pattern to abstract different AI services, making it easy to add new providers. Each provider implements streaming chat functionality while maintaining a consistent interface.

## Data Storage
- **Database**: PostgreSQL with Neon serverless connection pooling
- **Schema**: Normalized relational design with users, sessions, and messages tables
- **Migration System**: Drizzle Kit for schema migrations and database management
- **Connection Management**: Connection pooling via Neon's serverless adapter with WebSocket support

The database schema supports user accounts, chat sessions, and message history with proper relationships and foreign key constraints.

## Real-time Streaming
- **Protocol**: Server-Sent Events (SSE) for unidirectional streaming from server to client
- **Implementation**: Custom streaming hooks on frontend with EventSource API
- **Flow**: Client initiates stream request → Server processes with AI provider → Chunks streamed back in real-time
- **Error Handling**: Graceful degradation with connection retry logic and user feedback

## AI Provider Integration
- **OpenAI**: Direct integration with OpenAI SDK supporting GPT models including GPT-5
- **Anthropic**: Claude integration with latest Sonnet 4 model support
- **Google Gemini**: Integration with Gemini 2.5 Pro and Flash models
- **Provider Selection**: Runtime provider switching with model-specific configuration
- **Fallback Strategy**: Each provider checks API key availability before activation

# External Dependencies

## AI Services
- **OpenAI API**: Primary AI provider using official OpenAI SDK
- **Anthropic Claude API**: Secondary provider via Anthropic SDK
- **Google Gemini API**: Third provider using Google GenAI SDK
- **Authentication**: API key-based authentication for all providers

## Database & Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **WebSocket Support**: Required for Neon's serverless connection via ws library

## Frontend Libraries
- **Radix UI**: Comprehensive component primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution for React
- **Date-fns**: Date formatting and manipulation utilities

## Development & Build Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment integration with runtime error overlay

## UI Component System
- **Shadcn/ui**: Pre-built component library based on Radix UI
- **Class Variance Authority**: Component variant management
- **Lucide React**: Icon library for consistent iconography
