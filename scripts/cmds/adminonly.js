
module.exports = {
  config: {
    name: "adminonly",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 0,
    role: 2,
    shortDescription: "Toggle admin-only mode",
    longDescription: "Enable or disable admin-only mode for the bot",
    category: "admin",
    guide: "{p}adminonly [on/off]"
  },

  ST: async function ({ api, event, args, message }) {
    try {
      if (args.length === 0) {
        const status = global.config.adminOnly ? 'ON' : 'OFF';
        return message.reply(`🔒 Admin-only mode is currently **${status}**\n\nUsage: \`${global.config.prefix}adminonly [on/off]\``);
      }

      const action = args[0].toLowerCase();
      
      if (action === 'on' || action === 'enable') {
        global.config.adminOnly = true;
        return message.reply('✅ Admin-only mode has been **ENABLED**. Only admins can use commands now.');
      } else if (action === 'off' || action === 'disable') {
        global.config.adminOnly = false;
        return message.reply('✅ Admin-only mode has been **DISABLED**. Everyone can use commands now.');
      } else {
        return message.reply('❌ Invalid argument. Use `on` or `off`.');
      }
    } catch (error) {
      global.logger.error('Error in adminonly command', error);
      await message.reply('❌ An error occurred.');
    }
  }
};
