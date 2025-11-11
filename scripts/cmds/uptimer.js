module.exports = {
  config: {
    name: "uptimer",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 0,
    shortDescription: "Show bot uptime",
    longDescription: "Display how long the bot has been running since last restart",
    category: "info",
    guide: "{p}uptimer"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const ST = require('../../ST');
      const uptime = Date.now() - ST.startTime;

      const seconds = Math.floor(uptime / 1000) % 60;
      const minutes = Math.floor(uptime / (1000 * 60)) % 60;
      const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

      let uptimeText = '⏱️ **Bot Uptime**\n\n';
      
      if (days > 0) {
        uptimeText += `📅 ${days} day${days !== 1 ? 's' : ''}\n`;
      }
      if (hours > 0) {
        uptimeText += `🕐 ${hours} hour${hours !== 1 ? 's' : ''}\n`;
      }
      if (minutes > 0) {
        uptimeText += `⏰ ${minutes} minute${minutes !== 1 ? 's' : ''}\n`;
      }
      uptimeText += `⏱️ ${seconds} second${seconds !== 1 ? 's' : ''}\n\n`;

      const totalCommands = global.ST.commands.size;
      const totalEvents = global.ST.events.size;
      
      uptimeText += `📊 **Statistics**\n`;
      uptimeText += `Commands: ${totalCommands}\n`;
      uptimeText += `Events: ${totalEvents}\n`;
      uptimeText += `Prefix: ${global.config.prefix}\n`;

      const memoryUsage = process.memoryUsage();
      const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      uptimeText += `Memory: ${memoryMB} MB`;

      await message.reply(uptimeText);

    } catch (error) {
      global.logger.error('Error in uptimer command', error);
      await message.reply('❌ An error occurred while fetching uptime information.');
    }
  }
};
