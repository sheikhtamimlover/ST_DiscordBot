
const axios = require('axios');
const { execSync } = require('child_process');

module.exports = {
  config: {
    name: "update",
    version: "1.0.00",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Update bot from GitHub",
    longDescription: "Check for updates and update the bot from GitHub repository",
    category: "admin",
    guide: "{p}update"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const checkMsg = await message.reply('🔍 Checking for updates...');

      const repoUrl = 'https://raw.githubusercontent.com/sheikhtamimlover/ST_DiscordBot/main';
      const { data: remotePackage } = await axios.get(`${repoUrl}/package.json`);
      const localPackage = require('../../../package.json');

      const remoteVersion = remotePackage.version;
      const localVersion = localPackage.version;

      if (remoteVersion === localVersion) {
        await message.unsend(checkMsg.messageID);
        return message.reply(
          `✅ **You are using the latest version of ST_DiscordBot**\n\n` +
          `📦 Current Version: v${localVersion}\n` +
          `🔗 Repository: https://github.com/sheikhtamimlover/ST_DiscordBot.git`
        );
      }

      await message.unsend(checkMsg.messageID);

      const updateInfo = `🆕 **Update Available!**\n\n` +
        `📦 Current Version: v${localVersion}\n` +
        `📦 Latest Version: v${remoteVersion}\n\n` +
        `Click the button below to start updating.`;

      const yesButton = message.createButton('update_confirm', 'Yes, Update Now', 'Success', '✅');
      const noButton = message.createButton('update_cancel', 'Cancel', 'Danger', '❌');

      const sentMsg = await message.sendWithButtons(updateInfo, [yesButton, noButton], async (interaction) => {
        if (interaction.customId === 'update_confirm') {
          await interaction.deferUpdate();
          await performUpdate(message, interaction, remoteVersion, localVersion);
        } else if (interaction.customId === 'update_cancel') {
          await interaction.update({ content: '❌ Update cancelled.', components: [] });
        }
      });

      global.Callback.set(sentMsg.messageID, {
        commandName: 'update',
        author: event.author.id,
        remoteVersion,
        localVersion
      });

    } catch (error) {
      global.logger.error('Error in update command', error);
      await message.reply('❌ Failed to check for updates: ' + error.message);
    }
  },

  onCallback: async function ({ interaction, message, event, callbackData }) {
    if (interaction.customId === 'update_confirm') {
      await interaction.deferUpdate();
      await performUpdate(message, interaction, callbackData.remoteVersion, callbackData.localVersion);
    } else if (interaction.customId === 'update_cancel') {
      await interaction.update({ content: '❌ Update cancelled.', components: [] });
    }
  }
};

async function performUpdate(message, interaction, remoteVersion, localVersion) {
  try {
    await interaction.editReply({ 
      content: '⏳ Starting update process...\n\nThis may take a few minutes. Please wait...', 
      components: [] 
    });

    const fs = require('fs');
    const path = require('path');

    execSync('node update.js', { stdio: 'inherit' });

    const cacheDir = path.join(__dirname, '../../../cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const restartData = {
      channelId: interaction.channel.id,
      messageId: interaction.message.id,
      timestamp: Date.now(),
      updateInfo: {
        from: localVersion,
        to: remoteVersion
      }
    };

    fs.writeFileSync(
      path.join(cacheDir, 'restart.txt'),
      JSON.stringify(restartData, null, 2)
    );

    await interaction.editReply({ 
      content: `✅ **Update Successful!**\n\n📦 Updated from v${localVersion} to v${remoteVersion}\n\n🔄 Bot is restarting...`, 
      components: [] 
    });

    setTimeout(() => {
      process.exit(0);
    }, 2000);

  } catch (error) {
    await interaction.editReply({ 
      content: `❌ Update failed: ${error.message}\n\nPlease check the logs for more details.`, 
      components: [] 
    });
  }
}
