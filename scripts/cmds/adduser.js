
module.exports = {
  config: {
    name: "adduser",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 3,
    role: 1,
    shortDescription: "Add user to group",
    longDescription: "Add a user to the current group by user ID or username",
    category: "admin",
    guide: "{p}adduser <userID>\n{p}adduser @username"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { guild, author } = event;

      if (!guild) {
        return message.reply('❌ This command can only be used in a server.');
      }

      if (!event.member.permissions.has('ManageGuild')) {
        return message.reply('❌ You need Manage Server permission to use this command.');
      }

      if (!args[0]) {
        return message.reply('❌ Please provide a user ID or mention a user.\nUsage: `adduser <userID>` or `adduser @user`');
      }

      let targetUserId = args[0].replace(/[<@!>]/g, '');

      try {
        const invite = await event.channel.createInvite({
          maxAge: 86400,
          maxUses: 1,
          unique: true
        });

        const targetUser = await global.client.users.fetch(targetUserId);
        
        try {
          await targetUser.send(`You have been invited to join **${guild.name}**!\n${invite.url}`);
          await message.reply(`✅ Invitation sent to **${targetUser.username}**!\nInvite link: ${invite.url}`);
        } catch (dmError) {
          await message.reply(`⚠️ Could not DM user, but here's the invite link: ${invite.url}\nSend this to **${targetUser.username}** manually.`);
        }
      } catch (error) {
        global.logger.error('Error in adduser command', error);
        await message.reply('❌ Failed to add user. Make sure the user ID is valid.');
      }
    } catch (error) {
      global.logger.error('Error in adduser command', error);
      await message.reply('❌ An error occurred.');
    }
  }
};
