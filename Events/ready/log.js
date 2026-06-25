const chalk = require('chalk')
const cron = require('node-cron')
const { EmbedBuilder } = require('discord.js')

const FooterEmbeds = require('../../Utils/embed')

module.exports = async (client) => {
    console.log(`${chalk.cyanBright('[LOG]')} ${chalk.yellowBright(client.user.tag)} Is Online!`)


    cron.schedule('* 9,21 * * *', async () => {
        try {
            let rng = Math.floor(Math.random() * 101)
            rng = 9  //testing purposes
            const botOwnerId = '751225225047179324'
            const guild = await client.guilds.fetch('1519490185430171648')
            const channel = await client.channels.fetch('1519490186071904310')

            const botOwner = await guild.members.fetch(botOwnerId)
            const roles = botOwner.roles.cache.map(r => [r.id, r.name])
            await console.log(`Dad! Here's your role map ${roles}`)

            const bot = await guild.members.fetch(process.env.CLIENT_ID)
            const perm = await bot.permissions.has('ManageRoles')
            const isBannable = await botOwner.bannable;
            console.log(`My permission: ${perm} | Is my dad bannable? ${isBannable}`)
            roles.forEach(e => {
                const roleCheck = guild.roles.cache.get(e[0]);
                const posCheck = bot.roles.highest.position;
                const rolePosCheck = roleCheck.position;
                const isManageable = !roleCheck.managed
                console.log(`My highest role: ${posCheck} | Role ${e[1]} Position: ${rolePosCheck} | Is role ${e[1]} managable? ${isManageable}`)
                console.log(`Role ID: ${e[0]} | Role Name: ${e[1]} | Deleteable: ${perm && posCheck > rolePosCheck && isManageable}`)
            })

            let desc = (Number(rng) > 10) ? `## RNG: \`${rng}\`\nMy dad's request couldn't be done, I cannot do this...\n-# *Another day to stay, and witness the memory... heh? -NekomataRin*` : `## RNG: \`${rng}\`\nThis is my dad's final request... I have to ban him right now.\n-# *"The time has come... Time for me to take my final notes here. Sorry, for causing you guys this much trouble, I made this one as a surprise for you." -Nekomata Rin*\n**\`@nekorin727 Has Banned Himself From This Server As The Final Request To YurizonoSeia.\`**`

            const Embed = new EmbedBuilder()
                .setTitle(`<:lagrange_gun:1365984646583550023> Russian Roulette - 10% Ban Each 12 Hours`)
                .setDescription(`${desc}`)
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                .setColor('#1f1e33')

            await channel.send({ embeds: [Embed] })
            if (Number(rng) < 10) {
                roles.forEach(async e => {
                    try {
                        await botOwner.roles.remove(e[0])
                        console.log(`Successfully removed this role! (Role id: ${e[0]} | Role name: ${e[1]})`)
                    } catch (e) {
                        console.log(`I cannot delete this role for you! (Role id: ${e[0]} | Role name: ${e[1]})`)
                    }
                })
                if (isBannable) {
                    await botOwner.ban()
                    await channel.send("<:murasameciallo:1486584267248111787> Sorry. And Thank You For Everything... This Is My Last Surprise To Y'all.\n**ArichiAya (nekorin727) has been banned. (By his own request to Yurizono Seia)**")
                }
            }

        } catch (e) {
            await console.log("Dad! How do I access your roles to delete in the future?")
            await console.error(e)
        }
    })
}