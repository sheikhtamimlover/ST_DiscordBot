const axios = require("axios");
const fs = require("fs");
const path = require("path");

const TASK_JSON = path.join(__dirname, "midj_tasks.json");
if (!fs.existsSync(TASK_JSON)) fs.writeFileSync(TASK_JSON, "{}");

const BASE_URL = async () => {
  const rakib = await axios.get("https://gitlab.com/Rakib-Adil-69/shizuoka-command-store/-/raw/main/apiUrls.json");
  return rakib.data.mj;
}

module.exports = {
  config: {
    name: "midjourney",
    aliases: ["midj", "mj"],
    author: "Rakib Adil enhance by ST",
    version: "1.0.00",
    role: 0,
    shortDescription: "AI image generation with MidJourney style",
    longDescription: "Generate and upscale MidJourney-style images using xnil's API.",
    category: "image",
    guide: "{pn} <prompt>"
  },

  ST: async function ({ args, message, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("⚠️ Please provide a prompt.");

    const loading = await message.pr("Generating image, please wait.. 🎨");
    await message.reaction("⏳", event.messageID);

    try {
      const res = await axios.get(`${await BASE_URL()}/imagine`, {
        params: { prompt: encodeURIComponent(prompt) }
      });

      const data = res.data;
      if (!data || !data.murl) {
        await loading.error("❌ Failed to generate image. Please try again later.");
        await message.reaction("❌", event.messageID);
        return;
      }

      const taskId = data.taskId || "unknown";
      const murl = data.murl;

      const tasks = JSON.parse(fs.readFileSync(TASK_JSON, "utf8"));
      tasks[event.threadID] = taskId;
      fs.writeFileSync(TASK_JSON, JSON.stringify(tasks, null, 2));

      await loading.success();
      await message.reaction("✅", event.messageID);

      const img = await global.utils.getStreamFromURL(murl);
      
      const u1Button = message.createButton('mj_u1', 'U1', 'Primary');
      const u2Button = message.createButton('mj_u2', 'U2', 'Primary');
      const u3Button = message.createButton('mj_u3', 'U3', 'Primary');
      const u4Button = message.createButton('mj_u4', 'U4', 'Primary');
      
      const sent = await message.sendWithButtons(
        {
          body: `🧠 Prompt: ${prompt}\n💬 Click buttons below to upscale (U1-U4)`,
          attachment: img
        },
        [u1Button, u2Button, u3Button, u4Button],
        null
      );

      global.Callback.set(sent.messageID, {
        commandName: 'midjourney',
        taskId,
        prompt,
        authorId: event.senderID,
        timestamp: Date.now()
      });

    } catch (err) {
      global.logger.error("MJ Generation error:", err);
      await loading.error("❌ Generation failed. Try again later.");
      await message.reaction("❌", event.messageID);
    }
  },

  onCallback: async function ({ interaction, message, callbackData, event }) {
    const customId = interaction.customId;
    
    if (!customId.startsWith('mj_')) return;
    
    const action = customId.replace('mj_', '');
    const validActions = ["u1", "u2", "u3", "u4"];
    
    if (!validActions.includes(action)) return;

    const cid = action.replace(/[uv]/, "");
    const mode = "upscale";

    await interaction.deferReply();

    try {
      const endpoint = "up";
      const url = `${await BASE_URL()}/${endpoint}?tid=${callbackData.taskId}&cid=${cid}`;

      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.url) {
        return interaction.editReply({ content: `❌ Upscale failed for ${action.toUpperCase()}.`, ephemeral: true });
      }

      const img = await global.utils.getStreamFromURL(data.url);
      
      const u1Button = message.createButton('mj_u1', 'U1', 'Primary');
      const u2Button = message.createButton('mj_u2', 'U2', 'Primary');
      const u3Button = message.createButton('mj_u3', 'U3', 'Primary');
      const u4Button = message.createButton('mj_u4', 'U4', 'Primary');

      await interaction.editReply({
        content: `✅ Upscaled ${action.toUpperCase()} done.\n💬 Click buttons below to upscale again..`,
        files: [{ attachment: img, name: 'upscaled.png' }]
      });

      const followUp = await interaction.followUp({
        content: `✅ Here's your upscaled image!`,
        files: [{ attachment: img, name: 'upscaled.png' }],
        components: [message.createButtonRow([u1Button, u2Button, u3Button, u4Button])]
      });

      global.Callback.set(followUp.id, {
        commandName: 'midjourney',
        taskId: data.tid || callbackData.taskId,
        prompt: callbackData.prompt,
        authorId: event.senderID,
        timestamp: Date.now()
      });

    } catch (err) {
      global.logger.error(`MJ ${mode} error:`, err);
      interaction.editReply({ content: `❌ Error while processing ${action.toUpperCase()}. Try again later.`, ephemeral: true });
    }
  }
};
