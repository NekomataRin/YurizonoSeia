const fs = require('fs')
const path = require('path')
const Log = require('../../Utils/logger')

/*
Rank cards, grouped in collections (one folder each: cards.js + <Key>.png images)
- New card: put <key>.png in the collection folder + add a line in its cards.js
- New collection: new folder with cards.js + its name in the list below
Order in /background-list = this list, then the order inside each cards.js
*/
const Collections = ['Blue Archive', 'Touhou', 'Senren Banka', 'GekiChuMai']

// Default card (key 'none', image: none.png next to this file)
const DefaultCard = { Key: 'none', Color: '#ffffff', Emoji: '<:LYG_blank:1097172753985056859>', Title: 'Ordinary Member' }

// -> { Key, Collection, Background (image path), Color, ImgLink (icon), Emoji, Title }
function MakeCard(card, Collection) {
    const EmojiId = card.Emoji.match(/:(\d+)>$/)?.[1]
    return {
        Key: card.Key,
        Collection,
        Background: path.join(__dirname, Collection || '', `${card.Key}.png`),
        Color: card.Color,
        ImgLink: card.Icon || `https://cdn.discordapp.com/emojis/${EmojiId}.png?size=512&quality=lossless`,
        Emoji: card.Emoji,
        Title: card.Title
    }
}

const RankCards = [
    MakeCard(DefaultCard, null),
    ...Collections.flatMap(Collection => require(`./${Collection}/cards`).map(card => MakeCard(card, Collection)))
]

// Mistakes are only warned about, the bot still starts
const Seen = new Set()
for (const card of RankCards) {
    if (Seen.has(card.Key)) Log.Warn(`Rank card "${card.Key}" exists twice, only the first one is used`)
    Seen.add(card.Key)
    if (!fs.existsSync(card.Background)) Log.Warn(`Rank card "${card.Key}": image not found (${card.Collection || 'RankCards'}/${card.Key}.png)`)
}

// Card of a background key ('none' card when the key doesn't exist)
function FindCard(Key) {
    return RankCards.find(card => card.Key === Key) || RankCards[0]
}

module.exports = { RankCards, FindCard, Collections }
