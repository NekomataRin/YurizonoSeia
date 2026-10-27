// Every hard-coded Discord ID of the bot lives here.
// The main server (Lazy Gang) is GUILD_ID in .env
const Config = {
    BotID: '1244213929438089286',

    Channels: {
        MessageLog: '1165537322943643678',
        Welcome: '1383346586087719003',
        Goodbye: '1383346672100315146',
        Omikuji: '1084370333622083624',
        QuickMath: ['1195982067780042863', '1466825591306326038', '1501585463163621486', '1472646633945563300'],
        // Image-only channel + where to send people who chat in it
        Gallery: '1207402690464841728',
        GalleryChat: '900755787142545438',
        // Channels where invite links to other servers are allowed
        InviteAllowed: [
            '900752742228844564',
            '953468782297366568',
            '901069937903296512',
            '953887368182661190'
        ],
        // /changelog: tried here first, then posted in the announcement channel of every server
        ChangelogTest: '1016930426520084560',
        Announcements: {
            // Lazy Gang - #announcement
            '900742301373042809': '900752742228844564',
            // 2nd server (same channel as its level up messages)
            '1466822964350812222': '1472646633945563300'
        }
    },

    Roles: {
        Mod: '900747529384247336',
        Gay: '1162944612508377088',
        GigaChad: '1171750121109733438'
    },

    Emojis: {
        GalleryUpvote: '1207387176673873991',
        GalleryDownvote: '1207387198643642530'
    }
}

module.exports = (Config)
