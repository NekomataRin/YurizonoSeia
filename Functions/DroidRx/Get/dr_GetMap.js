const { request } = require('undici')

async function getMap(id, pp, a) {
    const MapScores = await request(`https://v4rx.me/api/get_scores/?limit=${a}&id=${id}`)
    const ScoreData = await MapScores.body.json()
    let MapName = '', MaxCombo = 0
    const BeatMapReq = ScoreData.filter((a) => a.pp == pp)

    MapName = `${BeatMapReq[0].beatmap.artist} - ${BeatMapReq[0].beatmap.title} [${BeatMapReq[0].beatmap.version}]`
    MaxCombo = BeatMapReq[0].beatmap.max_combo

    return [MapName, MaxCombo]
}

module.exports = { getMap }