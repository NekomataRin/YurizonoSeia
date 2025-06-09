const unhomoglyph = require('unhomoglyph');

module.exports = async (client, message) => {
  if (message.author.bot || message.guild.id !== process.env.GUILD_ID) return;
  if (["1201818078711918602", "1152527869533229126"].includes(message.channel.id)) return;

  let n = await message.fetch();
  let EditedContent = n.content, PreContent = message.content;
  if (EditedContent === PreContent) return;

  EditedContent = ultraCleanText(EditedContent);
  if (isNWords(EditedContent)) {
    await message.delete();
    await message.channel.send(
      `<:SeiaMuted:1250945238378221658> • ${message.author} That word is offensive, you know? You cannot say the **N-Word** HERE!`
    );
  }
};

function ultraCleanText(text) {
  return unhomoglyph(
    text
      .normalize('NFKC')
      .replace(/[\p{Diacritic}\u0300-\u036f]/gu, '')
      .replace(/[^\p{L}\p{N}]/gu, '')
      .replace(/\s+/g, '')
      .toLowerCase()
  );
}

function isNWords(text) {
  // 1. Base & leetspeak detection (with optional plural "s")
  const baseRegex = /\bn[1i!|l][gq69]{1,2}[a4@]?[r][s]?\b/gi;
  const extendedRegex = /\bn[1i!|l][gq69]{1,2}[a4@]?[r]?[s]?\b/gi;

  // 2. Unicode homoglyph variants (plurals supported)
  const unicodeRegex = /[n𝐧𝕟ńηŋոṅṇ𝗇Ⓝ][iíⁱ𝒊ᵢ𝗂ⓘ][gɡℊ𝓰ǵ𝗀ⓖ][gɡℊ𝓰ǵ𝗀ⓖ][aₐ𝒂åâá𝗮ⓐ]?[r𝗋ⓡ]?[s𝗌ⓢ]?/gi;

  // 3. Zero-width/hyphen/spaced variant detection
  const hiddenRegex = /n[\s\u200B\u200C\u200D\-_]*i[\s\u200B\u200C\u200D\-_]*g[\s\u200B\u200C\u200D\-_]*g?[\s\u200B\u200C\u200D\-_]*[a@4]?[\s\u200B\u200C\u200D\-_]*r?[\s\u200B\u200C\u200D\-_]*s?/gi;

  // 4. Partial censorship (symbols between letters)
  const censorshipRegex = /n[^\p{L}\p{N}]{0,3}i[^\p{L}\p{N}]{0,3}g[^\p{L}\p{N}]{0,3}g?[^\p{L}\p{N}]{0,3}a?[^\p{L}\p{N}]{0,3}r?[^\p{L}\p{N}]{0,3}s?/giu;

  // 5. Partial detection (trigger base prefix)
  const partialRegex = /\bn[1i!|l][gq69]/gi;

  return (
    baseRegex.test(text) ||
    extendedRegex.test(text) ||
    unicodeRegex.test(text) ||
    hiddenRegex.test(text) ||
    censorshipRegex.test(text) ||
    partialRegex.test(text)
  );
}

