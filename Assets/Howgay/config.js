const path = require('path')
const Img = (...p) => path.join(__dirname, 'CaseImg', ...p)

/*
/howgay settings (shared by every language)
Comments of each range: Texts/allcases.js (en-US) + Texts/allcases-vn.js (vi)
Easter eggs: special-cases.js | Users that can't be checked: rejected.js
*/
const HowgayConfig = {
    // Result = 0.0000% -> MaxValue% (4 decimals)
    MaxValue: 101,

    // Normal ranges: a result goes into the first range with result < Max
    NormalCases: [
        { Max: 1.1, Color: '#1f1e33', Emoji: '<a:LYG_GigaChad:1086172112080867359>' },  //Case 0: 0 - 1
        { Max: 17.6, Color: '#003870', Emoji: '<:LYG_OkayuBOOM:1138231827140706304>' }, //Case 1: 1.1 - 17.5
        { Max: 34.1, Color: '#089afc', Emoji: '<:seiaheh:1244128244664504392>' },       //Case 2: 17.6 - 34.0
        { Max: 50.6, Color: '#00ff48', Emoji: '<:ShirokoSip:1206633868271030332>' },    //Case 3: 34.1 - 50.5
        { Max: 67.1, Color: '#eff53d', Emoji: '<:moyai_hmm:1316936320639303741>' },     //Case 4: 50.6 - 67.0
        { Max: 83.6, Color: '#ff3705', Emoji: '<:OrinBruh:1160295126996881448>' },      //Case 5: 67.1 - 83.5
        { Max: 100, Color: '#8605ff', Emoji: '<:SeiaDespair:1250768714639474791>' },    //Case 6: 83.6 - 99.9
        { Max: 101.1, Color: '#ff82fd', Emoji: '<:imgay:1356678016348197047>' },        //Case 7: 100 - 101
    ],

    // Gay Factor: first rate with result < rate | Giga Chad Factor: first rate with result >= rate
    GayFactorRates: [50.0, 60.0, 70.0, 75.0, 80.0, 90.0, 94.0, 97.0, 98.0, 99.0, 99.5, 100.0, 100.5, 101.1],
    ChadFactorRates: [51.0, 41.0, 31.0, 26.0, 21.0, 11.0, 7.0, 4.0, 3.0, 2.0, 1.5, 1.0, 0.5, 0.0],
    FactorValues: ['D', 'C', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+'],

    Colors: {
        SpecialCases: '#727b8f',
        Rejected: '#0c0f1f'
    },

    // Result <= ChadMax: Giga Chad image (+ role in the main server)
    // Result >= GayMin: Gay image (+ role in the main server)
    ChadMax: 1,
    GayMin: 100,

    Images: {
        Default: Img('default.gif'),
        Bot: Img('Rejected', 'reject-0.gif'),
        Rejected: (file) => Img('Rejected', file),
        Special: (file) => Img('Special', 'NumberCases', file),
        GigaChad: ['chad-0.gif', 'chad-1.gif', 'chad-2.gif', 'chad-3.gif'].map(f => Img('Special', 'ChadCases', f)),
        Gay: ['gay-0.gif', 'gay-1.gif', 'gay-2.gif', 'gay-3.gif'].map(f => Img('Special', 'GayCases', f))
    },

    // How many rolls /howgay avg:True makes
    AvgRolls: 3,
    // How many recent results are kept per user for the max/min stats
    KeepRecent: 100
}

module.exports = (HowgayConfig)
