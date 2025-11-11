module.exports = {
  config: {
    name: "userinfo",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 0,
    shortDescription: "Show user information",
    longDescription: "Display detailed information about a user including their Discord profile and bot database statistics",
    category: "info",
    guide: "{p}userinfo\n{p}userinfo @user\n{p}userinfo <userID>"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, guild, author } = event;

      let targetUser = null;
      let targetMember = null;

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

      if (guild) {
        targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
      }

      const userData = await usersData.get(targetUser.id);

      let userInfo = `👤 **User Information**\n\n`;
      
      userInfo += `**Discord Profile**\n`;
      userInfo += `• Username: ${targetUser.username}\n`;
      userInfo += `• Tag: ${targetUser.tag}\n`;
      userInfo += `• ID: ${targetUser.id}\n`;
      userInfo += `• Bot: ${targetUser.bot ? 'Yes ✅' : 'No ❌'}\n`;
      
      const createdDate = new Date(targetUser.createdAt);
      userInfo += `• Account Created: ${createdDate.toLocaleDateString()} (${this.getTimeSince(createdDate)})\n`;

      if (targetMember) {
        userInfo += `\n**Server Information**\n`;
        userInfo += `• Nickname: ${targetMember.nickname || 'None'}\n`;
        
        const joinedDate = new Date(targetMember.joinedAt);
        userInfo += `• Joined Server: ${joinedDate.toLocaleDateString()} (${this.getTimeSince(joinedDate)})\n`;
        
        const roles = targetMember.roles.cache
          .filter(role => role.id !== guild.id)
          .sort((a, b) => b.position - a.position)
          .map(role => role.name);
        
        userInfo += `• Roles (${roles.length}): ${roles.length > 0 ? roles.slice(0, 5).join(', ') + (roles.length > 5 ? '...' : '') : 'None'}\n`;
        userInfo += `• Highest Role: ${targetMember.roles.highest.name}\n`;
        
        const permissions = [];
        if (targetMember.permissions.has('Administrator')) permissions.push('Administrator');
        if (targetMember.permissions.has('ManageGuild')) permissions.push('Manage Server');
        if (targetMember.permissions.has('ManageChannels')) permissions.push('Manage Channels');
        if (targetMember.permissions.has('BanMembers')) permissions.push('Ban Members');
        if (targetMember.permissions.has('KickMembers')) permissions.push('Kick Members');
        if (targetMember.permissions.has('ModerateMembers')) permissions.push('Moderate Members');
        
        if (permissions.length > 0) {
          userInfo += `• Key Permissions: ${permissions.join(', ')}\n`;
        }
      }

      userInfo += `\n**Bot Database Stats**\n`;
      userInfo += `• Name: ${userData.name || 'Unknown'}\n`;
      userInfo += `• Money: ${userData.money || 0} 💰\n`;
      userInfo += `• Experience: ${userData.exp || 0} XP\n`;
      userInfo += `• Level: ${userData.level || 1} 🎮\n`;
      userInfo += `• Messages: ${userData.messageCount || 0} 💬\n`;
      userInfo += `• Warnings: ${userData.warnings || 0}/3 ⚠️\n`;
      userInfo += `• Banned: ${userData.banned ? 'Yes 🔴' : 'No 🟢'}\n`;

      if (userData.banned && userData.banReason) {
        userInfo += `• Ban Reason: ${userData.banReason}\n`;
      }

      if (userData.createdAt) {
        const dbCreatedDate = new Date(userData.createdAt);
        userInfo += `• First Seen: ${dbCreatedDate.toLocaleDateString()}\n`;
      }

      const statusEmoji = {
        online: '🟢 Online',
        idle: '🟡 Idle',
        dnd: '🔴 Do Not Disturb',
        offline: '⚫ Offline'
      };

      if (targetMember && targetMember.presence) {
        userInfo += `\n**Status**\n`;
        userInfo += `• ${statusEmoji[targetMember.presence.status] || targetMember.presence.status}\n`;
        
        if (targetMember.presence.activities.length > 0) {
          const activity = targetMember.presence.activities[0];
          userInfo += `• Activity: ${activity.name}\n`;
        }
      }

      await message.reply(userInfo);

    } catch (error) {
      global.logger.error('Error in userinfo command', error);
      await message.reply('❌ An error occurred while fetching user information.');
    }
  },

  getTimeSince(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    
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
        return `${interval} ${name}${interval !== 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }
};
