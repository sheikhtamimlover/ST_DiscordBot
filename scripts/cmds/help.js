
module.exports = {
  config: {
    name: "help",
    version: "1.0.00",
    author: "Sheikh Tamim",
    countDown: 2,
    role: 0,
    shortDescription: "Show list of available commands",
    longDescription: "Display all available commands with pagination and interactive buttons",
    category: "info",
    guide: "{p}help [command_name or page_number]"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      const { senderID } = event;
      const prefix = global.config.prefix || "!";
      const user = await usersData.get(senderID);

      if (args[0] && isNaN(args[0])) {
        const commandName = args[0].toLowerCase();
        const command = global.ST.commands.get(commandName);

        if (!command) {
          return message.reply(`❌ Command "${commandName}" not found.`);
        }

        const cfg = command.config;
        let helpText = `📚 **Command: ${cfg.name || 'Unknown'}**\n\n`;
        helpText += `**Version:** ${cfg.version || 'N/A'}\n`;
        helpText += `**Author:** ${cfg.author || 'Unknown'}\n`;
        helpText += `**Category:** ${cfg.category || 'general'}\n`;
        helpText += `**Role Required:** ${cfg.role === 0 ? 'Everyone' : cfg.role === 1 ? 'Group Admin' : 'Bot Admin'}\n`;
        helpText += `**Cooldown:** ${cfg.countDown || 0}s\n\n`;
        helpText += `**Description:** ${cfg.longDescription || cfg.shortDescription || 'No description available'}\n\n`;
        helpText += `**Usage:** ${cfg.guide ? cfg.guide.replace(/{p}/g, prefix).replace(/{pn}/g, cfg.name) : `${prefix}${cfg.name}`}`;

        return message.reply(helpText);
      }

      const commands = global.ST.commands;
      const categories = {};

      commands.forEach((cmd, name) => {
        if (!cmd.config) return;
        const category = cmd.config.category || 'general';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({
          name: cmd.config.name,
          desc: cmd.config.shortDescription || 'No description',
          role: cmd.config.role || 0
        });
      });

      const commandsPerPage = 10;
      const allCommands = [];
      
      for (const [category, cmds] of Object.entries(categories)) {
        cmds.forEach(cmd => {
          const roleTag = cmd.role === 2 ? '🔒' : cmd.role === 1 ? '👮' : '👤';
          allCommands.push({
            category,
            text: `${roleTag} \`${prefix}${cmd.name}\` - ${cmd.desc}`
          });
        });
      }

      const pages = [];
      for (let i = 0; i < allCommands.length; i += commandsPerPage) {
        const pageCommands = allCommands.slice(i, i + commandsPerPage);
        let pageText = '';
        let currentCategory = '';
        
        pageCommands.forEach(cmd => {
          if (cmd.category !== currentCategory) {
            pageText += `\n**${cmd.category.toUpperCase()}**\n`;
            currentCategory = cmd.category;
          }
          pageText += `${cmd.text}\n`;
        });
        
        pages.push(pageText);
      }

      let currentPage = 0;
      if (args[0] && !isNaN(args[0])) {
        currentPage = Math.max(0, Math.min(parseInt(args[0]) - 1, pages.length - 1));
      }

      const generateHelpMessage = (page) => {
        let helpMessage = `📖 **Available Commands**\n`;
        helpMessage += `Total: ${commands.size} commands | Page ${page + 1}/${pages.length}\n`;
        helpMessage += `Prefix: ${prefix}\n\n`;
        helpMessage += pages[page];
        helpMessage += `\n\n💡 Type \`${prefix}help <command>\` for detailed info.`;
        return helpMessage;
      };

      const previousBtn = message.createButton('help_prev', 'Previous', 'Secondary', '◀️');
      const nextBtn = message.createButton('help_next', 'Next', 'Secondary', '▶️');
      const closeBtn = message.createButton('help_close', 'Close', 'Danger', '❌');

      if (currentPage === 0) previousBtn.setDisabled(true);
      if (currentPage === pages.length - 1) nextBtn.setDisabled(true);

      const buttons = [previousBtn, nextBtn, closeBtn];

      await message.replyWithButtons(
        generateHelpMessage(currentPage),
        buttons,
        async (interaction) => {
          const action = interaction.customId.split('_')[1];

          if (action === 'close') {
            global.Callback.delete(interaction.message.id);
            await interaction.update({ components: [] });
            return;
          }

          if (action === 'prev' && currentPage > 0) {
            currentPage--;
          } else if (action === 'next' && currentPage < pages.length - 1) {
            currentPage++;
          }

          const newPrevBtn = message.createButton('help_prev', 'Previous', 'Secondary', '◀️');
          const newNextBtn = message.createButton('help_next', 'Next', 'Secondary', '▶️');
          const newCloseBtn = message.createButton('help_close', 'Close', 'Danger', '❌');

          if (currentPage === 0) newPrevBtn.setDisabled(true);
          if (currentPage === pages.length - 1) newNextBtn.setDisabled(true);

          const newButtons = [newPrevBtn, newNextBtn, newCloseBtn];
          const newRows = [];
          for (let i = 0; i < newButtons.length; i += 5) {
            const row = message.createButtonRow(newButtons.slice(i, i + 5));
            newRows.push(row);
          }

          await interaction.update({
            content: generateHelpMessage(currentPage),
            components: newRows
          });
        }
      );

    } catch (error) {
      global.logger.error('Error in help command', error);
      await message.reply('❌ An error occurred while displaying help.');
    }
  }
};
