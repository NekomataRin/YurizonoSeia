const QM = require('../../Assets/QuickMath/config')

//---------- Exact decimal numbers: { n, s } = n / 10^s (BigInt, so no 0.1 + 0.2 mistakes) ----------
const P10 = (s) => 10n ** BigInt(s)
const Num = (n, s = 0) => ({ n: BigInt(n), s })
function Align(a, b) {
    const s = Math.max(a.s, b.s)
    return [a.n * P10(s - a.s), b.n * P10(s - b.s), s]
}
const Plus = (a, b) => { const [x, y, s] = Align(a, b); return Num(x + y, s) }
const Minus = (a, b) => { const [x, y, s] = Align(a, b); return Num(x - y, s) }
const Times = (a, b) => Num(a.n * b.n, a.s + b.s)
const Negate = (a) => Num(-a.n, a.s)
const IsNegative = (a) => a.n < 0n
const ToNumber = (a) => Number(a.n) / 10 ** a.s
const FromDecimal = (x) => Num(Math.round(x * 100), 2)

// 12.50 -> 12.5, 3.00 -> 3 (same value)
function Trim(a) {
    let { n, s } = a
    while (s > 0 && n % 10n === 0n) {
        n /= 10n
        s--
    }
    return { n, s }
}

// a / b, only when the result has at most `decimals` decimals (null otherwise)
function Divide(a, b, decimals) {
    if (b.n === 0n) return null
    const top = a.n * P10(b.s + decimals), bottom = b.n * P10(a.s)
    return (top % bottom === 0n) ? Trim(Num(top / bottom, decimals)) : null
}

const LimitCents = BigInt(Math.round(QM.Limit * 100))
const InLimit = (a) => (IsNegative(a) ? -a.n : a.n) * 100n <= LimitCents * P10(a.s)

// Rounded to 2 decimals (half away from zero), in cents
function ToCents(a) {
    if (a.s <= 2) return a.n * P10(2 - a.s)
    const f = P10(a.s - 2), q = a.n / f, r = a.n % f
    return ((r < 0n ? -r : r) * 2n >= f) ? q + (IsNegative(a) ? -1n : 1n) : q
}

// How a number is shown: 12 | 12.50 | (-7) | (-0.25) - decimal numbers always show 2 decimals
function Format(a) {
    const neg = IsNegative(a)
    const abs = neg ? Negate(a) : a
    let text = abs.n.toString()
    if (abs.s > 0) {
        const c = ToCents(abs).toString().padStart(3, '0')
        text = `${c.slice(0, -2)}.${c.slice(-2)}`
    }
    return neg ? `(-${text})` : text
}

// Answer shown to the player: 12 | -3.5 -> -3.50
function FormatAnswer(cents) {
    const neg = cents < 0n, abs = neg ? -cents : cents
    const frac = abs % 100n
    return `${neg ? '-' : ''}${abs / 100n}${frac ? '.' + frac.toString().padStart(2, '0') : ''}`
}

//---------- Random helpers ----------
const RandInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
const Chance = (p) => Math.random() < p
const Pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const lcm = (a, b) => a / gcd(a, b) * b

// Settings of a difficulty at a level: each range goes from its level 1 value to its max at CapLevel
function Profile(Difficulty, level) {
    const base = QM.Profiles[Difficulty] || QM.Profiles.easy
    const lvl = Math.min(Math.max(level, 1), QM.CapLevel)
    const t = (QM.CapLevel > 1) ? (lvl - 1) / (QM.CapLevel - 1) : 1
    const Range = ([start, max]) => Math.max(2, Math.round(start + (max - start) * t))
    return {
        ...base,
        Add: Range(base.Add),
        Mul: Range(base.Mul),
        Quotient: Range(base.Quotient),
        Level: lvl,
        //A difficulty can force its own × ÷ chance (Asian)
        MulChance: base.MulChance ?? ((lvl >= QM.MulChanceFromLevel) ? QM.MulChance : QM.MulChanceEarly)
    }
}

// How many numbers an equation has: 2 at level 1, +1 every 2 levels from level 3 (max MaxOperands)
function OperandCount(level) {
    let input = 2
    for (let i = 0; i <= Math.min(level, QM.CapLevel); i++) {
        if (i % 2 === 1 && i > 2 && i < 12) input++
        else if (i >= 12 && i % 3 === 0 && i < 21) input++
        else if (i >= 21 && i % 5 === 0) input++
    }
    return Math.min(input, QM.MaxOperands)
}

