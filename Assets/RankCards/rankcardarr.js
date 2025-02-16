const Cluster1_Assets = require('./Cluster1/c1arr')
const Cluster2_Assets = require('./Cluster2/c2arr')

let rankattributes = [
    [
        0,
        'none',
        `./Assets/RankCards/RankCard_0.png`,
        '#ffffff',
        'https://cdn.discordapp.com/emojis/1097172753985056859.png?quality=lossless',
        '<:LYG_blank:1097172753985056859>',
        'osudroid!relax Member',
    ],
    ...Cluster1_Assets,
    ...Cluster2_Assets
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