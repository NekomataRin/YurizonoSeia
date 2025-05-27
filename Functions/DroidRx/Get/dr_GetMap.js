async function getMap(pp, arr = []) {
    let MapName = '', MaxCombo = 0
    const BeatMapReq = arr.filter((a) => a.pp == pp)

    MapName = `${BeatMapReq[0].beatmap.artist} - ${BeatMapReq[0].beatmap.title} [${BeatMapReq[0].beatmap.version}]`
    MaxCombo = BeatMapReq[0].beatmap.max_combo

    return [MapName, MaxCombo]
}

module.exports = { getMap }