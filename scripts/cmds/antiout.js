
module.exports = {
  config: {
    name: "antiout",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 1,
    shortDescription: "Toggle anti-leave protection",
    longDescription: "Enable or disable automatic re-invitation when members leave the server",
    category: "admin",
    guide: "{p}antiout on\n{p}antiout off\n{p}antiout status"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { guild, threadID } = event;

      if (!guild) {
        return message.reply('❌ This command can only be used in a server.');
      }

      if (!event.member.permissions.has('ManageGuild')) {
        return message.reply('❌ You need Manage Server permission to use this command.');
      }

      const threadData = await threadsData.get(threadID);
      
      if (!args[0]) {
        const status = threadData.antiOut ? 'enabled' : 'disabled';
        return message.reply(
          `🛡️ **Anti-Leave Status**\n\n` +
          `Current status: **${status}**\n\n` +
          `Usage:\n` +
          `• \`antiout on\` - Enable anti-leave\n` +
          `• \`antiout off\` - Disable anti-leave\n` +
          `• \`antiout status\` - Check status`
        );
      }

      const action = args[0].toLowerCase();

      if (action === 'on' || action === 'enable') {
        await threadsData.set(threadID, { antiOut: true });
        await message.reply('✅ Anti-leave protection **enabled**!\nMembers who leave will be automatically re-invited.');
      } else if (action === 'off' || action === 'disable') {
        await threadsData.set(threadID, { antiOut: false });
        await message.reply('✅ Anti-leave protection **disabled**.');
      } else if (action === 'status') {
        const status = threadData.antiOut ? 'enabled' : 'disabled';
        await message.reply(`🛡️ Anti-leave protection is currently **${status}**.`);
      } else {
        await message.reply('❌ Invalid option. Use `on`, `off`, or `status`.');
      }
    } catch (error) {
      global.logger.error('Error in antiout command', error);
      await message.reply('❌ An error occurred.');
    }
  }
};
