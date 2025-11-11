module.exports = {
  config: {
    name: "unsend",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 1,
    role: 0,
    shortDescription: "Unsend bot's message",
    longDescription: "Delete the bot's last message or a specific message by replying to it",
    category: "utility",
    guide: "{p}unsend\n{p}unsend (reply to bot message)"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, threadID, messageID, reference } = event;

      if (reference) {
        const replyToMessage = reference.messageId;
        
        try {
          const targetMessage = await event.channel.messages.fetch(replyToMessage);
          
          if (targetMessage.author.id !== global.client.user.id) {
            return message.reply('❌ I can only unsend my own messages.');
          }

          const senderUser = await usersData.get(senderID);
          const isAdmin = global.config.adminUIDs.includes(senderID);
          const hasPermission = isAdmin || targetMessage.mentions.has(senderID);

          if (!hasPermission) {
            return message.reply('❌ You can only unsend messages that mention you or if you\'re an admin.');
          }

          await targetMessage.delete();
          const confirmMsg = await message.reply('✅ Message unsent successfully.');
          
          setTimeout(async () => {
            try {
              await message.unsend(confirmMsg.messageID);
            } catch (e) {}
          }, 3000);

        } catch (error) {
          global.logger.error('Error unsending specific message', error);
          return message.reply('❌ Could not unsend that message. It may have been already deleted.');
        }
      } else {
        try {
          const messages = await event.channel.messages.fetch({ limit: 20 });
          const botMessages = messages.filter(msg => 
            msg.author.id === global.client.user.id && 
            msg.id !== messageID
          );

          if (botMessages.size === 0) {
            return message.reply('❌ No recent bot messages found to unsend.');
          }

          const lastBotMessage = botMessages.first();
          await lastBotMessage.delete();

          const confirmMsg = await message.reply('✅ Last message unsent successfully.');
          
          setTimeout(async () => {
            try {
              await message.unsend(confirmMsg.messageID);
              await event.delete();
            } catch (e) {}
          }, 3000);

        } catch (error) {
          global.logger.error('Error unsending last message', error);
          return message.reply('❌ Could not unsend the last message.');
        }
      }

    } catch (error) {
      global.logger.error('Error in unsend command', error);
      await message.reply('❌ An error occurred while trying to unsend the message.');
    }
  }
};
