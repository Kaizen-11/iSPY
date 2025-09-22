# Overview

MailTracker Pro is a full-stack email tracking and intelligence application that provides users with comprehensive email analytics, read receipts, and AI-powered summaries. The application tracks email delivery, open rates, read times, and generates intelligent summaries of email communications using OpenAI's GPT models.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with the following key design decisions:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and a neutral color scheme
- **State Management**: TanStack Query (React Query) for server state management with infinite stale time and disabled refetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Component Structure**: Organized into pages, components, and UI components with clear separation of concerns

## Backend Architecture
The backend is an Express.js server with TypeScript providing RESTful APIs:

- **API Design**: RESTful endpoints for emails, summaries, notifications, and analytics
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with status code management
- **Development Setup**: Vite middleware integration for hot module replacement in development
- **Email Tracking**: Invisible pixel tracking system with unique tracking IDs for read receipts

## Data Storage Solutions
The application uses a hybrid storage approach:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development Storage**: In-memory storage implementation for quick development and testing
- **Schema Design**: Well-defined tables for users, emails, read receipts, AI summaries, and notifications
- **Data Validation**: Zod schemas for runtime type checking and validation

## Authentication and Authorization
Currently implements a demo user system:

- **Demo Mode**: Single demo user for showcasing functionality
- **User Management**: User schema prepared for full authentication implementation
- **Session Handling**: Infrastructure in place for session-based authentication

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database provider (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect for schema management and queries
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### AI Integration
- **OpenAI API**: GPT-5 model integration for email content analysis and summary generation
- **Email Intelligence**: Automated categorization, priority assessment, and key point extraction

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, forms, and navigation components
- **Tailwind CSS**: Utility-first CSS framework with custom color variables and responsive design
- **Lucide React**: Modern icon library for consistent iconography

### Development Tools
- **Replit Integration**: Development environment plugins for cartographer, dev banner, and runtime error overlay
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Vite**: Fast build tool with hot module replacement and optimized production builds

### Email Tracking Technology
- **Pixel Tracking**: 1x1 invisible image tracking for email open detection
- **User Agent Analysis**: Browser and device detection for detailed analytics
- **Session Tracking**: Read time and engagement measurement

### Date and Time Handling
- **date-fns**: Modern date utility library for formatting and time calculations