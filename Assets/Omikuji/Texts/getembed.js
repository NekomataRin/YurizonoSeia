const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const OmikujiAssets = require('./cases')
const OmikujiAssetsVN = require('./cases-vn')
const FooterEmbeds = require('../../../Utils/embed')
const chalk = require('chalk')

async function GetOmikujiCard(langkey) {
    let OmikujiObj = {}
    switch (langkey) {
        case 'vi': {
            OmikujiObj = OmikujiAssetsVN
            break
        }
        case 'en-US':
        default:
            {
                OmikujiObj = OmikujiAssets
                break
            }
    }
    //Generate the RNG
    let RNG = Math.random() * 100.001
    RNG = RNG.toFixed(3)

    //RNG = 99.994 //Debug - Only Remove When Testing
    let index = 0, key = 'C-Tier'
    for (var i in OmikujiObj.Range) {
        if (Number(RNG) < OmikujiObj.Range[i]) {
            index = i
            key = OmikujiObj.Key[i]
            break
        }
    }

    let runindex = Math.floor(Math.random() * OmikujiObj.Description[key].length)
    console.log(`${chalk.cyanBright('[DEBUG]')} - RNG: ${RNG} | index: ${index} | key: ${key}`)
    //Get Title, Description, Color
    const Title = OmikujiObj.Title[index]
    const Description = OmikujiObj.Description[key][runindex]
    const Color = OmikujiObj.Color[index]

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
        let n = OmikujiObj.Image[key][runindex].split('/')
        ImgLink = new AttachmentBuilder(OmikujiObj.Image[key][runindex])
        ImgCtx = `attachment://${n[n.length - 1]}`
        OmikujiEmbed.setImage(ImgCtx)
    }

    return [runindex, key, OmikujiEmbed, ImgLink]
}

module.exports = { GetOmikujiCard }