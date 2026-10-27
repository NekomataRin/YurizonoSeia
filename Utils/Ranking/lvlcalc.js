// EXP needed to go from `level` to `level + 1`
function ReqExp(level) {
    return (level === 0) ? 500 : 500 + Math.floor(Math.pow(2 * level, 2) + 1.5 * level - Math.pow(level, 2))
}

// Turns a total EXP into { level, exp } (exp = progress inside that level)
function FromTotal(total) {
    let level = 0, exp = Math.max(0, Math.floor(total))
    while (exp >= ReqExp(level)) {
        exp -= ReqExp(level)
        level++
    }
    return { level, exp }
}

module.exports = { ReqExp, FromTotal }
