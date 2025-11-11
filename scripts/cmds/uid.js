
module.exports = {
  config: {
    name: "uid",
    aliases: [],
    role: 0,
    prefix: true,
    category: "Utility",
    description: "Get user ID"
  },
  ST: async ({ api, event, args, message }) => {
    try {
      const { author } = event;
      let target = author;
      
      if (event.mentions && event.mentions.users && event.mentions.users.size > 0) {
        target = event.mentions.users.first();
      } else if (event.reference) {
        try {
          const repliedMessage = await event.channel.messages.fetch(event.reference.messageId);
          target = repliedMessage.author;
        } catch (err) {
          global.logger.error('Error fetching replied message', err);
        }
      } else if (args[0]) {
        try {
          target = await global.client.users.fetch(args[0]);
        } catch (err) {
          return message.reply('❌ Invalid user ID provided.');
        }
      }
      
      await message.reply(`**${target.username}**'s ID: \`${target.id}\``);
    } catch (error) {
      global.logger.error('Error in uid command', error);
      await message.reply('❌ An error occurred.');
    }
  }
};
