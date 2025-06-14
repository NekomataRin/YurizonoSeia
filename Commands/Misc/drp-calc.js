const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { GetMap } = require('../../Functions/DRP-Calc/get-map')
const { GetAccuracy } = require('../../Functions/DRP-Calc/acc-calc')
const { GetSR } = require('../../Functions/DRP-Calc/sr-calc')

const FooterEmbeds = require('../../Utils/embed')
const ColorList = require('../../Assets/DRP-Calc/colorlist')
const chalk = require('chalk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drp-calc')
        .setDescription('-TESTING- Calculate total DRP based on a beatmap')
        .addStringOption(option =>
            option.setName('map-string')
                .setDescription('The beatmap\'s URL or beatmap\'s ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mods')
                .setDescription('List of mods you played, split with spacing')
                .setMinLength(2)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('accuracy')
                .setDescription('Accuracy you used to calc (0 - 100)')
                .setMaxValue(100)
                .setMinValue(0)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('max_combo')
                .setDescription('Max combo you got')
                .setMinValue(0)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('100')
                .setDescription('Numbers of h100 you got')
                .setMinValue(0)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('50')
                .setDescription('Numbers of h50 you got')
                .setMinValue(0)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('misses')
                .setDescription('Numbers of miss you got')
                .setMinValue(0)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('speed-rate')
                .setDescription('Speed adjust you set for the beatmap (0.5 - 2)')
                .setMinValue(0.5)
                .setMaxValue(2)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('ar')
                .setDescription('Force stats - AR (0 - 12.5)')
                .setMaxValue(12.5)
                .setMinValue(0)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('od')
                .setDescription('Force stats - OD (0 - 11)')
                .setMaxValue(11)
                .setMinValue(0)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('cs')
                .setDescription('Force stats - CS (0 - 15)')
                .setMaxValue(15)
                .setMinValue(0)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('hp')
                .setDescription('Force stats - HP (0 - 11)')
                .setMaxValue(11)
                .setMinValue(0)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        return interaction.editReply('This command is NO LONGER Supported, Sorry!')


        const MapString = interaction.options.getString('map-string'),
            Accuracy = interaction.options.getNumber('accuracy'),
            Hit100 = interaction.options.getInteger('100'),
            Hit50 = interaction.options.getInteger('50'),
            Misses = interaction.options.getInteger('misses')


        let ModsArr = interaction.options.getString('mods') || 'NM',
            SpeedRate = interaction.options.getNumber('speed-rate') || 1

        ModsArr = ModsArr.toUpperCase().split(' ')
        SpeedRate = SpeedRate.toFixed(2)

        const ModsList = [
            'HR', 'HD', 'DT', 'NC', 'FL', 'SD', 'PF', 'EZ', 'NF', 'HT', 'AT', 'AP', 'V2', 'PR'
        ]

        ModsArr = [... new Set(ModsArr)]
        ModsArr = ModsArr.filter(n => ModsList.indexOf(n) !== -1)
        if (ModsArr.length === 0) ModsArr.push('NM')

        if (ModsArr.indexOf('HR') !== -1 && ModsArr.indexOf('EZ') !== -1)
            ModsArr = (ModsArr.indexOf('HR') < ModsArr.indexOf('EZ'))
                ? ModsArr.filter(n => n !== 'EZ')
                : ModsArr = ModsArr.filter(n => n !== 'HR')

        if (ModsArr.indexOf('DT') !== -1 && ModsArr.indexOf('HT') !== -1)
            ModsArr = (ModsArr.indexOf('DT') < ModsArr.indexOf('HT'))
                ? ModsArr.filter(n => n !== 'HT')
                : ModsArr.filter(n => n !== 'DT')

        if (ModsArr.indexOf('DT') !== -1 && ModsArr.indexOf('NC') !== -1)
            ModsArr = (ModsArr.indexOf('DT') < ModsArr.indexOf('HT'))
                ? ModsArr.filter(n => n !== 'NC')
                : ModsArr.filter(n => n !== 'DT')

        //console.log(`${chalk.green(`[DEBUG]`)} Main: Mod List: `)
        //console.log(ModsArr)

        const GetMapResult = await GetMap(MapString)
        const AccuracyResult = await GetAccuracy(MapString, Accuracy, Hit100, Hit50, Misses)

        let accuracy, h300, h100, h50, misses
        accuracy = AccuracyResult[0]
        h300 = AccuracyResult[1]
        h100 = AccuracyResult[2]
        h50 = AccuracyResult[3]
        misses = AccuracyResult[4]

        const result = GetMapResult[0],
            map_info = GetMapResult[1]

        if (GetMapResult === true || AccuracyResult === true) {
            const ErrEmbed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244128341540208793> • Cannot execute this command')
                .setDescription('<:seiaehem:1244129111169826829> • You had provided the invalid beatmap so I cannot run this command for you, sorry...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

            return interaction.editReply({
                embeds: [ErrEmbed]
            })
        }

        /*
        *-----------------------------------------
        * [Calculating AR value]
        * Default Value: 1200
        * | AR > 5 | 1200 - 750 * (AR - 5) / 5 
        * | AR < 5 | 1200 + 600 * (5 - AR) / 5
        * | AR = 5 | Keeps the value of 1200
        *-----------------------------------------
        * [Calculating OD value]
        * Default Value: 80
        * All OD Calculation Is: (OD - 80) / -6
        *-----------------------------------------
        * [Calculating CS value]
        * Just +1 with HR, -1 with EZ
        *-----------------------------------------
        * [Calculating HP value]
        * DT - HT: Keeps the value of HP
        * HR: HP = HP * 1.4
        * EZ: HP = HP / 2
        */

        const ARMS = 1200 //AR5.0
        const ODMS = 80 //OD0.0

        //Constants Values
        const DEFAULT_STATS = [result[0], result[1], result[2], result[3]]
        const INPUT_STATS = result

        //HR, EZ Value

        /*
        * [HR] - Multiplies by 1.4, return 10 if AR > 10
        * [EZ] - Halves by 2
        * Reason why I don't convert them for ARARMS value because it's solid from the AR input value,
        * only DT and HT will need those
        * CS Calculation
        * HR: - Multiplies by 1.3, return 10 if CS > 10
        * EZ: - Halves by 2
        */

        /* [CS] */
        //Return value of CS [HR], rounded by 1 digit
        function getCSHR(n) {
            return (n < 10) ? n = (Number(n) + 1).toFixed(1) : n = 10..toFixed(1)
        }

        //Return value of CS [EZ], rounded by 1 digit
        function getCSEZ(n) {
            return n = (Number(n) - 1).toFixed(1)
        }

        /* [HP] */
        //Return value of HP [HR], rounded by 1 digit
        function getHPHR(n) {
            n *= 1.4
            if (n > 10) n = 10
            return n.toFixed(1)
        }
        //Return value of HP [EZ], rounded by 1 digit
        function getHPEZ(n) {
            n /= 2
            return n.toFixed(1)
        }

        /* [AR] */
        //Return value of AR [HR], rounded by 2 digits 
        function GetARHR(n) {
            n *= 1.4
            if (n > 10) n = 10
            return n.toFixed(2)
        }

        //Return value of AR [EZ], rounded by 2 digits
        function GetAREZ(n) {
            n /= 2
            return n.toFixed(2)
        }

        /* [OD] */
        //Return value of OD [HR], rounded by 2 digits
        function GetODHR(n) {
            n *= 1.4
            if (n > 10) n = 10
            return n.toFixed(2)
        }

        //Return value of OD [EZ], rounded by 2 digits
        function GetODEZ(n) {
            n /= 2
            return n.toFixed(2)
        }

        //DT and HT value

        /*
        * Beforehand, let's convert them into timing metric (in ms), the AR value is the same
        * [DT] - Timing = 2/3 of original timing
        * [HT] - Timing = 4/3 of original timing
        */

        /* [AR] */
        //Convert AR -> Timing
        function ConvertToARMS(n) {
            let m = 0
            if (n === 5) return m = ARMS
            else return (n > 5) ? (m = ARMS - 750 * (n - 5) / 5).toFixed() : (m = ARMS + 600 * (5 - n) / 5).toFixed()
        }

        //Convert Timing -> AR
        function ConvertToAR(n) {
            let p = 0
            if (n === ARMS) return p = 5..toFixed(2)
            else return (n > ARMS) ? p = (((n - 1200) * 5 - 3000) / -600).toFixed(2) : p = (((n - 1200) * 5 - 3750) / -750).toFixed(2)
        }

        //Return the value of AR [DT], rounded by 2 digits
        function GetARDT(n) {
            let m = ConvertToARMS(n)
            m *= 2 / 3
            return ConvertToAR(m)
        }

        //Return the value of AR [HT], rounded by 2 digits
        function GetARHT(n) {
            let m = ConvertToARMS(n)
            m *= 4 / 3
            return ConvertToAR(m)
        }

        /* [OD] */
        //Convert OD -> Timing
        function ConvertToODMS(n) {
            let m = 0
            if (n === 0) return m = ODMS
            else return m = (ODMS - 6 * n).toFixed(2)
        }

        //Convert Timing -> OD
        function ConvertToOD(n) {
            let p = 0
            if (n === ODMS) return p = 0..toFixed(2)
            else return p = ((n - ODMS) / -6).toFixed(2)
        }

        //Return the value of OD [DT], rounded by 2 digits
        function GetODDT(n) {
            let m = ConvertToODMS(n)
            m *= 2 / 3
            return ConvertToOD(m)
        }

        //Return the value of OD [HT], rounded by 2 digits
        function GetODHT(n) {
            let m = ConvertToODMS(n)
            m *= 4 / 3
            return ConvertToOD(m)
        }

        /*
        * Speed edit (a lil bit of complicated)
        * Timing = Original Timing / Rate
        */

        /* [AR] */
        function GetARSpeed(n, rate) {
            let m = ConvertToARMS(n)
            m = (m / rate).toFixed()
            return ConvertToAR(m)
        }

        /* [OD] */
        function GetODSpeed(n, rate) {
            let m = ConvertToODMS(n)
            m = (m / rate).toFixed(2)
            return ConvertToOD(m)
        }

        //Stats input, rounded to 1 decimal digits
        let STATS = INPUT_STATS.slice(0, 4)

        for (var i in STATS) {
            STATS[i] = (isNaN(STATS[i])) ? Number(DEFAULT_STATS[i]).toFixed(1) : Number(STATS[i]).toFixed(1)
            if (i === 4) break
        }

        let AR = STATS[0], OD = STATS[1], CS = STATS[2], HP = STATS[3]
        //console.log(`${chalk.green(`[DEBUG]`)} Main: ${AR}, ${OD}, ${CS}, ${HP}, ${SpeedRate}`)

        //Return Max Combo
        const MAX_COMBO = result[7]
        let max_combo = interaction.options.getInteger('max-combo') || MAX_COMBO
        max_combo = (max_combo > MAX_COMBO) ? MAX_COMBO : max_combo
        if (max_combo === MAX_COMBO && Misses > 0) {
            max_combo -= Misses
        }

        //Return Stats Mods
        function ReturnStatsMods(arr, n) {
            const Arr1 = ['HR', 'EZ'], Arr2 = ['DT', 'HT'], ModCondition1 = [0, 0], ModCondition2 = [0, 0]
            for (var i in arr) {
                if (arr[i] === 'NC') arr[i] = 'DT'
                if (Arr1.indexOf(arr[i]) !== -1) ModCondition1[Arr1.indexOf(arr[i])] = 1
                if (Arr2.indexOf(arr[i]) !== -1) ModCondition2[Arr2.indexOf(arr[i])] = 1
            }

            let a = AR, b = OD, c = CS, d = HP
            let KeyString = ModCondition1.toString().replace(/,/g, '') + ModCondition2.toString().replace(/,/g, '')
            switch (KeyString) {
                case '1000':
                    {
                        a = GetARHR(a)
                        b = GetODHR(b)
                        c = getCSHR(c)
                        d = getHPHR(d)
                        break
                    }
                case '0100':
                    {
                        a = GetAREZ(a)
                        b = GetODEZ(b)
                        c = getCSEZ(c)
                        d = getHPEZ(d)
                        break
                    }
                case '0010':
                    {
                        a = GetARDT(a)
                        b = GetODDT(b)
                        break
                    }
                case '0001':
                    {
                        a = GetAREZ(a)
                        b = GetODEZ(b)
                        break
                    }
                case '1010':
                    {
                        a = GetARDT(GetARHR(a))
                        b = GetODDT(GetODHR(b))
                        c = getCSHR(c)
                        d = getHPHR(d)
                        break
                    }
                case '0110':
                    {
                        a = GetARDT(GetAREZ(a))
                        b = GetODDT(GetODEZ(b))
                        c = getCSEZ(c)
                        d = getHPEZ(d)
                        break
                    }
                case '1001':
                    {
                        a = GetARHT(GetARHR(a))
                        b = GetODHT(GetODHR(b))
                        c = getCSHR(c)
                        d = getHPHR(d)
                        break
                    }
                case '0101':
                    {
                        a = GetARHT(GetAREZ(a))
                        b = GetODHT(GetODEZ(b))
                        c = getCSEZ(c)
                        d = getHPEZ(d)
                        break
                    }
                default:
                    {
                        a = a
                        b = b
                        c = c
                        d = d
                    }
            }

            if (Number(n) !== 1) {
                a = GetARSpeed(a, Number(n).toFixed(2))
                b = GetODSpeed(b, Number(n).toFixed(2))
            }

            return [a, b, c, d]
        }

        ModsArr = ModsArr.filter(n => n !== 'NM')
        //Return The Value Of The Stats After Calling Function
        let ar = ReturnStatsMods(ModsArr, SpeedRate)[0],
            od = ReturnStatsMods(ModsArr, SpeedRate)[1],
            cs = ReturnStatsMods(ModsArr, SpeedRate)[2],
            hp = ReturnStatsMods(ModsArr, SpeedRate)[3]


        let ForceStats_Key = false
        let AR_Force = interaction.options.getNumber('ar')
        let OD_Force = interaction.options.getNumber('od')
        let CS_Force = interaction.options.getNumber('cs')
        let HP_Force = interaction.options.getNumber('hp')

        ar = (AR_Force) ? AR_Force : ar
        od = (OD_Force) ? OD_Force : od
        cs = (CS_Force) ? CS_Force : cs
        hp = (HP_Force) ? HP_Force : hp

        if (AR_Force || OD_Force || CS_Force || HP_Force) ForceStats_Key = true
        //console.log(`${chalk.green(`[DEBUG]`)} Main: Force Stats: [AR OD CS HP] ${AR_Force} ${OD_Force} ${CS_Force} ${HP_Force}`)
        //console.log(`${chalk.green('[DEBUG]')} Main: Return Stats: ${ar} ${od} ${cs} ${hp}`)
        //console.log(`${chalk.green(`[DEBUG]`)} Main: ForceStats_Key ${ForceStats_Key}`)

        const ModsStr = ModsArr.toString().replace(/,/g, '')
        const SR_Result = await GetSR(MapString, ModsStr, ar, od, cs, hp, ForceStats_Key, SpeedRate)
        const SR = Number(SR_Result[0])
        let BeatmapDiffMulti = SR_Result[1]

        //console.log(`${chalk.green('[DEBUG]')} Main: ${SR} | ${BeatmapDiffMulti}`)

        //The most important thing, pp calc
        function ReturnBonusOrPenalty(arr, key, ar_inp, cs_inp) {
            /*
            * spec_param: used for bonus of hidden and flashlight
            * spec_param[0] : hidden
            * spec_param[1] : flashlight    
            */
            const spec_param = [0, 0]
            spec_param[0] = (arr.indexOf('HD') !== -1) ? 1 : 0
            spec_param[1] = (arr.indexOf('FL') !== -1) ? 1 : 0
            //Bonuses (Plus Method)

            /** 
             * First, this is not for the Force Stats, this is the unmodified stats in game
             * AR >= 11: increases 2% of total DRP value
             * AR <= 5: increases 3% of total DRP value
             * hidden: increases 1.2 of total DRP value
             * flashlight: increases 1.5% of total DRP value
             * CS > 6.5: incrases 2.5% of total DRP value
             */

            let Bonus_Total = 1

            let bonuses_value = 1
            let param_str = spec_param.toString().replace(/,/g, '')

            //hidden and flashlight 
            switch (param_str) {
                case '10':
                    {
                        bonuses_value += 0.012
                        break
                    }
                case '01':
                    {
                        bonuses_value += 0.015
                        break
                    }
                case '11':
                    {
                        bonuses_value += 0.025
                        break
                    }
                default:
                    bonuses_value *= 1
            }

            //No Stats Edit
            if (!key) {
                //AR buffs
                if (ar_inp >= 11) bonuses_value += 0.02
                if (ar_inp <= 5 || (ar_inp <= 7.67 && arr.indexOf('DT') !== -1)) bonuses_value += 0.03

                //CS buffs
                if (cs_inp > 6.5) bonuses_value += 0.025
            }

            //Penalties (Standard Method)

            /*
            * AR edit: AR10 will have the most weighting on Penalty: -5% of total DRP value, scales by 0.625% each 0.1 diff 
            * DT + AR edit: AR10 will have the most weighting on Penalty: -7.5% of total DRP value, scales by 0.9375% each 0.1 diff 
            * CS edit: CS size > Original CS: -0.75% each 0.5 diff (which is: diff > 2 because of HR)
            * 
            * Because the value of Penalties is always < 1
            * AR edit only without DT and CS edit: keep 
            * DT edit with AR: multipllies by 0.85
            */

            let penalties_value = 1
            if (key) {
                //AR edit
                let diff_ar = Math.abs(ar_inp - 10)
                if (arr.indexOf('DT') !== -1) {
                    penalties_value = (diff_ar > 0.8)
                        ? 1
                        : penalties_value *= 1 - (0.075 - 0.009375 * (diff_ar / 0.1))
                    penalties_value *= 0.85
                } else {
                    penalties_value = (diff_ar > 0.8)
                        ? 1
                        : penalties_value *= 1 - (0.05 - 0.00625 * (diff_ar / 0.1))
                }
                //CS edit
                let diff_cs = cs_inp - CS
                if (diff_cs > 2) penalties_value *= 1 - (0.0075 * (diff_cs / 0.5))
            }


            Bonus_Total = (bonuses_value * penalties_value).toFixed(5)
            return Bonus_Total
        }

        /*
        * Bonus Or Penalty: Based On Value Compared To 1 (3 digits decimal)
        * n < 1: Penalty
        * n > 1: Bonus
        */
        const Bonus_Total = ReturnBonusOrPenalty(ModsArr, ForceStats_Key, ar, cs)
        //console.log(`${chalk.green('[DEBUG]')} ${Bonus_Total}`)

        function logN(x, y) {
            return Math.log(x) / Math.log(y)
        }

        //Final touch: DRP export
        let Speed_multiplier = (SpeedRate > 1)
            ? 1.12 ** logN(SpeedRate, 1.5)
            : 0.03 ** logN(SpeedRate, 0.75)

        const difficulty_multiplier = Speed_multiplier * BeatmapDiffMulti

        //Max Combo Scaling
        function MaxComboScaling(combo) {
            combo = Number(combo)
            let Multipliers = 1
            if (combo > 4000) {
                Multipliers = 1.25
                return (combo / 4000) * 12 * Multipliers
            }
            else if (combo < 1000) {
                Multipliers = 1.06
                return (combo / 1000) * 7 * Multipliers
            }
            else return (combo / 1500) * 7.5
        }
        console.log(MaxComboScaling(max_combo))

        function LengthScaling(n) {
            if (n < 6 * 60) return n = 1
            if (n < 12 * 60) return n = 1 - 0.005 * (n / 75)
            else return n = 1 - 0.01 * (n / 60)
        }

        const ImgLinkSR = (SR.toFixed(1) > 9) ? 9..toFixed(1) : SR.toFixed(1)

        const StatusStr = map_info[4].slice(0, 1).toUpperCase() + map_info[4].slice(1)
        //Cre to hiderikzki from GitHub for this thing!
        let LinkURL = (ImgLinkSR <= 0)
            ? './Assets/DRP-Calc/stars_0.0@2x.png'
            : `https://raw.githubusercontent.com/hiderikzki/osu-difficulty-icons/main/rendered/std/stars_${ImgLinkSR}@2x.png`

        const Title = `**[${map_info[1]} - ${map_info[0]} (${map_info[2]}) [${map_info[3]}]](${map_info[7]})**`
        const Color = ColorList[`${Number(ImgLinkSR).toFixed(1)}`]
        //console.log(Color)

        let speedbpmrate = 1
        if (ModsArr.indexOf('DT') !== -1 || ModsArr.indexOf('NC') !== -1) speedbpmrate = 1.5
        speedbpmrate *= SpeedRate

        let BPM_Desc = `\`${map_info[11]}\``
        if (speedbpmrate !== 1) {
            BPM_Desc = `\`${map_info[11]}\` \`(${(map_info[11] * speedbpmrate).toFixed(1)})\``
        }

        let adesc = (ar !== AR) ? `\`${AR}\` \`(${ar})\`` : `\`${ar}\``,
            bdesc = (od !== OD) ? `\`${OD}\` \`(${od})\`` : `\`${od}\``,
            cdesc = `\`${cs}\``,
            ddesc = `\`${hp}\``

        const Length = map_info[10]

        function getLengthString(str) {
            let minutes = Math.floor(str / 60)
            let seconds = Math.floor(str % 60)
            if (minutes < 10) {
                minutes = `0${minutes}`
            }
            if (seconds < 10) {
                seconds = `0${seconds}`
            }

            return `${minutes}:${seconds}`
        }

        let SpeedAdjustedLength = Math.round(Length / speedbpmrate)

        //console.log(`${chalk.green(`[DEBUG]`)} Main: Difficulty Multi: ${difficulty_multiplier}`)
        console.log(LengthScaling(SpeedAdjustedLength))

        let DRP_VALUE = accuracy * ((max_combo / MaxComboScaling(max_combo)) ** 1.12) * difficulty_multiplier * ((Math.sqrt(SR) / 2.15) ** 1.005) * LengthScaling(SpeedAdjustedLength)
        DRP_VALUE -= ((h100 / 6) ** 1.025 + (h50 / 3) ** 1.05 + misses ** 1.075)
        DRP_VALUE *= Bonus_Total

        //EZ Deserved To Get 1.5x Buff, Because It's Unbalanced Compared To NM
        DRP_VALUE = (ModsArr.indexOf('EZ') !== -1) ? DRP_VALUE * 1.5 : DRP_VALUE

        if (DRP_VALUE < 0) DRP_VALUE = 0
        //console.log(`${chalk.green(`[DEBUG]`)} Main: Total DRP: ${DRP_VALUE}`)
        const LengthString = (speedbpmrate !== 1) ? `\`${getLengthString(Length)}\` \`(${getLengthString(SpeedAdjustedLength)})\``
            : `\`${getLengthString(Length)}\``

        const Desc =
            `**${Title}**
### <a:ShirokoOk:1230150661589438464> **Requested by ${interaction.user}**
▸ **Mods:** \`${ModsStr}RX\` ▸ **Length:** ${LengthString}
▸ **Difficulty:** \`${SR}★\` ▸ **Status:** \`${StatusStr}\`
### <:mikahappy:1245234978522923028> **Last Update:** \`${map_info[6]}\`
▸ ❤️ **Fav Count:** \`${map_info[5]}\` 
▸ ▶️ **Play Count:** \`${map_info[9]}\`
### <:HinaDressPerformance:1257280218612371518> **Objects** 
▸ **Circles:** \`${result[4]}\` ▸ **Sliders:** \`${result[5]}\` ▸ **Spinners:** \`${result[6]}\`
▸ **Max Combo:** \`${MAX_COMBO}x\`
### <:SeiaSip:1244890166116618340> **Stats:** (Force: \`${ForceStats_Key}\`)
▸ **BPM:** ${BPM_Desc} ▸ **Speed Rate:** \`${SpeedRate}x\`
▸ **AR:** ${adesc} ▸ **OD:** ${bdesc}
▸ **CS:** ${cdesc} ▸ **HP:** ${ddesc}
### <:WakamoCoffee:1259326736240214097> **Result:**
▸ **Combo:** \`${max_combo}x/${MAX_COMBO}x\`
▸ **Accuracy:** \`${(accuracy * 100).toFixed(2)}%\` | \`[${h300}/${h100}/${h50}/${misses}]\`
### <:hoshinohappy:1230898486535393290> **Total DRP:** \`${DRP_VALUE.toFixed(2)}\`
-# Note: The value might change because i'm working on this... -Nekomata Rin`

        const Thumbnail = map_info[8]

        const DRPCalcEmbed = new EmbedBuilder()
            .setColor(Color)
            .setAuthor({ name: `Beatmap Info`, iconURL: `${LinkURL}` })
            .setDescription(`${Desc}`)
            .setThumbnail(`${Thumbnail}`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        await interaction.editReply({
            embeds: [DRPCalcEmbed]
        })
    }
}
