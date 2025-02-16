const { request } = require('undici')
const chalk = require('chalk')

async function GetAccuracy(a, b, c, d, e) {
    //a = 4113664
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetAccuracy) String Input: ${a}`)
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
    //console.log(`${chalk.green(`[DEBUG]`)} Function: (GetAccuracy) ErrKey: ${ErrKey} | MapID: ${a}`)

    if(ErrKey) return StopKey = true

    let accuracy = Number(b)
    let c300 = 0
    let c100 = Number(c)
    let c50 = Number(d)
    let misses = Number(e)

    const { body } = await request(`https://osu.direct/api/v2/b/${a}`)
    let result = await body.json()
    const totalObjects = Number(result.count_circles) + Number(result.count_sliders) + Number(result.count_spinners)

    let ResultAcc = 0

    const accuracyCalc = (c300, c100, c50, misses) => {
        const totalHits = c300 + c100 + c50 + misses
        let accuracy = 0.0;
        if (totalHits > 0) {
            accuracy = (
                c50 * 50.0 + c100 * 100.0 + c300 * 300.0) /
                (totalHits * 300.0);
        }
        return accuracy;
    }

    if (accuracy) {
        misses = Math.min(totalObjects, misses)
        const max300 = totalObjects - misses

        let MaxPossibleAcc = accuracyCalc(max300, 0, 0, misses) * 100.0
        let accuracyPercent = Math.max(0.0,
            Math.min(MaxPossibleAcc, accuracy))

        c100 = Math.round(-3.0 * ((accuracyPercent * 0.01 - 1.0) *
            totalObjects + misses) * 0.5);

        if (c100 > totalObjects - misses) {
            // acc lower than all 100s, use 50s
            c100 = 0;
            c50 = Math.round(-6.0 * ((accuracyPercent * 0.01 - 1.0) *
                totalObjects + misses) * 0.2);
            c50 = Math.min(max300, c50)
        } else {
            c100 = Math.min(max300, c100)
        }

        c300 = totalObjects - c100 - c50 - misses
        ResultAcc = accuracyCalc(c300, c100, c50, misses)
    } else {
        if (c300 <= 0) {
            c300 = totalObjects - c100 - c50 - misses
        }
        ResultAcc = accuracyCalc(c300, c100, c50, misses)
    }
    //console.log(`${chalk.greenBright(`[DEBUG]`)} Function: (GetAccuracy) Final Arr:`)
    //console.log([ResultAcc, c300, c100, c50, misses])
    return [ResultAcc, c300, c100, c50, misses]
}

module.exports = { GetAccuracy }