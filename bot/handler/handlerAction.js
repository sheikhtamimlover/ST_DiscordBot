async function handleReactUnsend(reaction, user) {
  try {
    if (user.bot) return;

    if (!global.config.reactUnsend || !global.config.reactUnsend.enabled) return;

    const isAdmin = global.config.adminUIDs.includes(user.id);
    if (!isAdmin) return;

    const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
    if (message.author.id !== global.client.user.id) return;

    const emoji = reaction.emoji.name;
    const configEmoji = global.config.reactUnsend.emoji;

    if (emoji === configEmoji) {
      await message.delete();
      global.logger.info(`Admin ${user.tag} unsent bot message via reaction`);
    }
  } catch (error) {
    global.logger.error('Error in handleReactUnsend', error);
  }
}

module.exports = {
  handleReactUnsend
};
