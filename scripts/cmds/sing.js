
const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: [],
    version: "2.4.72",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download YouTube songs",
    longDescription: "Search and download audio from YouTube",
    category: "music",
    guide: {
      en: "{pn} <song name>"
    }
  },

  ST: async function ({ message, args }) {
    const stbotApi = new global.utils.STBotApis();
    const query = args.join(" ");
    if (!query) return message.reply("🎵 Please enter a song name.");

    const processingMsg = await message.pr("⏳ Searching and downloading audio...");

    try {
      const searchResult = await yts(query);
      if (!searchResult.videos.length) {
        await processingMsg.error("❌ No videos found for your query.");
        return;
      }

      const video = searchResult.videos[0];
      const videoUrl = video.url;
      const payload = { url: videoUrl };

      const response = await axios.post(
        `${stbotApi.baseURL}/cyt/youtube`,
        payload,
        { 
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': stbotApi.xApiKey
          }
        }
      );

      if (response.data.success && response.data.medias) {
        const audioMedia = response.data.medias.find(m => m.type === 'audio');

        if (!audioMedia) {
          await processingMsg.error("❌ No audio format found.");
          return;
        }

        const audioUrl = `${stbotApi.baseURL}${audioMedia.downloadUrl || audioMedia.proxyUrl}`;
        const title = response.data.title;
        const filename = `audio_${Date.now()}.mp3`;

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const cachePath = path.join(cacheDir, filename);

        const audioResponse = await axios.get(audioUrl, {
          responseType: "arraybuffer"
        });

        fs.writeFileSync(cachePath, Buffer.from(audioResponse.data));

        await processingMsg.success();

        await message.reply({
          body: `🎶 Now Playing: ${title}`,
          attachment: fs.createReadStream(cachePath)
        });

        setTimeout(() => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, 5000);
      } else {
        await processingMsg.error("❌ Failed to download the audio.");
      }

    } catch (err) {
      global.logger.error('Sing command error', err);
      await processingMsg.error("⚠️ Error while processing your request: " + err.message);
    }
  }
};