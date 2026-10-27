const HowgayConfig = require('../../Assets/Howgay/config')
const SpecialCases = require('../../Assets/Howgay/special-cases')

/*
Results are kept as whole numbers of 0.0001% ("ticks"), so 12.2345% = 122345.
No floating point mess: every value from 0.0000% to 101.0000% has the same chance.
*/
const SCALE = 10000

// One roll: 0 -> 1,010,000 ticks (0.0000% -> 101.0000%)
function RollTicks() {
    return Math.floor(Math.random() * (HowgayConfig.MaxValue * SCALE + 1))
}

// Average of several rolls, rounded back to 4 decimals
function AverageTicks(list) {
    return Math.round(list.reduce((a, b) => a + b, 0) / list.length)
}

// 122345 -> '12.2345'
function FormatTicks(ticks) {
    return (ticks / SCALE).toFixed(4)
}

// Key of the special table: result rounded to 1 decimal, 727499 (72.7499%) -> '72.7'
function SpecialKey(ticks) {
    return (Math.round(ticks / 1000) / 10).toFixed(1)
}

// Mongo map keys can't contain '.', so '72.7' is saved as '72_7'
function SpecialDbKey(key) {
    return key.replace('.', '_')
}

// Everything /howgay needs to know about one result
function Evaluate(ticks) {
    const value = ticks / SCALE
    const { NormalCases, GayFactorRates, ChadFactorRates, FactorValues } = HowgayConfig

    let tier = NormalCases.findIndex(c => value < c.Max)
    if (tier === -1) tier = NormalCases.length - 1

    const gay = GayFactorRates.findIndex(rate => value < rate)
    const chad = ChadFactorRates.findIndex(rate => value >= rate)

    const key = SpecialKey(ticks)
    return {
        ticks,
        value,
        text: FormatTicks(ticks),
        tier,
        special: (SpecialCases[key]) ? key : null,
        GayFactor: FactorValues[(gay === -1) ? FactorValues.length - 1 : gay],
        ChadFactor: FactorValues[(chad === -1) ? 0 : chad]
    }
}

module.exports = { RollTicks, AverageTicks, FormatTicks, SpecialKey, SpecialDbKey, Evaluate }
