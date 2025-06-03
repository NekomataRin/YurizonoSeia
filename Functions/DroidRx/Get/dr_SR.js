const { MapInfo, ModUtil, OsuAPIRequestBuilder, ModCustomSpeed } = require('@rian8337/osu-base')
const { OsuDifficultyCalculator } = require('@rian8337/osu-difficulty-calculator')
const chalk = require('chalk')


async function GetSR(mapid, mods) {
    OsuAPIRequestBuilder.setAPIKey(process.env.OSU_API_KEY)
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetSR) String Input: ${a}`)
    let ErrKey = true, StopKey = false
    if (!isNaN(Number(mapid)) && mapid > 74) ErrKey = false

    if (ErrKey) return StopKey = true

    const beatmapInfo = await MapInfo.getInformation(Number(mapid));

    if (!beatmapInfo.title) {
        return console.log("Beatmap not found");
    }

    const Mods = ModUtil.pcStringToMods(mods)
    const substr = mods.split(' ')

    if (substr.length > 1) {
        Mods.set(new ModCustomSpeed(Number(substr[1].slice(1))))
    }

    const rating = new OsuDifficultyCalculator().calculate(beatmapInfo.beatmap, Mods).starRating.toFixed(2)

    return rating
}

module.exports = { GetSR }