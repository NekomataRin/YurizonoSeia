const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const Language = require('../../Database/lang-setup')
const Game2048_Modes = require('../../Functions/Fun/Game-2048/2048-Modes')
const cdSchema = require('../../Database/cooldown')
const cdtxts = require('../../Assets/Defaults/cooldown')

const chalk = require('chalk')
const wait = require('node:timers/promises').setTimeout

const Game2048Db = require('../../Database/Fun/game-2048')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-2048')
        .setDescription('Play 2048 with various modes (not supported save/load game)')
        .setDescriptionLocalizations({ vi: 'Chơi 2048 với một vài chế độ (hiện không hỗ trợ save/load game)' })
        .addStringOption(option => option.setName('game-key')
            .setDescription('The game mode you wanted to play - Default: default')
            .setDescriptionLocalizations({ vi: 'Chế độ game mà bạn muốn chơi - Mặc định: default' })
            .addChoices(
                {
                    name: '[Default]',
                    value: 'default'
                },
                {
                    name: '[Hidden]',
                    value: 'hidden'
                },
                {
                    name: '[Swap]',
                    value: 'swap'
                },
                {
                    name: '[Anomaly]',
                    value: 'anomaly'
                })
            .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const cdtime = 20000

        function createDefaultMenu(key = true) {
            return [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('new-game').setLabel('[New Game]').setEmoji('1254109761125875802').setStyle(ButtonStyle.Secondary).setDisabled(false),
                    new ButtonBuilder().setCustomId('load-game').setLabel('[Load Game]').setEmoji('1254109782592327783').setStyle(ButtonStyle.Secondary).setDisabled(key)
                )
            ]
        }

        function createGameButtons(UndoUsed = true) {
            return [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('blank1').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('blank2').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('up').setEmoji('1086297338961739896').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('blank3').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('blank4').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('blank5').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('left').setEmoji('1086297531379613767').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('down').setEmoji('1086297356011585697').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('right').setEmoji('1086297678624854077').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('blank6').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('blank7').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('undo')
                        .setEmoji('1390076263951237240')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(UndoUsed),
                    new ButtonBuilder().setCustomId('blank8').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('quit').setEmoji('❌').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('blank9').setEmoji('1097172753985056859').setStyle(ButtonStyle.Secondary).setDisabled(true),
                )
            ]
        }

        //Language Setup
        let LangKey
        const LanguageKey = await Language.findOne({ UserID: interaction.user.id }).select('-_id Lang')
        if (!LanguageKey) {
            const ResponseEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`<:seiaconcerned:1244128341540208793> • **Language Is Not Set**`)
                .setDescription(`<:seiaehem:1244128370669650060> • Sensei! Please use \`/setup-language\` command in order to use the command! Since v1.4.0, my dad updated my code and added Vietnamese language for this!\n-# > And he is too lazy to add proper vietnamese embed for this lmao`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [ResponseEmbed]
            })
        }

        LangKey = LanguageKey.Lang

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    Game2048: Date.now()
                })
                await interaction.editReply(cdtxts[LangKey].new)
            } else {
                const cduser = data.UserID
                const CDTime = data.Game2048
                console.log(chalk.yellow('[Command: Game2048]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(`${cdtxts[LangKey].cd[0]} ${interaction.user} ${cdtxts[LangKey].cd[1]} <t:${Math.floor(CDTime / 1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    let noSaved = true

                    const GameData = await Game2048Db.findOne({ guildID: interaction.guild.id, userID: interaction.user.id }).select('-_id gameStats')
                    if (!GameData) noSaved = true
                    else if (GameData.gameStats.lost === false) noSaved = false

                    let gameKey = interaction.options.getString('game-key') || 'default'
                    gameKey = (!noSaved) ? GameData.gameStats.mode : gameKey

                    const Modeinfo =
                        {
                            default: ['Default', 'This is the default mode, no modifications at all. Suitable for everyone'],
                            hidden: ['Hidden', 'The board will be hidden after 5 moves. It will stay hidden for 5 moves, and will be shown for 2 moves then hidden again. It will require your memory skills, so good luck!'],
                            swap: ['Swap', 'The board will swap randomly 2 pieces after each 5 moves. Good luck with your rng, lmao.'],
                            anomaly: ['Anomaly', 'Combo of Hidden and Swap, no need to explain further. This is insanely hard, not recommended for you to play it, unless you aren\'t normalhuman.']
                        }[gameKey]

                    const Desc = {
                        new: `Welcome ${interaction.user} to 2048 game, please select button below to Start The Game!`,
                        load: `Welcome back, ${interaction.user}! Would you like to Load The Current Game?\n> **Mode:** \`${GameData?.gameStats.mode}\`\n▸ **Score:** \`${GameData?.gameStats.scores.current}\` ▸ **Moves:** \`${GameData?.gameStats.moveCount}\`\n> Saved Date: <t:${Math.floor(GameData?.gameStats.timestamp / 1000)}> | <t:${Math.floor(GameData?.gameStats.timestamp / 1000)}:R>`
                    }

                    const MenuEmbed = new EmbedBuilder()
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                        .setColor('Grey')
                        .setTitle('**2048 Game - Menu**')
                        .setDescription((!noSaved) ? Desc.load : Desc.new)
                        .setTimestamp()

                    const Menu = await interaction.editReply({
                        embeds: [MenuEmbed],
                        components: createDefaultMenu(noSaved)
                    })

                    let newGameKey = true
                    let runkey = 0

                    await new Promise((resolve) => {
                        const collector1 = Menu.createMessageComponentCollector({
                            filter: i => i.user.id === interaction.user.id,
                            time: 30000
                        })

                        collector1.on('collect', async i => {
                            if (i.customId === 'new-game') {
                                runkey = 1
                                gameKey = interaction.options.getString('game-key') || 'default'
                            } else if (i.customId === 'load-game') {
                                newGameKey = false
                                runkey = 1
                            }
                            resolve() // Tiếp tục code sau khi user nhấn nút
                        })

                        collector1.on('end', (_, reason) => {
                            if (reason !== 'user') resolve()
                        })
                    })

                    if (runkey === 1) {
                        const InitEmbed = new EmbedBuilder()
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            .setTitle(`**Game 2048** (Mode: \`${Modeinfo[0]}\`)`)
                            .setDescription(`Please use the **Arrow Buttons** to **Move**, <:undo:1390076263951237240> to **Undo**, and **❌** to quit\n${Modeinfo[1]}\n\n-# <:seiaehem:1244128370669650060> Currently, Vietnamese Isn't Supported Here... Please Wait Until My Dad Update It!`)
                            .setColor('White')
                            .setTimestamp()
                        await interaction.editReply({
                            embeds: [InitEmbed],
                            components: []
                        })

                        await wait(5000)

                        function LoadGame(Game, Stats) {
                            Game.curArr = Stats.board.current
                            Game.lastArr = Stats.board.last
                            Game.score = Stats.scores.current
                            Game.lastScore = Stats.scores.last
                            Game.moveCount = Stats.moveCount
                            Game.undoUsed = Stats.undoUsed
                            Game.lastSwapped = Stats.lastSwapped
                            Game.swapCount = Stats.swapCount
                            Game.showOnce = Stats.showOnce
                            Game.lastAddedTile = Stats.TilesIndexes.lastAddedTile
                            Game.preNewTile = Stats.TilesIndexes.preNewTile
                            Game.lost = Stats.lost
                        }

                        function SaveGame(Game) {
                            const obj = {
                                mode: gameKey,
                                scores: {
                                    current: Game.score,
                                    last: Game.lastScore
                                },
                                board: {
                                    current: Game.curArr,
                                    last: Game.lastArr,
                                },
                                moveCount: Game.moveCount,
                                undoUsed: Game.undoUsed,
                                lost: Game.lost,
                                TilesIndexes: {
                                    lastAddedTile: Game.lastAddedTile || [],
                                    preNewTile: Game.preNewTile || [],
                                },
                                lastSwapped: Game.lastSwapped || [],
                                swapCount: Game.swapCount || 0,
                                showOnce: true,
                                timestamp: `${Date.now()}`
                            }
                            return Game2048Db.findOne({ guildID: interaction.guild.id, userID: interaction.user.id }, async (err, data0) => {
                                if (err) throw err
                                if (!data0) {
                                    Game2048Db.create({
                                        guildID: interaction.guild.id,
                                        userID: interaction.user.id,
                                        gameStats: obj
                                    })
                                } else {
                                    data0.gameStats = obj
                                    data0.save()
                                }
                            })
                        }

                        const Game = Game2048_Modes[gameKey]
                        if (newGameKey) Game.CreateGame()
                        else LoadGame(Game, GameData.gameStats)


                        const button = createGameButtons(true)

                        const GameEmbed_New = new EmbedBuilder()
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: iuser.displayAvatarURL({ dynamic: true }) })
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            .setTitle(`**Game 2048** (Mode: \`${Modeinfo[0]}\`)`)
                            .setDescription(`Use arrows to move, <:undo:1390076263951237240> to Undo, ❌ to Quit.\n-# <:seiaehem:1244128370669650060> Currently, Vietnamese Isn't Supported Here... Please Wait Until My Dad Update It!`)
                            .addFields({
                                name: `► **Score:** \`${Game.score}\` ► **Moves:** \`${Game.moveCount}\``,
                                value: Game.ToString(Game.curArr)
                            })
                            .setColor('Yellow')
                            .setTimestamp()

                        const InputMessage = await interaction.editReply({
                            embeds: [GameEmbed_New],
                            components: button
                        })

                        try {
                            const collector = InputMessage.createMessageComponentCollector({
                                filter: i => i.user.id === interaction.user.id,
                                time: 180000
                            })

                            collector.on('collect', async i => {
                                await i.deferUpdate()
                                const id = i.customId
                                let moved = false

                                if (id === 'quit') {
                                    return collector.stop('quit')
                                }

                                switch (id) {
                                    case 'up':
                                        moved = Game.UMove(Game.curArr)
                                        break
                                    case 'down':
                                        moved = Game.DMove(Game.curArr)
                                        break
                                    case 'left':
                                        moved = Game.LMove(Game.curArr)
                                        break
                                    case 'right':
                                        moved = Game.RMove(Game.curArr)
                                        break
                                    case 'undo':
                                        moved = Game.Undo()
                                        break
                                }

                                if (moved) {
                                    await collector.resetTimer()
                                    const GameMovedEmbed = new EmbedBuilder()
                                        .setAuthor({ name: `${interaction.user.username}`, iconURL: iuser.displayAvatarURL({ dynamic: true }) })
                                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                        .setTitle(`**Game 2048** (Mode: \`${Modeinfo[0]}\`)`)
                                        .setDescription(`Use arrows to move, <:undo:1390076263951237240> to Undo, ❌ to Quit.\n-# <:seiaehem:1244128370669650060> Currently, Vietnamese Isn't Supported Here... Please Wait Until My Dad Update It!`)
                                        .addFields({
                                            name: `► **Score:** \`${Game.score}\` ► **Moves:** \`${Game.moveCount}\``,
                                            value: Game.ToString(Game.curArr)
                                        })
                                        .setColor('Yellow')
                                        .setTimestamp()

                                    const updatedButtons = createGameButtons(Game.undoUsed)

                                    await interaction.editReply({
                                        embeds: [GameMovedEmbed],
                                        components: updatedButtons
                                    })

                                    SaveGame(Game)

                                    if (Game.lost) {
                                        collector.stop('lose')
                                    }
                                }
                            })

                            collector.on('end', async (_, reason) => {
                                data.Game2048 = Date.now() + cdtime
                                data.save()

                                SaveGame(Game)
                                
                                let reasonText = ''
                                switch (reason) {
                                    case 'quit': {
                                        if (['hidden', 'anomaly'].includes(gameKey)) Game.showOnce = true
                                        reasonText = 'Game Saved! Here is the saved board before you left.\n> You manually quit the game.'
                                        break
                                    }
                                    case 'lose': {
                                        reasonText = 'Game Over! Here is your result of the game\n> No more valid moves!'
                                        break
                                    }
                                    default: {
                                        if (['hidden', 'anomaly'].includes(gameKey)) Game.showOnce = true
                                        reasonText = 'Game Saved! Here is the saved board before you left.\n> You took too long to respond.'
                                    }
                                }

                                const GameOver = new EmbedBuilder()
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: iuser.displayAvatarURL({ dynamic: true }) })
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                    .setTitle(`**Game 2048** (Mode: \`${Modeinfo[0]}\`)`)
                                    .setDescription(`${reasonText}\n\n-# <:seiaehem:1244128370669650060> Currently, Vietnamese Isn't Supported Here... Please Wait Until My Dad Update It!`)
                                    .addFields({
                                        name: `► **Score:** \`${Game.score}\` ► **Moves:** \`${Game.moveCount}\``,
                                        value: Game.ToString(Game.curArr)
                                    })
                                    .setColor('Grey')
                                    .setTimestamp()

                                await interaction.editReply({
                                    embeds: [GameOver],
                                    components: []
                                })
                            })
                        } catch (err) {
                            console.error('Collector Error:', err)
                            data.Game2048 = Date.now() + cdtime
                            data.save()

                            const errorEmbed = new EmbedBuilder()
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: iuser.displayAvatarURL({ dynamic: true }) })
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                .setTitle(`**Game 2048** (Mode: \`${Modeinfo[0]}\`)`)
                                .setDescription(`<a:SeiaMuted:1336385867136241705> An unexpected error occurred during gameplay. Please try again later.`)
                                .setColor('Red')
                                .setTimestamp()

                            return interaction.editReply({
                                embeds: [errorEmbed],
                                components: []
                            })
                        }
                    }
                }
            }
        })
    }
}