// A number that is added / subtracted ('add') or multiplied / divided ('mul'). Never × 1 or ÷ 1
function RandomNumber(P, kind, top) {
    const decimals = (kind === 'add') ? P.AddDecimals : P.MulDecimals
    const negative = (kind === 'add') ? P.AddNegative : P.MulNegative
    const max = top ?? ((kind === 'add') ? P.Add : P.Mul)
    let a = (decimals)
        ? Num(RandInt((kind === 'mul') ? 101 : 1, Math.max(max * 100, 101)), 2)
        : Num(RandInt((kind === 'mul') ? 2 : 1, Math.max(max, 2)), 0)
    if (negative && Chance(QM.NegativeChance)) a = Negate(a)
    return a
}

// Every divisor that turns `value` into a nice result (exact integer, or at most 2 decimals)
function Divisors(P, value) {
    if (value.n === 0n) return []
    const list = []
    for (let i = 2; i <= P.Mul; i++) list.push(Num(i, 0))
    if (P.NiceDivisors) NiceDivisors(P).forEach(b => list.push(b))
    //x / x = 1 is too easy, skip it
    return list.filter(b => {
        const r = Divide(value, b, P.DivDecimals)
        return r && InLimit(r) && !(r.s === 0 && (r.n === 1n || r.n === -1n))
    })
}

// Asian's 0.25, 0.5, 1.25... (only the ones inside the current Mul range)
function NiceDivisors(P) {
    return QM.AsianDivisors.filter(x => x <= P.Mul).map(FromDecimal)
}

// "a / b" where a is built from the answer, so the result is always nice
function NewDivision(P) {
    const nice = (P.NiceDivisors) ? NiceDivisors(P) : []
    let b = (nice.length && Chance(0.4)) ? Pick(nice) : Num(RandInt(2, P.Mul), 0)
    if (P.MulNegative && Chance(QM.NegativeChance)) b = Negate(b)

    // q (in cents) must be a multiple of `step` so that a = q * b follows the rules:
    // a is a whole number unless MulDecimals, q is a whole number when DivDecimals = 0
    const bCents = Number(ToCents(IsNegative(b) ? Negate(b) : b))
    const unitA = (P.MulDecimals) ? 1 : 100
    const unitQ = (P.DivDecimals === 0) ? 100 : 1
    const step = lcm((100 * unitA) / gcd(100 * unitA, bCents), unitQ)
    const maxQ = Math.min(P.Quotient * 100, Math.floor(QM.Limit * 100 / Math.abs(ToNumber(b))))
    if (maxQ < step) return null

    //q = 1 (a / a) is too easy
    const steps = Math.floor(maxQ / step)
    let k = RandInt(1, steps)
    if (step * k === 100 && steps > 1) k = (k % steps) + 1
    let q = Trim(Num(step * k, 2))
    if (P.MulNegative && Chance(QM.NegativeChance)) q = Negate(q)
    const a = Trim(Times(q, b))
    return InLimit(a) ? { a, b, value: q } : null
}

// k numbers multiplied / divided together (k = 1: one number that gets added / subtracted)
function BuildTerm(P, k, Trace) {
    if (k === 1) {
        const a = RandomNumber(P, 'add')
        return { text: Format(a), value: a }
    }

    let text, value, left = k
    if (k >= 3 && P.Level >= QM.ParenLevel && Chance(QM.ParenChance)) {
        // ( a + b ) * ...
        const x = RandomNumber(P, 'add'), y = RandomNumber(P, 'add')
        const op = (P.Positive && IsNegative(Minus(x, y))) ? '+' : Pick(['+', '-'])
        value = (op === '+') ? Plus(x, y) : Minus(x, y)
        text = `(${Format(x)} ${op} ${Format(y)})`
        left -= 2
    } else if (Chance(0.5)) {
        // a / b ...
        const div = NewDivision(P)
        if (!div) return null
        text = `${Format(div.a)} / ${Format(div.b)}`
        value = div.value
        Trace.push({ value, div: true })
        left -= 2
    } else {
        value = RandomNumber(P, 'mul')
        text = Format(value)
        left -= 1
    }

    //The rest: × or ÷ one by one (÷ only when it gives a nice result)
    while (left > 0) {
        const divisors = Chance(0.5) ? Divisors(P, value) : []
        if (divisors.length) {
            let b = Pick(divisors)
            if (P.MulNegative && Chance(QM.NegativeChance)) b = Negate(b)
            value = Divide(value, b, P.DivDecimals)
            text += ` / ${Format(b)}`
            Trace.push({ value, div: true })
        } else {
            const room = Math.floor(QM.Limit / Math.max(Math.abs(ToNumber(value)), 1))
            if (room < 2) return null
            const b = RandomNumber(P, 'mul', Math.min(P.Mul, room))
            value = Trim(Times(value, b))
            text += ` * ${Format(b)}`
        }
        if (!InLimit(value)) return null
        Trace.push({ value })
        left -= 1
    }
    return { text, value }
}

