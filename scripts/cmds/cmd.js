
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "cmd",
    version: "1.0.00",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Manage commands and events",
    longDescription: "Load, unload, reload, and install commands/events without restarting the bot",
    category: "admin",
    guide: "{p}cmd load <filename>\n{p}cmd unload <commandName>\n{p}cmd reload <commandName>\n{p}cmd loadall\n{p}cmd list\n{p}cmd install <filename> <code|url>\n{p}cmd event load <filename>\n{p}cmd event unload <eventName>\n{p}cmd event loadall\n{p}cmd event install <filename> <code|url>"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID } = event;
      const dataLoader = require('../../bot/loadData');

      if (args[0] === 'event') {
        const action = args[1];
        const fileName = args[2];

        if (!action) {
          return message.reply('❌ Usage: !cmd event <load|unload|loadall|install> [filename] [code|url]');
        }

        if (action === 'loadall') {
          const result = await dataLoader.loadEvents();
          return message.reply(
            `✅ **Event Reload Complete**\n\n` +
            `✓ Loaded: ${result.loaded.length} events\n` +
            `✗ Failed: ${result.failed.length} events\n\n` +
            (result.failed.length > 0 ? `Failed events:\n${result.failed.map(f => `• ${f.file}: ${f.error}`).join('\n')}` : '')
          );
        }

        if (!fileName) {
          return message.reply(`❌ Please specify a filename for event ${action}`);
        }

        if (action === 'load') {
          const result = await dataLoader.loadEvent(fileName);
          if (result.success) {
            return message.reply(`✅ Event **${result.name}** loaded successfully!`);
          } else {
            return message.reply(`❌ Failed to load event: ${result.error}`);
          }
        }

        if (action === 'unload') {
          const result = await dataLoader.unloadEvent(fileName);
          if (result.success) {
            return message.reply(`✅ Event **${fileName}** unloaded successfully!`);
          } else {
            return message.reply(`❌ Failed to unload event: ${result.error}`);
          }
        }

        if (action === 'install') {
          const codeOrUrl = args.slice(3).join(' ');
          if (!codeOrUrl) {
            return message.reply('❌ Please provide code or URL for the event');
          }

          let code = codeOrUrl;
          if (codeOrUrl.startsWith('http://') || codeOrUrl.startsWith('https://')) {
            try {
              const response = await axios.get(codeOrUrl);
              code = response.data;
            } catch (error) {
              return message.reply(`❌ Failed to fetch from URL: ${error.message}`);
            }
          }

          const result = await dataLoader.installEvent(fileName, code);
          if (result.success) {
            return message.reply(`✅ Event **${result.name}** installed and loaded successfully!`);
          } else {
            return message.reply(`❌ Failed to install event: ${result.error}`);
          }
        }

        return message.reply(`❌ Unknown event action. Use: load, unload, loadall, install`);
      }

      if (!args[0]) {
        return message.reply(
          `⚙️ **Command & Event Manager**\n\n` +
          `**Command Actions:**\n` +
          `• \`load <filename>\` - Load a command file\n` +
          `• \`unload <name>\` - Unload a command\n` +
          `• \`reload <name>\` - Reload a command\n` +
          `• \`loadall\` - Load all commands\n` +
          `• \`list\` - List all loaded commands\n` +
          `• \`install <filename> <code|url>\` - Install new command\n\n` +
          `**Event Actions:**\n` +
          `• \`event load <filename>\` - Load an event file\n` +
          `• \`event unload <name>\` - Unload an event\n` +
          `• \`event loadall\` - Load all events\n` +
          `• \`event install <filename> <code|url>\` - Install new event`
        );
      }

      const action = args[0].toLowerCase();

      // Event management
      if (action === 'event') {
        if (!args[1]) {
          return message.reply('❌ Please specify an event action');
        }

        const eventAction = args[1].toLowerCase();

        if (eventAction === 'load') {
          if (!args[2]) {
            return message.reply('❌ Please provide a filename. Example: `cmd event load welcome.js`');
          }

          const filename = args[2].endsWith('.js') ? args[2] : `${args[2]}.js`;
          const loadingMsg = await message.reply(`⏳ Loading event: ${filename}...`);

          const result = await dataLoader.loadEvent(filename);

          await message.unsend(loadingMsg.messageID);

          if (result.success) {
            return message.reply(`✅ Successfully loaded event: **${result.name}**`);
          } else {
            return message.reply(`❌ Failed to load event: ${result.error}`);
          }
        }

        if (eventAction === 'unload') {
          if (!args[2]) {
            return message.reply('❌ Please provide an event name');
          }

          const eventName = args[2];
          const loadingMsg = await message.reply(`⏳ Unloading event: ${eventName}...`);

          const result = await dataLoader.unloadEvent(eventName);

          await message.unsend(loadingMsg.messageID);

          if (result.success) {
            return message.reply(`✅ Successfully unloaded event: **${eventName}**`);
          } else {
            return message.reply(`❌ Failed to unload event: ${result.error}`);
          }
        }

        if (eventAction === 'loadall') {
          const loadingMsg = await message.reply(`⏳ Loading all events...`);

          const result = await dataLoader.loadEvents();

          await message.unsend(loadingMsg.messageID);

          return message.reply(
            `✅ Event loading complete!\n\n` +
            `Loaded: ${result.loaded.length}\n` +
            `Failed: ${result.failed.length}\n\n` +
            (result.failed.length > 0 ? `Failed events:\n${result.failed.map(f => `• ${f.file}: ${f.error}`).join('\n')}` : '')
          );
        }

        if (eventAction === 'install') {
          if (args.length < 4) {
            return message.reply(
              '❌ Invalid syntax. Usage:\n' +
              '`cmd event install <filename> <code|url>`'
            );
          }

          const filename = args[2].endsWith('.js') ? args[2] : `${args[2]}.js`;
          const codeOrUrl = args.slice(3).join(' ');

          const loadingMsg = await message.reply(`⏳ Installing event: ${filename}...`);

          let code = codeOrUrl;

          if (codeOrUrl.startsWith('http://') || codeOrUrl.startsWith('https://')) {
            try {
              const response = await axios.get(codeOrUrl);
              code = response.data;
            } catch (err) {
              await message.unsend(loadingMsg.messageID);
              return message.reply(`❌ Failed to fetch from URL: ${err.message}`);
            }
          }

          const result = await dataLoader.installEvent(filename, code);

          await message.unsend(loadingMsg.messageID);

          if (result.success) {
            return message.reply(`✅ Successfully installed and loaded event: **${result.name}**`);
          } else {
            return message.reply(`❌ Failed to install event: ${result.error}`);
          }
        }

        return message.reply('❌ Invalid event action');
      }

      // Command management
      if (action === 'load') {
        if (!args[1]) {
          return message.reply('❌ Please provide a filename. Example: `cmd load example.js`');
        }

        const filename = args[1].endsWith('.js') ? args[1] : `${args[1]}.js`;
        const loadingMsg = await message.reply(`⏳ Loading command: ${filename}...`);

        const result = await dataLoader.loadCommand(filename);

        await message.unsend(loadingMsg.messageID);

        if (result.success) {
          return message.reply(`✅ Successfully loaded command: **${result.name}**`);
        } else {
          return message.reply(`❌ Failed to load command: ${result.error}`);
        }
      }

      if (action === 'unload') {
        if (!args[1]) {
          return message.reply('❌ Please provide a command name. Example: `cmd unload help`');
        }

        const commandName = args[1];
        const loadingMsg = await message.reply(`⏳ Unloading command: ${commandName}...`);

        const result = await dataLoader.unloadCommand(commandName);

        await message.unsend(loadingMsg.messageID);

        if (result.success) {
          return message.reply(`✅ Successfully unloaded command: **${commandName}**`);
        } else {
          return message.reply(`❌ Failed to unload command: ${result.error}`);
        }
      }

      if (action === 'reload') {
        if (!args[1]) {
          return message.reply('❌ Please provide a command name. Example: `cmd reload help`');
        }

        const commandName = args[1];
        const loadingMsg = await message.reply(`⏳ Reloading command: ${commandName}...`);

        const unloadResult = await dataLoader.unloadCommand(commandName);
        if (!unloadResult.success) {
          await message.unsend(loadingMsg.messageID);
          return message.reply(`❌ Failed to unload command: ${unloadResult.error}`);
        }

        const commandsPath = path.join(__dirname);
        const files = await fs.readdir(commandsPath);
        const cmdFile = files.find(f => {
          try {
            const cmd = require(path.join(commandsPath, f));
            return cmd.config && cmd.config.name === commandName;
          } catch {
            return false;
          }
        });

        if (!cmdFile) {
          await message.unsend(loadingMsg.messageID);
          return message.reply(`❌ Command file not found for: ${commandName}`);
        }

        const loadResult = await dataLoader.loadCommand(cmdFile);

        await message.unsend(loadingMsg.messageID);

        if (loadResult.success) {
          return message.reply(`✅ Successfully reloaded command: **${commandName}**`);
        } else {
          return message.reply(`❌ Failed to reload command: ${loadResult.error}`);
        }
      }

      if (action === 'loadall') {
        const loadingMsg = await message.reply(`⏳ Loading all commands...`);

        const result = await dataLoader.loadCommands();

        await message.unsend(loadingMsg.messageID);

        return message.reply(
          `✅ Command loading complete!\n\n` +
          `Loaded: ${result.loaded.length}\n` +
          `Failed: ${result.failed.length}\n\n` +
          (result.failed.length > 0 ? `Failed commands:\n${result.failed.map(f => `• ${f.file}: ${f.error}`).join('\n')}` : '')
        );
      }

      if (action === 'list') {
        const commands = global.ST.commands;
        let listText = `📋 **Loaded Commands (${commands.size})**\n\n`;

        commands.forEach((cmd, name) => {
          const ver = cmd.config.version || '1.0.0';
          const cat = cmd.config.category || 'general';
          listText += `• **${name}** (v${ver}) - ${cat}\n`;
        });

        return message.reply(listText);
      }

      if (action === 'install') {
        if (args.length < 3) {
          return message.reply(
            '❌ Invalid syntax. Usage:\n' +
            '`cmd install <filename> <code|url>`'
          );
        }

        const filename = args[1].endsWith('.js') ? args[1] : `${args[1]}.js`;
        const codeOrUrl = args.slice(2).join(' ');

        const loadingMsg = await message.reply(`⏳ Installing command: ${filename}...`);

        let code = codeOrUrl;

        if (codeOrUrl.startsWith('http://') || codeOrUrl.startsWith('https://')) {
          try {
            const response = await axios.get(codeOrUrl);
            code = response.data;
          } catch (err) {
            await message.unsend(loadingMsg.messageID);
            return message.reply(`❌ Failed to fetch from URL: ${err.message}`);
          }
        }

        const result = await dataLoader.installCommand(filename, code);

        await message.unsend(loadingMsg.messageID);

        if (result.success) {
          return message.reply(`✅ Successfully installed and loaded command: **${result.name}**`);
        } else {
          return message.reply(`❌ Failed to install command: ${result.error}`);
        }
      }

      return message.reply('❌ Invalid action. Use `cmd` without arguments to see available actions.');

    } catch (error) {
      global.logger.error('Error in cmd command', error);
      await message.reply('❌ An error occurred while managing commands.');
    }
  }
};
