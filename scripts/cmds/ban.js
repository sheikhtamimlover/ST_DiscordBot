module.exports = {
  config: {
    name: "ban",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Ban a user from server",
    longDescription: "Ban a member from the Discord server permanently. Requires admin permissions.",
    category: "admin",
    guide: "{p}ban @user [reason]\n{p}ban <userID> [reason]"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, guild, mentions } = event;

      if (!guild) {
        return message.reply('❌ This command can only be used in a server.');
      }

      if (!event.member.permissions.has('BanMembers')) {
        return message.reply('❌ You need "Ban Members" permission to use this command.');
      }

      if (!guild.members.me.permissions.has('BanMembers')) {
        return message.reply('❌ I don\'t have permission to ban members.');
      }

      let targetUser = null;
      let reason = 'No reason provided';

      if (mentions.users.size > 0) {
        targetUser = mentions.users.first();
        reason = args.slice(1).join(' ') || reason;
      } else if (args[0]) {
        try {
          targetUser = await global.client.users.fetch(args[0]);
          reason = args.slice(1).join(' ') || reason;
        } catch {
          return message.reply('❌ Invalid user ID or mention. Please mention a user or provide a valid user ID.');
        }
      } else {
        return message.reply('❌ Please mention a user or provide a user ID.\nUsage: `ban @user [reason]`');
      }

      const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

      if (targetMember) {
        if (targetMember.id === guild.ownerId) {
          return message.reply('❌ Cannot ban the server owner.');
        }

        if (targetMember.id === global.client.user.id) {
          return message.reply('❌ I cannot ban myself.');
        }

        if (targetMember.id === senderID) {
          return message.reply('❌ You cannot ban yourself.');
        }

        if (!targetMember.bannable) {
          return message.reply('❌ I cannot ban this user. They may have a higher role than me.');
        }

        const senderMember = await guild.members.fetch(senderID);
        if (targetMember.roles.highest.position >= senderMember.roles.highest.position) {
          return message.reply('❌ You cannot ban a user with an equal or higher role than yours.');
        }
      }

      const existingBan = await guild.bans.fetch(targetUser.id).catch(() => null);
      if (existingBan) {
        return message.reply('❌ This user is already banned from the server.');
      }

      try {
        await targetUser.send(
          `🔨 You have been banned from **${guild.name}**\n` +
          `Reason: ${reason}\n` +
          `Banned by: ${event.author.tag}`
        ).catch(() => {});

        await guild.members.ban(targetUser, {
          reason: reason,
          deleteMessageSeconds: 60 * 60 * 24
        });

        await usersData.ban(targetUser.id, reason);

        await message.reply(
          `✅ **User Banned**\n\n` +
          `👤 User: ${targetUser.tag}\n` +
          `🆔 ID: ${targetUser.id}\n` +
          `📝 Reason: ${reason}\n` +
          `👮 By: ${event.author.tag}\n` +
          `🗑️ Messages: Deleted (last 24h)`
        );

        global.logger.info(`User banned: ${targetUser.tag} (${targetUser.id}) by ${event.author.tag} - Reason: ${reason}`);

      } catch (error) {
        global.logger.error('Error banning user', error);
        await message.reply('❌ Failed to ban the user. Please check my permissions and try again.');
      }

    } catch (error) {
      global.logger.error('Error in ban command', error);
      await message.reply('❌ An error occurred while executing the ban command.');
    }
  }
};
