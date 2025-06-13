const { ChannelType } = require('discord.js');

function rewriteXLinks(content) {
  return content.replace(
    /https?:\/\/(?:www\.)?x\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)(\?[^\s<>]*)?/g,
    'https://fxtwitter.com/$1/status/$2$3'
  );
}

const twitterLinkGlobalRegex = /https?:\/\/(?:www\.|mobile\.)?x\.com\/[a-zA-Z0-9_]+\/status\/\d+(?:\?[^\s<>]*)?/gi;

module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (
    message.channel.type === ChannelType.DM ||
    message.channel.type === ChannelType.GroupDM
  ) return;
  if (message.guild.id !== '1095653998389907468') return;

  const matches = message.content.match(twitterLinkGlobalRegex);

  // Only process if exactly one match
  if (matches?.length === 1) {
    try {
      await message.channel.send(`${rewriteXLinks(message.content)}\n\n> Requested by: \`${message.author.username}\``);
      await message.delete();
    } catch (err) {
      console.error('Failed to handle Twitter link:', err);
    }
  }
};
