# ST_DiscordBot

## Overview

ST_DiscordBot is a feature-rich Discord bot framework built with Node.js and Discord.js v14. The bot provides a dynamic command/event system with hot-reload capabilities, flexible database abstraction supporting both JSON and MongoDB storage, and a modern web dashboard for monitoring bot statistics. It includes admin controls, user moderation features, and a comprehensive logging system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Command and Event System

**Problem**: Need a flexible, extensible system for loading and managing bot commands and events without requiring bot restarts.

**Solution**: Dynamic module loading system with multiple handler types:
- `ST` handlers for main command execution
- `onReply` handlers for message reply callbacks
- `onChat` handlers for message monitoring
- `onReaction` handlers for reaction-based interactions

Commands and events are stored in the global `ST` object using Discord.js Collections and Maps. The system supports hot-reloading through the `cmd` command, allowing admins to load/unload/reload commands at runtime.

**Rationale**: This architecture provides maximum flexibility for bot development and maintenance. Developers can add new features without restarting the bot, and the multiple handler types allow for complex interaction patterns.

### Database Abstraction Layer

**Problem**: Need to support multiple database backends without changing application code.

**Solution**: Abstract `DataProvider` base class with concrete implementations for JSON and MongoDB storage. The database type is configurable via `config.json`.

**Implementations**:
- `JSONProvider`: File-based storage using JSON files with in-memory caching
- `MongoProvider`: MongoDB storage using Mongoose with flexible schemas

**Data Models**:
- `UsersData`: User profiles, statistics, economy data (money, exp, level), bans, warnings
- `ThreadsData`: Server/channel settings, member lists, configuration options

**Rationale**: The abstraction layer allows seamless switching between development (JSON) and production (MongoDB) environments. The provider pattern ensures consistent API across storage backends while leveraging backend-specific features when needed.

### Application Initialization and Lifecycle

**Problem**: Need coordinated startup sequence for bot configuration, database, Discord client, and web dashboard.

**Solution**: `GlobalContext` class manages initialization flow:
1. Load configuration from `config.json` and environment variables
2. Initialize selected database provider
3. Create Discord client with required intents and partials
4. Load commands and events dynamically
5. Start Express dashboard server
6. Freeze global objects to prevent accidental modifications

**Rationale**: Centralized initialization ensures proper dependency ordering and provides a single source of truth for global state. The freeze mechanism prevents runtime bugs from global state mutations.

### Message Handling and API Wrapper

**Problem**: Need consistent interface for sending messages, handling attachments, and managing message lifecycle across different command contexts.

**Solution**: `Message` utility class wraps Discord.js message operations:
- `reply()`: Send replies to commands with attachment support
- `send()`: Send new messages
- `unsend()`: Delete bot messages
- `react()`: Add reactions to messages
- `pr()`: Progress tracking with success/error states for long-running operations
- `createButton()`: Create Discord buttons for interactive messages
- `sendWithButtons()`: Send messages with button components
- Automatic attachment handling via `formatMessage()` supporting streams and file paths

**Rationale**: The wrapper provides a cleaner, more consistent API than raw Discord.js methods. It also handles common error cases and provides return values compatible with the bot's callback system. The progress tracker helps users understand long-running operations, and button support enables rich interactive experiences.

### Event Processing Pipeline

**Problem**: Need to route Discord events to appropriate handlers based on event type and command context.

**Solution**: Multi-stage event processing:
1. `messageCreate` → Check for commands (prefix-based) → Execute `ST` handler
2. `messageCreate` → Check for reply callbacks in `onReply` map → Execute callback
3. `messageCreate` → Iterate through `onChat` handlers for message monitoring
4. `messageReactionAdd` → Check `onReaction` map → Execute reaction callbacks
5. `messageReactionAdd` → Handle admin react-to-unsend feature
6. `interactionCreate` → Check for button callbacks in `Callback` map → Execute `onCallback` handler with author validation

**Rationale**: This pipeline architecture allows multiple handlers to process the same event without conflicts. The callback maps enable stateful interactions where commands can register follow-up handlers for specific messages. Button callbacks provide rich interactive experiences while maintaining security through author validation.

### Web Dashboard

**Problem**: Need real-time monitoring of bot status, statistics, and system metrics without SSH access.

**Solution**: Express server serving static HTML/CSS/JS dashboard with REST API endpoints:
- `/api/stats`: Bot statistics (uptime, command count, server count, memory usage)
- `/api/system`: System information (OS, CPU, memory)

Dashboard auto-refreshes every 5 seconds and displays online/offline status.

**Rationale**: Web-based dashboard provides accessible monitoring for non-technical users and enables quick health checks without command-line access.

### Logging System

**Problem**: Need consistent, readable logging across all bot operations with timestamp tracking and colored output.

**Solution**: Custom `Logger` class with colored console output:
- `info()`: General information (blue)
- `success()`: Successful operations (green)
- `warn()`: Warnings (yellow)
- `error()`: Errors with stack traces (red)
- `command()`: Command execution tracking (cyan)

**Rationale**: Colored logging improves readability during development and debugging. Specialized log methods for different contexts make it easier to filter and understand bot behavior.

### Moderation and Permission System

**Problem**: Need role-based access control for commands and admin-specific features.

**Solution**: Three-tier permission system:
- Role 0: All users
- Role 1: Server moderators (Discord permissions-based)
- Role 2: Bot administrators (configured in `config.json` via `adminUIDs`)

