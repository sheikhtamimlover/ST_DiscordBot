const axios = require("axios");

module.exports = {
  config: {
    name: "flux",
    version: "1.0.00",
    author: "Dipto",
    role: 0, // 0 = all users, 1 = admin only
    shortDescription: {
      en: "Generate AI images"
    },
    longDescription: {
      en: "Generate AI images from text prompts using Flux API by Dipto"
    },
    category: "image generator",
    guide: {
      en: "{pn} [prompt] --ratio 1024x1024\nExample: {pn} cat wearing sunglasses --ratio 1:1"
    },
    countDown: 15
  },

  ST: async function ({ args, message }) {
    const dipto = "https://www.noobs-api.rf.gd/dipto";

    if (!args[0]) {
      return message.reply("❌ Please provide a prompt.\nExample: flux cat in space --ratio 16:9");
    }

    const pr = await message.pr("🌀 Generating your image, please wait...", "✅");

    try {
      const input = args.join(" ");
      const [prompt, ratio = "1:1"] = input.includes("--ratio")
        ? input.split("--ratio").map(s => s.trim())
        : [input, "1:1"];

      const apiurl = `${dipto}/flux?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;
      const response = await axios.get(apiurl, { responseType: "stream" });

      await pr.success();

      return message.reply({
        body: `✅ Done!\n📝 Prompt: ${prompt}\n📐 Ratio: ${ratio}`,
        attachment: response.data
      });

    } catch (error) {
      await pr.error("❌ Failed to generate image.\nTry again later or check your prompt.");
      global.logger.error('Flux generation error', error);
    }
  }
};