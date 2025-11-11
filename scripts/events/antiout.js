
module.exports = {
  config: {
    name: "antiout",
    version: "1.0.0",
    author: "Sheikh Tamim"
  },

  ST: async function ({ api, event, threadsData }) {
    try {
      if (!event.guild) return;

      const threadID = event.guild.id;
      const threadData = await threadsData.get(threadID);

      if (!threadData || !threadData.antiOut) return;

      const member = event.member || event.user;
      if (!member) return;

      global.logger.info(`Member ${member.user ? member.user.tag : member.tag} left, attempting to re-invite...`);

      try {
        const channel = event.guild.channels.cache.find(ch => ch.type === 0);
        if (!channel) return;

        const invite = await channel.createInvite({
          maxAge: 86400,
          maxUses: 1,
          unique: true
        });

        const user = member.user || member;
        await user.send(
          `🔄 **Auto Re-Invite**\n\n` +
          `You left **${event.guild.name}** but anti-leave protection is enabled.\n` +
          `Here's your invite link to rejoin: ${invite.url}`
        );

        global.logger.info(`Re-invite sent to ${user.tag}`);
      } catch (error) {
        global.logger.error('Error sending re-invite', error);
      }
    } catch (error) {
      global.logger.error('Error in antiout event', error);
    }
  }
};
