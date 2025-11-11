module.exports = {
  config: {
    name: "kick",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Kick a user from server",
    longDescription: "Kick a member from the Discord server. Requires admin permissions.",
    category: "admin",
    guide: "{p}kick @user [reason]\n{p}kick <userID> [reason]"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, guild, mentions } = event;

      if (!guild) {
        return message.reply('❌ This command can only be used in a server.');
      }

      if (!event.member.permissions.has('KickMembers')) {
        return message.reply('❌ You need "Kick Members" permission to use this command.');
      }

      if (!guild.members.me.permissions.has('KickMembers')) {
        return message.reply('❌ I don\'t have permission to kick members.');
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
        return message.reply('❌ Please mention a user or provide a user ID.\nUsage: `kick @user [reason]`');
      }

      const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

      if (!targetMember) {
        return message.reply('❌ User is not a member of this server.');
      }

      if (targetMember.id === guild.ownerId) {
        return message.reply('❌ Cannot kick the server owner.');
      }

      if (targetMember.id === global.client.user.id) {
        return message.reply('❌ I cannot kick myself.');
      }

      if (targetMember.id === senderID) {
        return message.reply('❌ You cannot kick yourself.');
      }

      if (!targetMember.kickable) {
        return message.reply('❌ I cannot kick this user. They may have a higher role than me.');
      }

      const senderMember = await guild.members.fetch(senderID);
      if (targetMember.roles.highest.position >= senderMember.roles.highest.position) {
        return message.reply('❌ You cannot kick a user with an equal or higher role than yours.');
      }

      try {
        await targetUser.send(
          `⚠️ You have been kicked from **${guild.name}**\n` +
          `Reason: ${reason}\n` +
          `Kicked by: ${event.author.tag}`
        ).catch(() => {});

        await targetMember.kick(reason);

        await usersData.set(targetUser.id, {
          kicked: true,
          kickedAt: Date.now(),
          kickedBy: senderID,
          kickReason: reason
        });

        await message.reply(
          `✅ **User Kicked**\n\n` +
          `👤 User: ${targetUser.tag}\n` +
          `🆔 ID: ${targetUser.id}\n` +
          `📝 Reason: ${reason}\n` +
          `👮 By: ${event.author.tag}`
        );

        global.logger.info(`User kicked: ${targetUser.tag} (${targetUser.id}) by ${event.author.tag} - Reason: ${reason}`);

      } catch (error) {
        global.logger.error('Error kicking user', error);
        await message.reply('❌ Failed to kick the user. Please check my permissions and try again.');
      }

    } catch (error) {
      global.logger.error('Error in kick command', error);
      await message.reply('❌ An error occurred while executing the kick command.');
    }
  }
};
