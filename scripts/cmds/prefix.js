
module.exports = {
  config: {
    name: "prefix",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 1,
    shortDescription: "Change or view prefix",
    longDescription: "Change the bot prefix for this server/DM or view the current prefix",
    category: "admin",
    guide: "{p}prefix\n{p}prefix <new_prefix>\n{p}prefix reset"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, threadID, guild } = event;
      const threadData = await threadsData.get(threadID);
      const currentPrefix = threadData.prefix || global.config.prefix;

      if (!args[0]) {
        return message.reply(
          `📌 **Prefix Information**\n\n` +
          `Current Prefix: \`${currentPrefix}\`\n` +
          `Global Prefix: \`${global.config.prefix}\`\n\n` +
          `**Usage:**\n` +
          `• \`${currentPrefix}prefix <new_prefix>\` - Change prefix\n` +
          `• \`${currentPrefix}prefix reset\` - Reset to global prefix`
        );
      }

      if (guild && !event.member.permissions.has('ManageGuild')) {
        return message.reply('❌ You need Manage Server permission to change the prefix.');
      }

      if (args[0].toLowerCase() === 'reset') {
        await threadsData.set(threadID, { prefix: null });
        return message.reply(`✅ Prefix has been reset to global prefix: \`${global.config.prefix}\``);
      }

      const newPrefix = args[0];
      
      if (newPrefix.length > 5) {
        return message.reply('❌ Prefix must be 5 characters or less.');
      }

      if (newPrefix.includes(' ')) {
        return message.reply('❌ Prefix cannot contain spaces.');
      }

      await threadsData.set(threadID, { prefix: newPrefix });
      
      return message.reply(
        `✅ **Prefix Changed**\n\n` +
        `Old Prefix: \`${currentPrefix}\`\n` +
        `New Prefix: \`${newPrefix}\`\n\n` +
        `Example: \`${newPrefix}help\``
      );

    } catch (error) {
      global.logger.error('Error in prefix command', error);
      await message.reply('❌ An error occurred while changing the prefix.');
    }
  }
};
