const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const OmikujiAssets = require('./cases')
const FooterEmbeds = require('../../../Utils/embed')
const chalk = require('chalk')

async function GetOmikujiCard() {
    //Generate the RNG
    let RNG = Math.random() * 100.001
    RNG = RNG.toFixed(3)

    //RNG = 99.994 //Debug - Only Remove When Testing
    let index = 0, key = 'C-Tier'
    for (var i in OmikujiAssets.Range) {
        if (Number(RNG) < OmikujiAssets.Range[i]) {
            index = i
            key = OmikujiAssets.Key[i]
            break
        }
    }

    let runindex = Math.floor(Math.random() * OmikujiAssets.Description[key].length)
    console.log(`${chalk.cyanBright('[DEBUG]')} - RNG: ${RNG} | index: ${index} | key: ${key}`)
    //Get Title, Description, Color
    const Title = OmikujiAssets.Title[index]
    const Description = OmikujiAssets.Description[key][runindex]
    const Color = OmikujiAssets.Color[index]

    //Generate Embed
    let OmikujiEmbed = new EmbedBuilder()
        .setColor(Color)
        .setTitle(Title)
        .setDescription(Description)
        .setTimestamp(Date.now())
        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

    //Get Image (If This Is True)
    let ImgCtx, ImgLink
    if (['SS-Tier', 'EX-Tier'].includes(key)) {
        let n = OmikujiAssets.Image[key][runindex].split('/')
        ImgLink = new AttachmentBuilder(OmikujiAssets.Image[key][runindex])
        ImgCtx = `attachment://${n[n.length - 1]}`
        OmikujiEmbed.setImage(ImgCtx)
    }

    return [runindex, key, OmikujiEmbed, ImgLink]
}

module.exports = { GetOmikujiCard }