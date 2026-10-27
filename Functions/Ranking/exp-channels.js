// 'Server Lobby', '🏠 ┃ server-lobby', '𝐒𝐞𝐫𝐯𝐞𝐫 𝐋𝐨𝐛𝐛𝐲' -> 'serverlobby'
function Normalize(name) {
    return String(name).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '')
}

// true when the category is in the list (by ID or by name)
function CategoryMatches(category, list) {
    return list.some(entry => entry === category.id || Normalize(entry) === Normalize(category.name))
}

// true when chatting in this channel gives EXP (threads follow their parent channel)
function GivesExp(channel, GuildConfig) {
    const base = (channel.isThread?.()) ? channel.parent : channel
    if (!base) return false
    if (GuildConfig.NoExpChannels.includes(channel.id) || GuildConfig.NoExpChannels.includes(base.id)) return false
    if (!GuildConfig.ExpCategories) return true

    const category = base.parent
    return Boolean(category) && CategoryMatches(category, GuildConfig.ExpCategories)
}

module.exports = { GivesExp, CategoryMatches }
