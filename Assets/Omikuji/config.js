const path = require('path')
const Img = (file) => path.join(__dirname, 'SpecialImg', file)

/*
/omikuji settings (shared by every language)
Texts: Texts/cases.js (en-US) + Texts/cases-vn.js (vi)
*/
const OmikujiConfig = {
    // A roll (0.000 - 100.000) goes into the first tier with roll < Range
    Range: [57.005, 84.005, 94.005, 98.005, 99.995, 100.001],
    Key: ['C-Tier', 'B-Tier', 'A-Tier', 'S-Tier', 'SS-Tier', 'EX-Tier'],
    Title: [
        "**Omikuji Card - C Tier**",
        "**Omikuji Card - B Tier**",
        "**Omikuji Card - A Tier**",
        "**Omikuji Card - S Tier**",
        "**Omikuji Card - SS Tier**",
        "**Omikuji Card - EX Tier**",
    ],
    Color: ['#808080', '#3cb371', '#4682b4', '#b939bf', '#ffd426', '#f0f8ff'],

    // Tiers with an image: one image per card, same order as the texts
    Image: {
        "SS-Tier": [Img('t5-0.png'), Img('t5-1.png'), Img('t5-2.png')],
        "EX-Tier": [Img('t6-0.png')]
    },

    // Tiers where /omikuji-stats also counts each card (same order as the texts)
    Cards: {
        "SS-Tier": ['Youko', 'Nakao', 'Rin']
    },

    // Daily reset time (UTC hour)
    ResetHourUTC: 22
}

module.exports = (OmikujiConfig)
