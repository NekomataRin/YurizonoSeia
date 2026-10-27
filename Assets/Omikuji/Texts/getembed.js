const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const path = require('path')
const OmikujiConfig = require('../config')
const { Footer } = require('../../../Utils/embed')
const Log = require('../../../Utils/logger')

const Texts = {
    'en-US': require('./cases'),
    'vi': require('./cases-vn')
}

// Draws one omikuji card -> { Tier, Index, Embed, File (only SS/EX tiers) }
function GetOmikujiCard(LangKey) {
    const Description = (Texts[LangKey] || Texts['en-US']).Description

    //Generate the RNG (0.000 - 100.000)
    const RNG = Number((Math.random() * 100.001).toFixed(3))

    let index = OmikujiConfig.Range.findIndex(max => RNG < max)
    if (index === -1) index = 0
    const Tier = OmikujiConfig.Key[index]

    const Index = Math.floor(Math.random() * Description[Tier].length)
    Log.Debug(`Omikuji - RNG: ${RNG} | Tier: ${Tier} | Card: ${Index}`)

    const Embed = new EmbedBuilder()
        .setColor(OmikujiConfig.Color[index])
        .setTitle(OmikujiConfig.Title[index])
        .setDescription(Description[Tier][Index])
        .setTimestamp()
        .setFooter(Footer())

    //Get Image (SS / EX tiers)
    let File = null
    const ImagePath = OmikujiConfig.Image[Tier]?.[Index]
    if (ImagePath) {
        File = new AttachmentBuilder(ImagePath)
        Embed.setImage(`attachment://${path.basename(ImagePath)}`)
    }

    return { Tier, Index, Embed, File }
}

module.exports = { GetOmikujiCard }
