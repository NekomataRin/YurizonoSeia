const UserCards = require('../../Database/Ranking/usercards')
const { RankCards } = require('../../Assets/RankCards')

const Keys = new Set(RankCards.map(card => card.Key))

// Card keys a user unlocked on a server (each server has its own list; 'none' and removed cards not included)
async function UnlockedCards(GuildID, UserID) {
    const data = await UserCards.findOne({ GuildID, UserID }).select('-_id Cards').lean()
    return (data?.Cards || []).filter(key => key !== 'none' && Keys.has(key))
}

module.exports = { UnlockedCards }
