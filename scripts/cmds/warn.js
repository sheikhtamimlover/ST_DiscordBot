module.exports = {
  config: {
    name: "warn",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 2,
    shortDescription: "Warn a user",
    longDescription: "Issue a warning to a user. After 3 warnings, the user will be automatically kicked from the server.",
    category: "admin",
    guide: "{p}warn @user <reason>\n{p}warn <userID> <reason>\n{p}warn list @user\n{p}warn clear @user"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID, guild, mentions } = event;

      if (!guild) {
        return message.reply('❌ This command can only be used in a server.');
      }

      if (!event.member.permissions.has('ModerateMembers')) {
        return message.reply('❌ You need moderation permissions to use this command.');
      }

      if (!args[0]) {
        return message.reply(
          '⚠️ **Warning System**\n\n' +
          'Usage:\n' +
          '• `warn @user <reason>` - Issue a warning\n' +
          '• `warn list @user` - View user warnings\n' +
          '• `warn clear @user` - Clear user warnings\n\n' +
          'Note: Users are automatically kicked after 3 warnings.'
        );
      }

      const action = args[0].toLowerCase();

      if (action === 'list') {
        let targetUser = null;

        if (mentions.users.size > 0) {
          targetUser = mentions.users.first();
        } else if (args[1]) {
          try {
            targetUser = await global.client.users.fetch(args[1]);
          } catch {
            return message.reply('❌ Invalid user ID or mention.');
          }
        } else {
          return message.reply('❌ Please mention a user or provide a user ID.');
        }

        const userData = await usersData.get(targetUser.id);
        const warnings = userData.warnings || 0;

        return message.reply(
          `📋 **Warning List**\n\n` +
          `👤 User: ${targetUser.tag}\n` +
          `⚠️ Total Warnings: ${warnings}/3\n` +
          `${warnings >= 3 ? '🔴 User should be kicked!\n' : warnings >= 2 ? '🟡 One more warning will result in kick\n' : '🟢 Status: Good'}`
        );
      }

      if (action === 'clear') {
        let targetUser = null;

        if (mentions.users.size > 0) {
          targetUser = mentions.users.first();
        } else if (args[1]) {
          try {
            targetUser = await global.client.users.fetch(args[1]);
          } catch {
            return message.reply('❌ Invalid user ID or mention.');
          }
        } else {
          return message.reply('❌ Please mention a user or provide a user ID.');
        }

        await usersData.set(targetUser.id, { warnings: 0 });

        return message.reply(
          `✅ **Warnings Cleared**\n\n` +
          `👤 User: ${targetUser.tag}\n` +
          `🧹 All warnings have been removed.`
        );
      }

      let targetUser = null;
      let reason = '';

      if (mentions.users.size > 0) {
        targetUser = mentions.users.first();
        reason = args.slice(1).join(' ');
      } else if (args[0]) {
        try {
          targetUser = await global.client.users.fetch(args[0]);
          reason = args.slice(1).join(' ');
        } catch {
          return message.reply('❌ Invalid user ID or mention. Please mention a user or provide a valid user ID.');
        }
      }

      if (!reason) {
        return message.reply('❌ Please provide a reason for the warning.\nUsage: `warn @user <reason>`');
      }

      const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

      if (!targetMember) {
        return message.reply('❌ User is not a member of this server.');
      }

      if (targetMember.id === guild.ownerId) {
        return message.reply('❌ Cannot warn the server owner.');
      }

      if (targetMember.id === global.client.user.id) {
        return message.reply('❌ I cannot warn myself.');
      }

      if (targetMember.id === senderID) {
        return message.reply('❌ You cannot warn yourself.');
      }

      const senderMember = await guild.members.fetch(senderID);
      if (targetMember.roles.highest.position >= senderMember.roles.highest.position) {
        return message.reply('❌ You cannot warn a user with an equal or higher role than yours.');
      }

      const newWarnings = await usersData.incrementWarnings(targetUser.id);

      try {
        await targetUser.send(
          `⚠️ **Warning Issued**\n\n` +
          `Server: **${guild.name}**\n` +
          `Reason: ${reason}\n` +
          `Warned by: ${event.author.tag}\n` +
          `Total Warnings: ${newWarnings}/3\n\n` +
          `${newWarnings >= 3 ? '🔴 You will be kicked from the server.' : newWarnings >= 2 ? '🟡 One more warning and you will be kicked!' : '🟢 Please follow the server rules.'}`
        ).catch(() => {});

      } catch (error) {
        global.logger.error('Error sending warning DM', error);
      }

      await message.reply(
        `⚠️ **Warning Issued**\n\n` +
        `👤 User: ${targetUser.tag}\n` +
        `📝 Reason: ${reason}\n` +
        `👮 By: ${event.author.tag}\n` +
        `📊 Total Warnings: ${newWarnings}/3`
      );

      if (newWarnings >= 3) {
        if (targetMember.kickable) {
          try {
            await targetMember.kick(`Automatic kick: 3 warnings reached. Last warning: ${reason}`);
            
            await message.reply(
              `🔨 **User Automatically Kicked**\n\n` +
              `👤 User: ${targetUser.tag}\n` +
              `⚠️ Reason: Reached 3 warnings\n` +
              `📝 Last warning: ${reason}`
            );

            await usersData.set(targetUser.id, { warnings: 0 });

            global.logger.info(`User auto-kicked after 3 warnings: ${targetUser.tag} (${targetUser.id})`);

          } catch (kickError) {
            global.logger.error('Error auto-kicking user', kickError);
            await message.reply('⚠️ User reached 3 warnings but could not be kicked automatically. Please kick manually.');
          }
        } else {
          await message.reply('⚠️ User reached 3 warnings but I cannot kick them. Please check my permissions.');
        }
      }

      global.logger.info(`Warning issued: ${targetUser.tag} (${targetUser.id}) by ${event.author.tag} - Reason: ${reason} - Total: ${newWarnings}`);

    } catch (error) {
      global.logger.error('Error in warn command', error);
      await message.reply('❌ An error occurred while executing the warn command.');
    }
  }
};