// Numbers are split into terms: each extra number joins the current term (× ÷) or starts a new one (+ -)
function TryBuild(P, count, Trace) {
    const sizes = [1]
    for (let i = 1; i < count; i++) {
        if (Chance(P.MulChance) && sizes[sizes.length - 1] < P.MaxFactors) sizes[sizes.length - 1]++
        else sizes.push(1)
    }

    let text = '', total = null
    for (const k of sizes) {
        const term = BuildTerm(P, k, Trace)
        if (!term || !InLimit(term.value) || (P.Positive && IsNegative(term.value))) return null
        Trace.push({ value: term.value })

        if (total === null) {
            total = term.value
            text = term.text
        } else {
            //Easy never goes below 0
            const op = (P.Positive && IsNegative(Minus(total, term.value))) ? '+' : Pick(['+', '-'])
            total = (op === '+') ? Plus(total, term.value) : Minus(total, term.value)
            text += ` ${op} ${term.text}`
        }
        if (!InLimit(total) || (P.Positive && IsNegative(total))) return null
        Trace.push({ value: total })
    }
    return { text, value: Trim(total) }
}

// A random equation for the current level + difficulty -> { Text, Answer, Cents }
function CreateEqt(level, Difficulty) {
    const P = Profile(Difficulty, level)
    const count = OperandCount(level)
    for (let attempt = 0; attempt < 300; attempt++) {
        const Trace = []
        const eq = TryBuild(P, count, Trace)
        if (eq) return { Text: eq.text, Value: eq.value, Cents: ToCents(eq.value), Answer: FormatAnswer(ToCents(eq.value)), Trace, Profile: P }
    }
    //Never really happens: a simple addition
    const a = Num(RandInt(1, P.Add)), b = Num(RandInt(1, P.Add))
    const value = Plus(a, b)
    return { Text: `${Format(a)} + ${Format(b)}`, Value: value, Cents: ToCents(value), Answer: FormatAnswer(ToCents(value)), Trace: [], Profile: P }
}

// Is the typed answer right? 2 decimals are enough (more are rounded), "3,75" works too
function IsCorrect(content, Eqt) {
    const m = String(content).trim().replace(',', '.').match(/^([+-]?)(\d*)(?:\.(\d+))?$/)
    if (!m || (!m[2] && !m[3])) return false
    const typed = Num(BigInt((m[2] || '0') + (m[3] || '')) * (m[1] === '-' ? -1n : 1n), m[3]?.length || 0)
    return ToCents(typed) === Eqt.Cents
}

// Answer time (s): grows every 2 levels from level 3 (until CapLevel), shrinks with each wrong attempt
function SetTime(Difficulty, att, lvl) {
    const idx = QM.Difficulties.indexOf(Difficulty)
    let Time = QM.Timer[idx]
    for (let i = 0; i <= Math.min(Number(lvl), QM.CapLevel); i++) {
        if (i % 2 === 1 && i > 2) Time += QM.StackAdd[idx]
    }
    switch (att) {
        case 1: return Time
        case 2: return Time * 0.8
        case 3: return Time * 0.5
        default: return Time * 0.0001
    }
}

// Score multiplier: the original difficulty, less for each wrong attempt
function AttemptsCalc(OriginalDiff, n) {
    const Multi = QM.MultiList[QM.Difficulties.indexOf(OriginalDiff)]
    switch (n) {
        case 1: return Multi
        case 2: return Multi * 1 / 3
        case 3: return Multi * 1 / 6
        default: return Multi * 0.0001
    }
}

module.exports = { CreateEqt, IsCorrect, SetTime, AttemptsCalc, OperandCount, Profile }
