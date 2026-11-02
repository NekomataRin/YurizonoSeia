// Durations typed by users: "45s", "10m", "1h30m", "2d", "1w" (s / m / h / d / w, can be combined)
const Units = { w: 604800000, d: 86400000, h: 3600000, m: 60000, s: 1000 }
const Names = {
    'vi': { w: 'tuần', d: 'ngày', h: 'giờ', m: 'phút', s: 'giây' },
    'en-US': { w: 'w', d: 'd', h: 'h', m: 'm', s: 's' }
}
// Words meaning "forever" (only where a command allows it)
const Forever = ['perm', 'permanent', 'forever', 'vinhvien', 'vĩnhviễn']

// Text -> milliseconds. "0" = 0, a "forever" word = Infinity, anything else invalid = null
function ParseDuration(text) {
    const str = String(text ?? '').toLowerCase().replace(/\s+/g, '')
    if (str === '0') return 0
    if (Forever.includes(str)) return Infinity
    if (!/^(\d+[wdhms])+$/.test(str)) return null
    let ms = 0
    for (const [, n, unit] of str.matchAll(/(\d+)([wdhms])/g)) ms += Number(n) * Units[unit]
    return (Number.isSafeInteger(ms)) ? ms : null
}

// Milliseconds -> "1 ngày 2 giờ" / "1d 2h"
function FormatDuration(ms, LangKey = 'en-US') {
    const vi = (LangKey === 'vi')
    const names = Names[LangKey] || Names['en-US']
    let rest = Math.round(ms / 1000) * 1000
    const parts = []
    for (const unit of Object.keys(Units)) {
        const n = Math.floor(rest / Units[unit])
        rest -= n * Units[unit]
        if (n) parts.push((vi) ? `${n} ${names[unit]}` : `${n}${names[unit]}`)
    }
    return parts.join(' ') || ((vi) ? '0 giây' : '0s')
}

module.exports = { ParseDuration, FormatDuration }
