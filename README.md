
<div align="center">

# ST Discord Bot

[![GitHub](https://img.shields.io/badge/GitHub-sheikhtamimlover-181717?style=for-the-badge&logo=github)](https://github.com/sheikhtamimlover/ST_DiscordBot.git)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2?style=for-the-badge&logo=discord)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Visitors](https://api.visitorbadge.io/api/visitors?path=sheikhtamimlover.ST_DiscordBot&label=Visitors&countColor=%23263759)](https://visitorbadge.io/status?path=sheikhtamimlover.ST_DiscordBot)

**A feature-rich Discord bot framework with dynamic command loading, database abstraction, and modern web dashboard**

[Features](#-features) • [Installation](#-installation) • [Configuration](#-configuration) • [Commands](#-commands) • [Documentation](#-documentation)

</div>

---

## 🌟 Features

- **🎯 Dynamic Command System** - Hot-reload support with automatic loading
- **🎪 Multiple Event Handlers** - ST, onReply, onChat, onReaction, onCallback
- **💾 Database Abstraction** - Switchable between JSON and MongoDB
- **📊 Web Dashboard** - Real-time stats and monitoring
- **👑 Admin Controls** - React-to-unsend, user moderation, command management
- **🎨 Beautiful UI** - Animated startup with ASCII banner
- **📝 Advanced Logging** - Colored console output with timestamps
- **🔄 Auto-Update** - Built-in update system from GitHub
- **🔘 Button Interactions** - Discord button support with callbacks

---

## 📦 Installation

### Quick Start

```bash
git clone https://github.com/sheikhtamimlover/ST_DiscordBot.git && cp -r ST_DiscordBot/. . && rm -rf ST_DiscordBot && npm i && npm start
```

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sheikhtamimlover/ST_DiscordBot.git
   cd ST_DiscordBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Run the bot**
   ```bash
   npm start
   # or
   node ST.js
   ```

---

## ⚙️ Configuration

### Getting Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Under "Token", click "Reset Token" and copy it
5. Under "Bot" → "Privileged Gateway Intents", enable:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to "OAuth2" → "URL Generator":
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Administrator` (or specific permissions)
   - Copy the generated URL and invite the bot to your server

### Environment Setup (.env)

```env
BOT_TOKEN=your_discord_bot_token_here
BOT_CLIENT_ID=your_bot_client_id_here
MONGODB_URI=mongodb://localhost:27017/stbot  # Optional, only if using MongoDB
```

### Configuration File (config.json)

```json
{
  "prefix": "!",                    // Command prefix
  "databaseType": "json",           // "json" or "mongo"
  "databaseUrl": "",                // MongoDB URL (if using MongoDB)
  "botToken": "",                   // Can use .env instead
  "botClientId": "",                // Your bot's client ID
  "adminUIDs": ["your_user_id"],    // Admin Discord user IDs
  "dashboardPort": 3000,            // Web dashboard port
  "timezone": "Asia/Dhaka",         // Your timezone
  "showBanner": true,               // Show ASCII banner on startup
  "skipCmds": [],                   // Commands to skip loading
  "skipEvents": [],                 // Events to skip loading
  "reactUnsend": {
    "enabled": true,                // Allow admins to unsend by reacting
    "emoji": "👍"                   // Reaction emoji to unsend
  },
  "adminOnly": false,               // Restrict bot to admins only
  "dmNotifyOnStart": true,          // Notify admins via DM on startup
  "commandSuggestions": true,       // Show command suggestions on typo
  "autoUptime": {
    "enable": true,
    "url": "",
    "timeInterval": 180
  }
}
```

---

## 🎮 Commands

| Command | Description | Role | Category |
|---------|-------------|------|----------|
| `!help` | Show all commands | Everyone | Utility |
| `!cmd load/unload/install` | Manage commands | Admin | Admin |
| `!update` | Check and install updates | Admin | Admin |
| `!restart` | Restart the bot | Admin | Admin |
| `!prefix <new>` | Change command prefix | Admin | Admin |
| `!ban @user` | Ban a user | Admin | Moderation |
| `!unban <userId>` | Unban a user | Admin | Moderation |
| `!kick @user` | Kick a user | Admin | Moderation |
| `!warn @user` | Warn a user | Admin | Moderation |
| `!userinfo @user` | Show user info | Everyone | Utility |
| `!uptimer` | Bot uptime & stats | Everyone | Utility |
| `!sing <song>` | Download audio | Everyone | Media |
| `!autodl <url>` | Download media | Everyone | Media |

---

## 📚 Documentation

### Creating Commands

Commands are located in `scripts/cmds/` and follow this structure:

```javascript
module.exports = {
  config: {
    name: "commandname",           // Command name (required)
    aliases: ["alias1", "alias2"], // Alternative names (optional)
    version: "1.0.0",              // Version (optional)
    author: "Your Name",           // Author name (optional)
    role: 0,                       // 0: everyone, 2: admin (required)
    shortDescription: "Short desc", // Brief description (required)
    longDescription: "Full desc",  // Detailed description (optional)
    category: "utility",           // Command category (required)
    guide: "{p}cmd <args>",        // Usage guide (optional)
    countDown: 5                   // Cooldown in seconds (optional)
  },
  
  // Main command execution
  ST: async function({ api, event, args, message, usersData, threadsData, client }) {
    await message.reply("Hello World!");
  },
  
  // Triggered on every message (optional)
  onChat: async function({ event, message, usersData, config }) {
    if (event.body.includes("hello")) {
      await message.reply("Hi there!");
    }
  },
  
  // Triggered when user replies to bot's message (optional)
  onReply: async function({ event, message, Reply, usersData }) {
    await message.reply(`You replied: ${event.body}`);
  },
  
  // Triggered when user reacts to bot's message (optional)
  onReaction: async function({ event, message, Reaction, usersData }) {
    await message.reply(`You reacted with: ${event.reaction}`);
  },
  
  // Triggered on button click (optional)
  onCallback: async function({ interaction, message, event, callbackData }) {
    await interaction.reply({ content: "Button clicked!", ephemeral: true });
  }
};
```

### Message API (`utils/message.js`)

The `message` object provides these methods:

```javascript
// Send messages
await message.reply("Text");                    // Reply to message
await message.send("Text");                     // Send new message

// Send with attachments
await message.reply({ 
  body: "Caption", 
  attachment: fs.createReadStream("file.jpg") 
});

// Progress tracking
const progress = await message.pr("Processing...");
await progress.success("Done!");                // ✅ Done!
await progress.error("Failed!");                // ❌ Failed!
await progress.update("Still working...");      // Update text

// Buttons
const btn1 = message.createButton("custom_id", "Label", "Primary", "🔘");
await message.sendWithButtons("Choose:", [btn1], async (interaction) => {
  await interaction.reply({ content: "Clicked!", ephemeral: true });
});

// Reactions
await message.react("👍");                      // React to message
await message.react("❤️", messageID);           // React to specific message

// Edit/Delete
await message.edit(messageID, "New text");      // Edit message
await message.unsend(messageID);                // Delete message

// Attachments
const hasAttachments = message.hasAttachments(); // Check for attachments
const attachments = message.getAttachments();    // Get all attachments
const buffer = await message.downloadMedia(0);   // Download attachment

// Typing indicator
await message.typingIndicator(5000);            // Show typing for 5s
```

### Event Handlers

Events are located in `scripts/events/`:

```javascript
module.exports = {
  config: {
    name: "eventname",
    version: "1.0.0",
    author: "Your Name",
    eventType: "guildMemberAdd"  // Discord.js event type
  },
  
  ST: async function({ member, client }) {
    // Event logic here
  }
};
```

Supported event types:
- `guildMemberAdd` - User joins server
- `guildMemberRemove` - User leaves server

### Command Configuration Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `name` | String | Command name | ✅ |
| `aliases` | Array | Alternative command names | ❌ |
| `version` | String | Command version | ❌ |
| `author` | String | Author name | ❌ |
| `role` | Number | 0=everyone, 2=admin | ✅ |
| `shortDescription` | String | Brief description | ✅ |
| `longDescription` | String | Detailed description | ❌ |
| `category` | String | Command category | ✅ |
| `guide` | String | Usage guide | ❌ |
| `countDown` | Number | Cooldown (seconds) | ❌ |

---

## 🗂️ Project Structure

```
ST_DiscordBot/
├── bot/
│   ├── handler/
│   │   ├── handlerEvents.js    # Command/event routing
│   │   └── handlerAction.js    # React-to-unsend handler
│   ├── login/
│   │   └── login.js            # Animated login sequence
│   └── loadData.js             # Dynamic command/event loader
├── database/
│   ├── DataProvider.js         # Database interface
│   ├── JSONProvider.js         # JSON implementation
│   ├── MongoProvider.js        # MongoDB implementation
│   ├── userdb.js               # User data management
│   └── groupdb.js              # Thread/group management
├── utils/
│   ├── message.js              # Discord message wrappers
│   └── utils.js                # Utility functions
├── logger/
│   └── logs.js                 # Logging system
├── scripts/
│   ├── cmds/                   # Command files
│   └── events/                 # Event files
├── dashboard/
│   ├── server.js               # Express server
│   └── public/                 # Dashboard frontend
├── ST.js                       # Main entry point
├── config.json                 # Bot configuration
└── package.json                # Dependencies
```

---

## 🌐 Web Dashboard

Access the dashboard at `http://localhost:3000` to view:

- 📊 Real-time bot statistics
- ⏱️ Uptime monitoring
- 📝 Commands and events list
- 💾 Database information
- 🖥️ System resources

---

## 🔧 Global Objects

Access these anywhere in commands/events:

```javascript
global.config          // Bot configuration
global.client          // Discord client
global.ST              // Commands, events, handlers
global.db              // Database provider
global.usersData       // User database
global.threadsData     // Thread/group database
global.utils           // Utility functions
global.logger          // Logging system
global.Callback        // Button callback storage
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sheikh Tamim**

- GitHub: [@sheikhtamimlover](https://github.com/sheikhtamimlover)
- Repository: [ST_DiscordBot](https://github.com/sheikhtamimlover/ST_DiscordBot.git)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you have any questions or need help, feel free to:

- Open an issue on GitHub
- Contact via Discord

---

<div align="center">

**Made with ❤️ by Sheikh Tamim**

⭐ Star this repo if you find it useful!

</div>
