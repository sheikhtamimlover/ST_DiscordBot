module.exports = {
  config: {
    name: "welcome",
    version: "1.0.0",
    author: "Sheikh Tamim",
    eventType: "guildMemberAdd",
    shortDescription: "Welcome new members",
    longDescription: "Send a welcome message when a new member joins the server"
  },

  ST: async function ({ event: member }) {
    try {
      const guild = member.guild;
      const threadData = await global.threadsData.get(guild.id);

      if (threadData.settings && threadData.settings.welcomeMessage === false) {
        return;
      }

      const welcomeChannel = guild.systemChannel || 
                            guild.channels.cache.find(ch => 
                              ch.type === 0 && 
                              ch.permissionsFor(guild.members.me).has('SendMessages')
                            );

      if (!welcomeChannel) {
        global.logger.warn(`No welcome channel found for guild: ${guild.name} (${guild.id})`);
        return;
      }

      await global.threadsData.addMember(guild.id, member.id);

      const userData = await global.usersData.get(member.id);
      await global.usersData.set(member.id, {
        name: member.user.username,
        avatar: member.user.displayAvatarURL(),
        username: member.user.tag
      });

      const memberCount = guild.memberCount;
      const prefix = global.config.prefix || "!";

      const welcomeMessages = [
        `🎉 Welcome to **${guild.name}**, ${member}!\n\nYou are member #${memberCount}! We're glad to have you here.`,
        `👋 Hey ${member}! Welcome to our community!\n\nYou're the ${memberCount}${this.getOrdinalSuffix(memberCount)} member to join us!`,
        `🌟 A wild ${member.user.username} appeared!\n\nWelcome to **${guild.name}**! You're member #${memberCount}.`,
        `🎊 ${member} just joined the server!\n\nWelcome! Make yourself at home. You're our ${memberCount}${this.getOrdinalSuffix(memberCount)} member!`
      ];

      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

      let welcomeText = randomWelcome;
      welcomeText += `\n\n📌 Type \`${prefix}help\` to see available commands.`;

      const rulesChannel = guild.channels.cache.find(ch => 
        ch.name.toLowerCase().includes('rule') || 
        ch.name.toLowerCase().includes('guideline')
      );

      if (rulesChannel) {
        welcomeText += `\n📜 Please read ${rulesChannel} before chatting.`;
      }

      await welcomeChannel.send(welcomeText);

      try {
        await member.send(
          `👋 **Welcome to ${guild.name}!**\n\n` +
          `Thanks for joining! Here are a few things to get you started:\n\n` +
          `• Check out the server rules\n` +
          `• Introduce yourself to the community\n` +
          `• Type \`${prefix}help\` to see what I can do\n\n` +
          `If you need any help, feel free to ask the moderators or admins!\n\n` +
          `Enjoy your stay! 🎉`
        );
      } catch (error) {
        global.logger.warn(`Could not send welcome DM to ${member.user.tag} (${member.id})`);
      }

      global.logger.info(`New member welcomed: ${member.user.tag} (${member.id}) in guild: ${guild.name} (${guild.id})`);

    } catch (error) {
      global.logger.error('Error in welcome event', error);
    }
  },

  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }
};
