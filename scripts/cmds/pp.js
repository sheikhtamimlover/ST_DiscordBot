
module.exports = {
  config: {
    name: "pp",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 0,
    shortDescription: "Get user avatar",
    longDescription: "Display a user's Discord profile picture in high quality",
    category: "info",
    guide: "{p}pp\n{p}pp @user\n{p}pp <userID>\n{p}pp (reply to message)"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { author } = event;
      let targetUser = null;

      if (event.mentions && event.mentions.users && event.mentions.users.size > 0) {
        targetUser = event.mentions.users.first();
      } else if (event.reference) {
        try {
          const repliedMessage = await event.channel.messages.fetch(event.reference.messageId);
          targetUser = repliedMessage.author;
        } catch (err) {
          // If fetch fails, check args
        }
      }

      if (!targetUser && args[0]) {
        try {
          targetUser = await global.client.users.fetch(args[0]);
        } catch {
          return message.reply('❌ Invalid user ID. Please mention a user or provide a valid user ID.');
        }
      }

      if (!targetUser) {
        targetUser = author;
      }

      const avatarURL = targetUser.displayAvatarURL({ 
        dynamic: true, 
        size: 4096 
      });

      await message.reply({
        body: `🖼️ **${targetUser.username}'s Avatar**`,
        attachment: avatarURL
      });

    } catch (error) {
      global.logger.error('Error in pp command', error);
      await message.reply('❌ An error occurred while fetching the avatar.');
    }
  }
};
