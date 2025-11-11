
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "restart",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Restart the bot",
    longDescription: "Restart the bot and show restart time",
    category: "admin",
    guide: "{p}restart"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const restartMsg = await message.reply('🔄 Restarting bot...');

      const cacheDir = path.join(__dirname, '../../cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const restartData = {
        channelId: event.channel.id,
        messageId: restartMsg.messageID,
        timestamp: Date.now()
      };

      fs.writeFileSync(
        path.join(cacheDir, 'restart.txt'),
        JSON.stringify(restartData, null, 2)
      );

      setTimeout(() => {
        process.exit(0);
      }, 1000);

    } catch (error) {
      global.logger.error('Error in restart command', error);
      await message.reply('❌ Failed to restart: ' + error.message);
    }
  }
};
