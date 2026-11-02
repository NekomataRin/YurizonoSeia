/*
Changelog of one version, posted by /changelog (one file per version: vX.Y.Z.js)
- Image: file in Assets/Misc (optional)
- Sections: embed fields, each Value must stay under 1024 characters
- En (optional): English version (Title / Description / Sections) for people reading /changelog in English.
  The announcement itself is always the Vietnamese one
*/
const Changelog = {
    Version: '1.4.1',
    Color: '#DCC3E3',
    Image: 'Changelog.png',
    Title: '<:seiaheh:1244128244664504392> **Yurizono Seia - Changelog v1.4.1**',
    Description: `<:SeiaSip:1244890166116618340> Chào các Sensei! Bản **\`1.4.1\`** đã lên sóng: hồi sinh một loạt lệnh từ **Miosha**, thêm lệnh quản lí cho Mod, và giờ mọi lệnh đều có cả tiếng Việt lẫn tiếng Anh nè~`,

    Sections: [
        {
            Name: '<:SeiaSmug:1250768503431233616> Hồi sinh lệnh từ Miosha',
            Value: `▸ Seia là bản kế nhiệm của **Miosha**, nên những lệnh Seia chưa có đã được hồi sinh (emoji của Mio đổi sang emoji của Seia hết rồi nhé)
▸ **Giải trí:** \`/coinflip\`, \`/dice\`, \`/shiprate\`
▸ **Linh tinh:** \`/pick\`, \`/roll\`, \`/number-convert\`, \`/check-cooldown\`, \`/minigames\`
▸ **Server:** \`/user-info\`
▸ \`/help\`: tự liệt kê toàn bộ lệnh theo nhóm nên không bao giờ thiếu lệnh nữa, kèm Changelog, Credits và FAQ
-# Lệnh nào Seia có sẵn rồi (như \`/quick-math\`, \`/rank\`...) thì giữ bản của Seia nhé!`
        },
        {
            Name: '<a:LYG_ReimuVibe:1133752889051975810> Lệnh quản lí (Mod)',
            Value: `▸ \`/ban\`, \`/unban\`, \`/kick\`, \`/timeout\`, \`/warn\`, \`/warn-list\`, \`/warn-remove\`
▸ \`/announcement\`: đăng thông báo bằng form nhập (modal)
▸ \`/restrict\` + \`/unrestrict\`: cấm một người dùng lệnh của Seia có thời hạn (trừ \`/help\`)
▸ \`/mod-afk\`: Mod / chủ bot bật AFK, ai ping sẽ bị Seia nhắc nhở
▸ \`/rank-background-list\`, \`/data-transfer\` (chuyển dữ liệu rank sang tài khoản mới)
▸ Chỉ người có **role Mod** của server mới dùng được (chủ bot cũng phải có role Mod), cảnh cáo được lưu riêng từng server
-# Role Mod của server này không có tác dụng ở server kia nhé`
        },
        {
            Name: '<:seiaheh:1244128244664504392> Ranking & minigame',
            Value: `▸ \`/top\` → \`/leaderboard\`, có nút chuyển trang ◀ ▶ và huy chương cho top 3
▸ Thêm role **﹝🔥﹞True Member** cho mốc **30000** tổng EXP (vĩnh viễn, giống ﹝🔒﹞Secret Access ở mốc 10000)
▸ Điểm \`/quick-math\` giờ tính theo từng server (điểm cũ được giữ ở \`LazyGang\`)
▸ Mod có thể reset bảng điểm của server: \`/quick-math-reset\`, \`/game-2048-reset\`
▸ \`/reset-rank\` và \`/rank-background\` dùng được ở **All Factor** với các role quản lí của server đó
-# Role ranking vẫn chỉ có ở \`LazyGang\`, EXP và level up ở All Factor vẫn như cũ`
        },
        {
            Name: '<:SeiaSip:1244890166116618340> Song ngữ Việt / Anh',
            Value: `▸ Toàn bộ lệnh giờ có cả tiếng Việt lẫn tiếng Anh (mô tả lệnh + câu trả lời)
▸ Nhớ dùng \`/setup-language\` để chọn ngôn ngữ trước nhé, chưa chọn thì Seia sẽ nhắc bằng ngôn ngữ Discord của Sensei
▸ \`/changelog\`: giờ ai cũng xem được (chỉ mình Sensei thấy), chủ bot mới đăng thông báo được
▸ \`/avatar\`: sửa \`[Guild + Banner]\`, ghi đúng là avatar / banner trong server hay avatar / banner chung, báo khi không có banner, thêm link GIF cho avatar động`
        },
        {
            Name: '<:SeiaMenacing:1244890322090201162> Role `Typhoeus` (All Factor)',
            Value: `▸ Role riêng của chủ bot, Seia tự tạo ở lần khởi động đầu tiên, màu tím lavender \`#DCC3E3\` lấy từ màu tóc của Typhoeus
▸ Ngoài chủ bot ra, ai được gán role này sẽ bị Seia gỡ ngay lập tức, kèm lời nhắn:
> *Hey! This role is meant to be only used by my dad, no one else has the perm to do this!*
▸ Lời nhắn gửi qua DM, Sensei nào khoá DM thì Seia ping trong kênh và tự xoá sau 10 giây
-# Server \`LazyGang\` không bị ảnh hưởng gì nhé!`
        }
    ],

    En: {
        Description: `<:SeiaSip:1244890166116618340> Hello Sensei! Version **\`1.4.1\`** is out: lots of commands are back from **Miosha**, Mods get moderation commands, and every command now speaks both Vietnamese and English~`,
        Sections: [
            {
                Name: '<:SeiaSmug:1250768503431233616> Commands back from Miosha',
                Value: `▸ Seia is the successor of **Miosha**, so the commands Seia didn't have are back (Mio's emojis were swapped for Seia's)
▸ **Fun:** \`/coinflip\`, \`/dice\`, \`/shiprate\`
▸ **Misc:** \`/pick\`, \`/roll\`, \`/number-convert\`, \`/check-cooldown\`, \`/minigames\`
▸ **Server:** \`/user-info\`
▸ \`/help\`: lists every command by category by itself, so it's never outdated, with Changelog, Credits and FAQ
-# Commands Seia already had (like \`/quick-math\`, \`/rank\`...) keep Seia's version!`
            },
            {
                Name: '<a:LYG_ReimuVibe:1133752889051975810> Moderation (Mod)',
                Value: `▸ \`/ban\`, \`/unban\`, \`/kick\`, \`/timeout\`, \`/warn\`, \`/warn-list\`, \`/warn-remove\`
▸ \`/announcement\`: post an announcement with a form (modal)
▸ \`/restrict\` + \`/unrestrict\`: stop someone from using Seia's commands for a while (except \`/help\`)
▸ \`/mod-afk\`: Mods / bot owners can go AFK, whoever pings them gets a reminder from Seia
▸ \`/rank-background-list\`, \`/data-transfer\` (move ranking data to a new account)
▸ Only people with a **Mod role** of the server can use them (bot owners need one too), warnings are saved per server
-# One server's Mod roles mean nothing in the other one`
            },
            {
                Name: '<:seiaheh:1244128244664504392> Ranking & minigames',
                Value: `▸ \`/top\` → \`/leaderboard\`, with ◀ ▶ page buttons and medals for the top 3
▸ New **﹝🔥﹞True Member** role at **30000** total EXP (permanent, like ﹝🔒﹞Secret Access at 10000)
▸ \`/quick-math\` scores are per server now (the old ones stay on \`LazyGang\`)
▸ Mods can reset the server's boards: \`/quick-math-reset\`, \`/game-2048-reset\`
▸ \`/reset-rank\` and \`/rank-background\` work on **All Factor** for its staff roles
-# Ranking roles are still \`LazyGang\` only, EXP and level ups on All Factor work as before`
            },
            {
                Name: '<:SeiaSip:1244890166116618340> Vietnamese / English',
                Value: `▸ Every command now has both Vietnamese and English (descriptions + answers)
▸ Pick your language with \`/setup-language\` first, until then Seia reminds you in your Discord language
▸ \`/changelog\`: anyone can read it now (only you see it), only the bot owners can post it
▸ \`/avatar\`: \`[Guild + Banner]\` fixed, it says whether it's the server or the global avatar / banner, tells you when there's no banner, GIF link for animated avatars`
            },
            {
                Name: '<:SeiaMenacing:1244890322090201162> `Typhoeus` role (All Factor)',
                Value: `▸ The bot owner's own role, Seia makes it on her first start, in lavender \`#DCC3E3\` (Typhoeus's hair color)
▸ Anyone else who gets it loses it right away, with this notice:
> *Hey! This role is meant to be only used by my dad, no one else has the perm to do this!*
▸ The notice is sent by DM, with DMs closed Seia pings them in a channel and deletes it after 10 seconds
-# \`LazyGang\` is not affected!`
            }
        ]
    }
}

module.exports = (Changelog)
