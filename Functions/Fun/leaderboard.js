const { SeiaEmbed } = require('../../Utils/embed')

const PerPage = 10
const Medals = ['🥇', '🥈', '🥉']

/*
Leaderboard pages (10 players each) for /quick-math-top and /game-2048-top
- Entries: best first, each { UserID, Value (same Value = same rank: 1, 2, 2, 4...), Line }
- You(entry): line about the user's own rank, NoYou: line when they aren't on the board
*/
function LeaderboardPages(interaction, { Title, Color, Entries, Empty, You, NoYou }) {
    let rank = 0
    const Ranked = Entries.map((e, i) => {
        if (i === 0 || e.Value !== Entries[i - 1].Value) rank = i + 1
        return { ...e, Rank: rank }
    })

    const Me = Ranked.find(e => e.UserID === interaction.user.id)
    const MeLine = (Me) ? You(Me) : NoYou

    const Pages = []
    for (let i = 0; i < Math.max(Ranked.length, 1); i += PerPage) {
        const Lines = Ranked.slice(i, i + PerPage).map(e => `### • ${(Medals[e.Rank - 1]) ? `${Medals[e.Rank - 1]} ` : ''}#${e.Rank} <@${e.UserID}>\n${e.Line}`)
        const desc = `${(Lines.length) ? Lines.join('\n') : Empty}\n\n${MeLine}`
        Pages.push(SeiaEmbed(interaction, Color).setTitle(Title).setDescription(desc))
    }
    return Pages
}

// Only keeps the users that are in this server (cached members first, the rest fetched 100 at a time)
async function ServerMembers(guild, UserIDs) {
    const Missing = UserIDs.filter(id => !guild.members.cache.has(id))
    for (let i = 0; i < Missing.length; i += 100) {
        await guild.members.fetch({ user: Missing.slice(i, i + 100) }).catch(() => null)
    }
    return new Set(UserIDs.filter(id => guild.members.cache.has(id)))
}

module.exports = { LeaderboardPages, ServerMembers }
