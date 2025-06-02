const { MapInfo, ModUtil } = require('@rian8337/osu-base')
const { MapStars } = require('@rian8337/osu-difficulty-calculator')
const chalk = require('chalk')

async function GetSR(a, b) {
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetSR) String Input: ${a}`)
    let ErrKey = true, StopKey = false
    if (!isNaN(Number(a)) && a > 74) ErrKey = false

    if(ErrKey) return StopKey = true

    const beatmapInfo = await MapInfo.getInformation(Number(a));

    if (!beatmapInfo.title) {
        return console.log("Beatmap not found");
    }

    const Mods = ModUtil.pcStringToMods(b)


    const rating = new MapStars(beatmapInfo.beatmap, {
        mods: Mods
    })

    const SR = rating.osu.attributes.starRating
    
    return SR.toFixed(2)
}

module.exports = { GetSR }