Special features:
- React-to-unsend: Admins can delete bot messages by reacting with configured emoji
- User banning/warning system with automatic kicks after threshold

**Rationale**: The tiered system provides granular control while remaining simple to configure. Discord permission integration leverages existing server roles, while bot admin UIDs allow cross-server administrative control.

## External Dependencies

### Core Libraries

- **discord.js v14**: Discord API wrapper providing client, gateway intents, and message handling
- **express v5**: Web server framework for dashboard HTTP endpoints
- **mongoose v8**: MongoDB ODM for flexible document storage (when using MongoDB backend)

### Utility Libraries

- **axios**: HTTP client for downloading attachments and external API calls
- **figlet**: ASCII art banner generation for startup animation
- **chalk v5**: Terminal string styling for colored logging output

### Data Storage

- **JSON Files**: File-based storage for development and small deployments (no external service required)
- **MongoDB**: Optional production database (requires connection URI via environment variable `MONGODB_URI` or config)

### Environment Configuration

Required environment variables:
- `BOT_TOKEN`: Discord bot authentication token
- `BOT_CLIENT_ID`: Discord application client ID
- `MONGODB_URI`: MongoDB connection string (optional, only if using MongoDB)

Configuration file (`config.json`) controls:
- Command prefix
- Database type selection
- Admin user IDs
- Dashboard port
- Feature toggles (banner, react-unsend)
- Timezone settings

## Recent Changes

**November 11, 2025 - Evening**: Bug fixes for media commands
- Fixed sing.js to send MP3 audio files instead of PNG images
  - Hardcoded .mp3 file extension to prevent incorrect format
  - Added proper cache directory creation
  - Implemented delayed file cleanup to prevent premature deletion
- Fixed beb.js reaction behavior to react to user's messages
  - ST command handler now reacts to user's command message
  - onReply handler reacts to user's reply message
  - onChat handler reacts to user's message
  - All emoji reactions now appear on the USER's messages instead of bot's responses
- Enhanced autodl.js video downloading
  - Added ✅ reaction to user's message after successful download
  - Implemented delayed file cleanup to ensure videos are sent before deletion
  - Improved user feedback consistency

**November 11, 2025**: Major enhancements to message handling, API integration, and command system
- Fixed STBotApis constructor error by exporting both class and instance in utils/utils.js
- Enhanced utils/message.js with comprehensive features:
  - Progress tracking system (`message.pr()`) for long-running operations
  - Improved `react()` method with proper message ID handling
  - Full attachment support for streams, file paths, and buffers
  - Button creation and interaction system (`createButton()`, `sendWithButtons()`)
- Implemented Callback button handler system in handlerEvents.js
  - Supports Discord button interactions with author validation
  - Commands can register callbacks for button clicks
  - Enables rich interactive experiences (e.g., MidJourney upscale buttons)
- Enhanced login sequence with ASCII art banner and improved logging
  - Colorful figlet banner on startup
  - Proper load sequencing: logo → connect → bot info → load commands/events → database stats → admin count → load time → copyright
  - Error messages displayed in red for better visibility
- Fixed all media command files (autodl, sing, beb, mj, gist, flux):
  - Converted to per-call STBotApis instantiation (prevents constructor errors)
  - Updated to use new message.pr() progress tracking
  - Fixed Discord attachment handling (removed Facebook Messenger patterns)
  - MidJourney command now uses button callbacks (U1-U4) instead of onReply
- Updated package.json with repository metadata and proper project information
- All commands verified working with Discord.js v14

**November 10, 2025**: Initial implementation complete
- Implemented complete Discord bot framework with all core features
- Created 9 production-ready commands (help, cmd, unsend, uptimer, kick, ban, unban, warn, userinfo)
- Created 2 event handlers (welcome, leave)
- Built modern web dashboard with auto-refresh functionality
- Fixed dashboard API endpoints to use correct config field names (shortDescription/longDescription instead of description)
- All commands and events loading successfully

## Available Commands

### Core Commands
1. **help** - Display all available commands with categories
2. **cmd** - Admin command manager (load/unload/reload/install commands)
3. **unsend** - Unsend bot messages
4. **uptimer** - Show bot uptime and statistics

### Moderation Commands
5. **kick** - Kick users from server (admin)
6. **ban** - Ban users (admin)
7. **unban** - Unban users (admin)
8. **warn** - Warning system with auto-kick after 3 warnings (admin)
9. **userinfo** - Display user information and stats

### Media & AI Commands
10. **autodl** - Automatic video downloader for TikTok, Facebook, Instagram, YouTube, Twitter/X, Pinterest, Reddit, LinkedIn, CapCut, Douyin, Snapchat, Threads, and Tumblr
11. **sing** - Download and play audio from YouTube using song name or URL
12. **beb** - AI chatbot with conversation memory and image generation capabilities
13. **mj** (midjourney) - Generate AI images with MidJourney style, includes interactive U1-U4 upscale buttons
14. **flux** - Generate AI images using Flux model with custom aspect ratios
15. **gist** - Upload code to STBotApis raw storage (supports direct upload or from command/event files)

## Setup Instructions

1. Obtain Discord bot token from Discord Developer Portal
2. Add token to `.env` file or `config.json`
3. Configure admin user IDs in `config.json`
4. Run `node ST.js` to start the bot
5. Access dashboard at `http://localhost:3000`