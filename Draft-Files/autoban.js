const BlackListedUsers = require('../Utils/blacklistusers')
const { ChannelType } = require('discord.js')
const BotOwner = require('../Utils/owners')

module.exports = async(client, message) => {
    if (message.author.bot) return
    if (message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM) return
    if (message.guild.id !== '1095653998389907468') return
    if (BotOwner.includes(message.author.id)) return

    console.log(BlackListedUsers.indexOf(message.author.id) !== -1, message.author.id)
    if(BlackListedUsers.indexOf(message.author.id) !== -1) {
        await message.author.ban()
    }
}