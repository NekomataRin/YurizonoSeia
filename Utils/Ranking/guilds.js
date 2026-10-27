/*
Servers where chatting gives EXP. To add a server, add one entry here:
- LevelUpChannel: where level up messages are sent (empty = the channel the user chatted in)
- ExpCategories (optional): only channels inside these categories give EXP.
  Category name or ID. Names ignore case, spaces, emojis and symbols ('🏠 ┃ Server Lobby' = 'Server Lobby')
- NoExpChannels: channels that never give EXP (bot test, check rank...), even inside ExpCategories
*/
const Guilds = {
    '900742301373042809': {
        LevelUpChannel: '900760973953093664',
        ExpCategories: ['Server Lobby', 'LazyTown', 'Voice', 'PCB HQ'],
        NoExpChannels: [
            "1099717449458393108",
            "1022164020955971644",
            "1383346586087719003",
            "1383346672100315146",
            "901079130609684491",
            "900965164050960434",
            "900965274164035595",
            "900965349028139058",
            "1113889234521182279",
            "900752742228844564",
            "1113891213658046525",
            "1022161827741839451",
            "920523667866271795",
            "960939832320868362",
            "1115737217994850355",
            "1096109125982765066",
            "989162835072385114",
            "953468782297366568",
            "900752233480724490",
            "1016930426520084560",
            "1165537322943643678",
            "1113894192767324292",
            "1143609877034455201",
            "900761105721335869",
            "1165485511142551702",
            "1165485684354723910",
            "901067731758112810",
            "901067937098645514",
            "901068053939388456",
            "907416118795309067",
            "901077114231595058",
            "900778129981865984",
            "900761292359475201",
            "900761341621592086",
            "900761395740704779",
            "959409805364195328",
            "900760731807535174",
            "911177903419564092",
            "1026154120312262767",
            "901069816826318888",
            "901069937903296512",
            "953887368182661190",
            "901068558828707860",
            "954743569514643496",
            "954746792426213406",
            "954738861580374077",
            "954739172944531526",
            "916231572854812692",
            "900758927090794536",
            "900758966651482143",
            "908943289925906432",
            "900759057835622513"
        ]
    },
    '1466822964350812222': {
        LevelUpChannel: '1472646633945563300',
        NoExpChannels: [
            "1481132414121152645",
            "1481130652358152192",
            "1489675171978547261",
            "1503033593755340901",
            "1472646633945563300",
        ]
    }
}

// EXP per message and the per-user cooldown (seconds), both are [min, max)
// Event: bonus EXP until End (unix seconds) - set a new End to start another event
const Exp = {
    Normal: { Exp: [1, 5], Cooldown: [5, 15] },
    Event: { End: 1794329999, Exp: [5, 25], Cooldown: [10, 25] }
}

// Restriction codes from /ranking-restriction -> EXP multiplier
const Restrictions = {
    'Code-0': 1,
    'Code-1': 0,
    'Code-2': 0.5,
    'Code-3': 0.25
}

/*
Ranking roles, main server only (GUILD_ID in .env)
- Levels: reaching a milestone gives its role and removes the other level roles.
  /reset-rank removes them all.
- TotalExp: permanent, never removed (not even by /reset-rank)
*/
const RankRoles = {
    Levels: [
        { Level: 4, Role: '901072984981250059' },
        { Level: 8, Role: '901072982384992336' },
        { Level: 12, Role: '901072977033052230' },
        { Level: 16, Role: '901072969344880691' },
        { Level: 20, Role: '901072951401656371' },
        { Level: 24, Role: '901072942241296394' },
        { Level: 28, Role: '901072938676146176' },
        { Level: 32, Role: '901072926990807110' },
        { Level: 36, Role: '901072922121236491' },
        { Level: 40, Role: '901072917637500959' },
        { Level: 44, Role: '956597325093027910' },
        { Level: 48, Role: '956597329434128434' },
    ],
    TotalExp: [
        { Total: 10000, Role: '967803874259898388' }
    ]
}

module.exports = { Guilds, Exp, Restrictions, RankRoles }
