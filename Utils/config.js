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
        },
        // Moderation log (/ban, /kick, /timeout, /warn...) by guild ID, no entry = no log
        ModLog: {
            // Lazy Gang (same channel as the message log)
            '900742301373042809': '1165537322943643678'
        }
    },

    // Roles of every server, by guild ID
    // Mod: roles that can use the mod commands (/reset-rank, /rank-background)
    Roles: {
        // Lazy Gang (main server, GUILD_ID in .env)
        '900742301373042809': {
            // Every staff role with authority held by people (no bot roles)
            Mod: [
                '977953420776452096', // President Of Server LYG
                '900746318757122068', // Senior Admin
                '900746995126390814', // Admin
                '900747170590883941', // Mod
                '900747360450277456', // Staff
                '900747529384247336'  // PCB Team ID Card
            ],
            Gay: '1162944612508377088',
            GigaChad: '1171750121109733438',
            // /announcement pings this role when the "message" box is left empty
            AnnouncePing: '901074521824559125' // Ping Announcement
        },
        // All Factor (no Gay / Giga Chad roles)
        '1466822964350812222': {
            // Every role with authority (all Administrator), except the "Seia" role
            Mod: [
                '1466823461505601636', // Founder
                '1466847989833138383', // 2nd Factor Leader
                '1467188095228313682', // All Factor Member Management
                '1473742089543090246'  // All Factor Chunithm Leader
            ]
        }
    },

    // Roles only the bot owners (Utils/owners.js) may have, by guild ID -> role name.
    // Seia makes the role on her first start and gives it to the owners;
    // anyone else who gets it loses it right away
    OwnerRoles: {
        // All Factor
        '1466822964350812222': {
            Typhoeus: {
                // Discord position when the role is made (67 = right above "Lục Đạo Sục Chéo (?)")
                Position: 67,
                // Color when the role is made (null = no color): Typhoeus's lavender hair
                // Hoist = shown as its own group in the member list
                Color: '#DCC3E3',
                Hoist: false,
                // Sent to whoever loses the role: by DM, or pinged in NoticeChannel
                // (deleted after NoticeSeconds) when their DMs are closed
                Notice: 'Hey! This role is meant to be only used by my dad, no one else has the perm to do this!',
                NoticeChannel: '1472646633945563300',
                NoticeSeconds: 10
            }
        }
    },

    Emojis: {
        GalleryUpvote: '1207387176673873991',
        GalleryDownvote: '1207387198643642530'
    }
}

module.exports = (Config)
