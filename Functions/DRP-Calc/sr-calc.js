const { MapInfo, MapStats, ModUtil } = require('@rian8337/osu-base')
const { MapStars } = require('@rian8337/osu-difficulty-calculator')
const chalk = require('chalk')

async function GetSR(a, b, c, d, e, f, g, h) {
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetSR) String Input: ${a}`)
    let ErrKey = true, StopKey = false

    const ValidStr = ['https://', 'http://']
    for (var i in ValidStr) {
        if (a.startsWith(ValidStr[i])) {
            ErrKey = false
            a = a.split('/')
            a = a[a.length - 1]
            break
        }
    }

    if (!isNaN(Number(a)) && a > 74) ErrKey = false

    if(ErrKey) return StopKey = true

    const beatmapInfo = await MapInfo.getInformation(Number(a));

    if (!beatmapInfo.title) {
        return console.log("Beatmap not found");
    }

    const Mods = ModUtil.pcStringToMods(b)

    const Stats = new MapStats({
        ar: c,
        od: d,
        cs: e,
        hp: f,
        isForceAR: g,
        speedMultiplier: h,
    })

    const rating = new MapStars(beatmapInfo.beatmap, {
        mods: Mods,
        stats: Stats,
    })

    let DifficultyMultiplier = 1
    for (var i in rating.osu.attributes.mods) {
        DifficultyMultiplier *= rating.osu.attributes.mods[i].droidScoreMultiplier
    }

    const SR = rating.osu.attributes.starRating
    
    //console.log(`${chalk.greenBright('[DEBUG]')} Function: (GetSR) Final Result:`)
    //console.log([SR.toFixed(2), DifficultyMultiplier])
    return [SR.toFixed(2), DifficultyMultiplier]
}

module.exports = { GetSR }