
module.exports = {
  config: {
    name: "eval",
    version: "1.0.0",
    author: "Sheikh Tamim",
    countDown: 0,
    role: 2,
    shortDescription: "Evaluate JavaScript code",
    longDescription: "Execute and test JavaScript code with async/await support",
    category: "admin",
    guide: "{p}eval <code>"
  },

  ST: async function ({ api, event, args, message, usersData, threadsData }) {
    try {
      if (!args[0]) {
        return message.reply('❌ Please provide code to evaluate.');
      }

      const code = args.join(" ");
      const axios = require('axios');
      
      try {
        let result = await eval(`(async () => { ${code} })()`);
        
        if (typeof result === 'object') {
          result = JSON.stringify(result, null, 2);
        }
        
        await message.reply(String(result));
      } catch (error) {
        await message.reply(`Error: ${error.message}`);
      }
    } catch (error) {
      global.logger.error('Error in eval command', error);
      await message.reply(`❌ Execution error: ${error.message}`);
    }
  }
};
