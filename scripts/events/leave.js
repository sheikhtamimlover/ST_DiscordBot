module.exports = {
  config: {
    name: "leave",
    version: "1.0.0",
    author: "Sheikh Tamim",
    eventType: "guildMemberRemove",
    shortDescription: "Farewell message for leaving members",
    longDescription: "Send a farewell message when a member leaves or is removed from the server"
  },

  ST: async function ({ event: member }) {
    try {
      const guild = member.guild;
      const threadData = await global.threadsData.get(guild.id);

      if (threadData.settings && threadData.settings.leaveMessage === false) {
        return;
      }

      const leaveChannel = guild.systemChannel || 
                          guild.channels.cache.find(ch => 
                            ch.type === 0 && 
                            ch.permissionsFor(guild.members.me).has('SendMessages')
                          );

      if (!leaveChannel) {
        global.logger.warn(`No leave channel found for guild: ${guild.name} (${guild.id})`);
        return;
      }

      await global.threadsData.removeMember(guild.id, member.id);

      const userData = await global.usersData.get(member.id);
      const memberCount = guild.memberCount;

      const joinedDate = member.joinedAt;
      const timeInServer = joinedDate ? this.getTimeDifference(joinedDate, new Date()) : 'unknown time';

      const leaveMessages = [
        `👋 **${member.user.tag}** has left the server.\n\nThey were with us for ${timeInServer}. We now have ${memberCount} members.`,
        `😢 Goodbye **${member.user.tag}**!\n\nThanks for being part of our community for ${timeInServer}. ${memberCount} members remaining.`,
        `🚪 **${member.user.tag}** just left.\n\nMember count: ${memberCount}`,
        `💨 **${member.user.username}** has left the building!\n\nThey spent ${timeInServer} with us. Current members: ${memberCount}.`
      ];

      const randomLeave = leaveMessages[Math.floor(Math.random() * leaveMessages.length)];

      await leaveChannel.send(randomLeave);

      const auditLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: 20
      }).catch(() => null);

      if (auditLogs) {
        const kickLog = auditLogs.entries.first();
        
        if (kickLog && kickLog.target.id === member.id && 
            (Date.now() - kickLog.createdTimestamp) < 5000) {
          
          global.logger.info(
            `Member kicked: ${member.user.tag} (${member.id}) by ${kickLog.executor.tag} ` +
            `from guild: ${guild.name} (${guild.id}) - Reason: ${kickLog.reason || 'No reason provided'}`
          );
        } else {
          global.logger.info(`Member left: ${member.user.tag} (${member.id}) from guild: ${guild.name} (${guild.id})`);
        }
      } else {
        global.logger.info(`Member left: ${member.user.tag} (${member.id}) from guild: ${guild.name} (${guild.id})`);
      }

    } catch (error) {
      global.logger.error('Error in leave event', error);
    }
  },

  getTimeDifference(startDate, endDate) {
    const diff = Math.abs(endDate - startDate);
    const seconds = Math.floor(diff / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return `${interval} ${name}${interval !== 1 ? 's' : ''}`;
      }
    }

    return 'less than a minute';
  }
};
