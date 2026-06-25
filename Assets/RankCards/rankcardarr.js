const Cluster1_Assets = require('./Cluster1 - Blue Archive/c1arr')
const Cluster2_Assets = require('./Cluster2 - Touhou/c2arr')
const Cluster3_Assets = require('./Cluster3 - Senren Banka/c3arr')
const Cluster4_Assets = require('./Cluster4 - GekiChuMai/c4arr')

let rankattributes = [
    [
        0,
        'none',
        `./Assets/RankCards/RankCard_0.png`,
        '#ffffff',
        'https://cdn.discordapp.com/emojis/1097172753985056859.png?quality=lossless',
        '<:LYG_blank:1097172753985056859>',
        'Ordinary Member',
    ],
    ...Cluster1_Assets,
    ...Cluster2_Assets,
    ...Cluster3_Assets,
    ...Cluster4_Assets
    
]
/*
[0] Rank_Key
[1] Background
[2] Color
[3] ImgLink
[4] Emoji
[5] Title
 */
function SortCol(a,b) {
    return a[0] - b[0]
}

rankattributes = rankattributes.sort(SortCol)
for (var i in rankattributes) {
    rankattributes[i].shift()
}
module.exports = (rankattributes)