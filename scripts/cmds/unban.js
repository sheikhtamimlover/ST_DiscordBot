module.exports = {
  config: {
    name: "unban",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Unban a user from server",
    longDescription: "Remove a ban from a user, allowing them to rejoin the Discord server.",
    category: "admin",
    guide: "{p}unban <userID> [reason]\n{p}unban <username#discriminator> [reason]"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, guild } = event;

      if (!guild) {
        return message.reply('❌ This command can only be used in a server.');
      }

      if (!event.member.permissions.has('BanMembers')) {
        return message.reply('❌ You need "Ban Members" permission to use this command.');
      }

      if (!guild.members.me.permissions.has('BanMembers')) {
        return message.reply('❌ I don\'t have permission to unban members.');
      }

      if (!args[0]) {
        return message.reply('❌ Please provide a user ID or username.\nUsage: `unban <userID> [reason]`');
      }

      let targetUser = null;
      let reason = args.slice(1).join(' ') || 'No reason provided';

      try {
        targetUser = await global.client.users.fetch(args[0]);
      } catch {
        const bans = await guild.bans.fetch();
        const bannedUser = bans.find(ban => 
          ban.user.tag.toLowerCase() === args[0].toLowerCase() ||
          ban.user.username.toLowerCase() === args[0].toLowerCase()
        );

        if (bannedUser) {
          targetUser = bannedUser.user;
        }
      }

      if (!targetUser) {
        return message.reply('❌ Could not find a banned user with that ID or username.');
      }

      const existingBan = await guild.bans.fetch(targetUser.id).catch(() => null);
      if (!existingBan) {
        return message.reply('❌ This user is not banned from the server.');
      }

      try {
        await guild.members.unban(targetUser, reason);

        await usersData.unban(targetUser.id);

        await message.reply(
          `✅ **User Unbanned**\n\n` +
          `👤 User: ${targetUser.tag}\n` +
          `🆔 ID: ${targetUser.id}\n` +
          `📝 Reason: ${reason}\n` +
          `👮 By: ${event.author.tag}\n\n` +
          `The user can now rejoin the server.`
        );

        global.logger.info(`User unbanned: ${targetUser.tag} (${targetUser.id}) by ${event.author.tag} - Reason: ${reason}`);

      } catch (error) {
        global.logger.error('Error unbanning user', error);
        await message.reply('❌ Failed to unban the user. Please check my permissions and try again.');
      }

    } catch (error) {
      global.logger.error('Error in unban command', error);
      await message.reply('❌ An error occurred while executing the unban command.');
    }
  }
};
