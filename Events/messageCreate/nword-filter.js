
const { isNWords, ultraCleanText } = require('../../Functions/n-word')

module.exports = async (client, message) => {
  if (message.author.bot || message.guild.id !== process.env.GUILD_ID) return;
  if (["1201818078711918602", "1152527869533229126"].includes(message.channel.id)) return;


  if (isNWords(ultraCleanText(message.content))) {
    await message.delete();
    await message.channel.send(
      `<:SeiaMuted:1250945238378221658> • ${message.author} That word is offensive, you know? You cannot say **that word** HERE!`
    );
  }
};