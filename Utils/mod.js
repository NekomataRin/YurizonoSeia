const Config = require('./config')

// Has one of the Mod roles of their server (Utils/config.js Roles[guildId].Mod, a list or one ID)
function IsMod(member) {
    const ModRoles = [Config.Roles[member?.guild?.id]?.Mod ?? []].flat()
    return ModRoles.some(id => member.roles.cache.has(id))
}

module.exports = { IsMod }
