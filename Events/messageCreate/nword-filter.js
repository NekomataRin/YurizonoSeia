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

function isNWords(text) {
  // Base patterns (now includes "niga", "nega", etc.)
  const basePatterns = [
    'n[1i!|l][gq69]{1,2}[a4@]?r?s?',  // Original base
    'n[1i!|l][gq69]?[a4@]s?',         // "niga", "n1ga"
    'n[e3][gq69][a4@]s?',             // "nega", "n3ga"
    'n[i1][b8][a4@]s?'                // "niba", "n1b@"
  ];

  // Combined regex components
  const regexComponents = [
    // 1. Base/leet detection
    new RegExp(`\\b(?:${basePatterns.join('|')})\\b`, 'gi'),
    
    // 2. Unicode homoglyphs
    /[n𝐧𝕟ńηŋոṅṇ𝗇Ⓝ][ií1ⁱ𝒊ᵢ𝗂ⓘ!|l][gɡℊ𝓰ǵ𝗀ⓖq69][gɡℊ𝓰ǵ𝗀ⓖq69]?[aₐ𝒂åâá𝗮ⓐ4@]?[r𝗋ⓡ]?[s𝗌ⓢ]?/gi,
    
    // 3. Zero-width/hyphen/spaced
    /n[\s\u200B-\u200D\-_]*[i1e3][\s\u200B-\u200D\-_]*[gqb8][\s\u200B-\u200D\-_]*[gqb8]?[\s\u200B-\u200D\-_]*[a4@]?[\s\u200B-\u200D\-_]*[rs]?/gi,
    
    // 4. Partial censorship (improved)
    /n[^\p{L}\p{N}]{0,2}[i1e3][^\p{L}\p{N}]{0,2}[gqb8][^\p{L}\p{N}]{0,2}[gqb8]?[^\p{L}\p{N}]{0,2}[a4@]?[^\p{L}\p{N}]{0,2}[rs]?/giu,
    
    // 5. Partial detection
    /\bn[i1e3][gqb8]/gi
  ];

  return regexComponents.some(regex => regex.test(text));
}