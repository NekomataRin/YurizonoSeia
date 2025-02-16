const { request } = require('undici')
const chalk = require('chalk')

async function GetMap(str) {
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetMap) String Input: ${str}`)
    let ErrKey = true, StopKey = false

    const ValidStr = ['https://', 'http://']
    for (var i in ValidStr) {
        if (str.startsWith(ValidStr[i])) {
            ErrKey = false
            let arr = str.split('/')
            str = arr[arr.length - 1]
            break
        }
    }

    if (!isNaN(Number(str)) && str > 74) ErrKey = false
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetMap) ErrKey: ${ErrKey}`)

    let result, inforesult
    //ErrKey === false => Run The Thing, Else Return true For Execute The Error Embed
    if (!ErrKey) {
        const BeatmapStats = await request(`https://osu.direct/api/v2/b/${str}`)
        result = await BeatmapStats.body.json()

        let mapsetid = result.beatmapset_id

        const BeatmapInfo = await request(`https://osu.direct/api/v2/s/${mapsetid}`)
        inforesult = await BeatmapInfo.body.json()

        const BeatmapThumbnail = `https://osu.direct/api/media/background/${str}`

        let Last_Update = new Date(result.last_updated)
        Last_Update = Last_Update.toUTCString()

        let arr = [
            result.ar,
            result.accuracy,
            result.cs,
            result.drain,
            result.count_circles,
            result.count_sliders,
            result.count_spinners,
            result.max_combo,
            result.difficulty_rating
        ]
        let beatmapinfo = [
            inforesult.title_unicode,
            inforesult.artist_unicode,
            inforesult.creator,
            result.version,
            result.status,
            inforesult.favourite_count,
            Last_Update,
            result.url,
            BeatmapThumbnail,
            result.playcount,
            result.total_length,
            result.bpm.toFixed(1)
        ]
        let FinalResult = [arr, beatmapinfo]
        //console.log(`${chalk.green('[DEBUG]')} Function: (GetMap) Final Result Arr:`)
        //console.log(FinalResult)
        return FinalResult
    } else return StopKey = true
}

module.exports = { GetMap }