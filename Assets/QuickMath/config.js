/*
/quick-math settings
The difficulty goes up during the game (level 4, 6, 8... until Asian), the numbers follow the current difficulty.

Profiles (numbers of each difficulty), ranges are [level 1, CapLevel] and grow slowly in between,
so a difficulty never goes past its own max:
- Add: biggest number that is added / subtracted
- Mul: biggest number that is multiplied / divided by
- Quotient: biggest answer of a "a / b" (keeps a small: a = answer × b)
- MaxFactors: most numbers multiplied / divided together (2 = only "a × b" / "a ÷ b")
- AddDecimals / MulDecimals: those numbers have 2 decimals (12.34)
- AddNegative / MulNegative: those numbers can be negative
- DivDecimals: decimals a division result can have (0 = always divides exactly into an integer)
- NiceDivisors: Asian also divides by 0.25, 0.5, 1.25...
*/
const QuickMathConfig = {
    Difficulties: ['easy', 'normal', 'hard', 'lunatic', 'extra', 'phantasm', 'asian'],
    Timer: [25, 20, 18, 16, 14, 12, 10],
    StackAdd: [5, 4.5, 4, 3.5, 3, 2.5, 2],
    MultiList: [0.5, 1, 2, 2.5, 3, 5, 10],
    Emojis: [
        '<:MomoiNi:1260866228671479849>',
        '<:mikaeat:1254109782592327783>',
        '<:seiaheh:1244128244664504392>',
        '<:SerikaPray:1242841678214205451>',
        '<:Shirokope:1240988164512809040>',
        '<:WakamoCoffee:1259326736240214097>',
        '<:HinaMoyai:1260865660347744326>'
    ],
    Colors: ['#038cfc', '#03fc66', '#e8fc03', '#fca503', '#c603fc', '#fc032c', '#1a1a1a'],

    // Level 1 sizes follow the old game (Easy ≤ 8, Normal ≤ 20, Hard ≤ 35, Lunatic ≤ 53...),
    // every answer must fit in the attempt timer (and 80% / 50% of it on the 2nd / 3rd attempt)
    Profiles: {
        // Only positive numbers, the result (and every step) is never negative. × ÷ = times tables
        easy: { Add: [10, 30], Mul: [9, 9], Quotient: [9, 9], MaxFactors: 2, AddDecimals: false, MulDecimals: false, AddNegative: false, MulNegative: false, DivDecimals: 0, Positive: true },
        // Integers only, negative numbers everywhere, divisions always exact
        normal: { Add: [20, 50], Mul: [9, 10], Quotient: [9, 10], MaxFactors: 2, AddDecimals: false, MulDecimals: false, AddNegative: true, MulNegative: true, DivDecimals: 0 },
        hard: { Add: [35, 100], Mul: [10, 12], Quotient: [10, 12], MaxFactors: 2, AddDecimals: false, MulDecimals: false, AddNegative: true, MulNegative: true, DivDecimals: 0 },
        lunatic: { Add: [50, 200], Mul: [12, 15], Quotient: [12, 15], MaxFactors: 3, AddDecimals: false, MulDecimals: false, AddNegative: true, MulNegative: true, DivDecimals: 0 },
        // + - with 2 decimal numbers, × ÷ with (negative) integers, divisions end within 2 decimals
        extra: { Add: [25, 75], Mul: [9, 12], Quotient: [9, 12], MaxFactors: 2, AddDecimals: true, MulDecimals: false, AddNegative: false, MulNegative: true, DivDecimals: 2 },
        phantasm: { Add: [50, 100], Mul: [12, 15], Quotient: [12, 15], MaxFactors: 2, AddDecimals: true, MulDecimals: false, AddNegative: false, MulNegative: true, DivDecimals: 2 },
        // No limits (decimals × decimals lol), but divisions still end within 2 decimals. × ÷ half the time from level 1
        asian: { Add: [100, 250], Mul: [10, 25], Quotient: [25, 50], MaxFactors: 3, AddDecimals: true, MulDecimals: true, AddNegative: true, MulNegative: true, DivDecimals: 2, NiceDivisors: true, MulChance: 0.5 }
    },

    // Every result (and every step of the calculation) stays inside -Limit -> Limit
    Limit: 99999.99,
    // After this level nothing gets harder anymore (numbers, amount of numbers, answer time)
    CapLevel: 10,
    // Most numbers in one equation
    MaxOperands: 6,
    // Chance that a number is multiplied / divided instead of added / subtracted
    MulChance: 0.5,
    MulChanceEarly: 0.2,
    MulChanceFromLevel: 3,
    // ( ) from this level
    ParenLevel: 4,
    ParenChance: 0.3,
    NegativeChance: 0.35,
    AsianDivisors: [0.25, 0.5, 0.75, 1.25, 1.5, 2.5, 7.5, 12.5]
}

module.exports = (QuickMathConfig)
