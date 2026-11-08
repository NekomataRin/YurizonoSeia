/*
Changelog of one version, posted by /changelog (one file per version: vX.Y.Z.js)
- Image: file in Assets/Misc (optional)
- Sections: embed fields, each Value must stay under 1024 characters
- En (optional): English version (Title / Description / Sections) for people reading /changelog in English.
  The announcement itself is always the Vietnamese one
*/
const Changelog = {
    Version: '1.4.2',
    Color: '#FB8BFF',
    Image: 'Changelog.png',
    Title: '<:seiaheh:1244128244664504392> **Yurizono Seia - Changelog v1.4.2**',
    Description: `<:SeiaSip:1244890166116618340> Chào các Sensei! Bản **\`1.4.2\`** là bản dọn dẹp nhỏ: đổi tên vài lệnh để phân biệt lệnh của thành viên với lệnh quản lí, card mở khoá giờ tính riêng từng server, và có thêm card mới nè~`,

    Sections: [
        {
            Name: '<:SeiaSmug:1250768503431233616> Đổi tên lệnh cho dễ phân biệt',
            Value: `▸ Lệnh cùng nhóm giờ nằm cạnh nhau khi gõ \`/\`, chữ **manage** = lệnh quản lí
▸ \`/set-background\` → \`/background-set\` (thành viên)
▸ \`/background-view\` → \`/background-owned\` (thành viên)
▸ \`/rank-background\` → \`/background-manage\` (Mod/Owner)
▸ \`/rank-background-list\` → \`/background-manage-list\` (Mod/Owner)
▸ \`/reset-rank\` → \`/leaderboard-reset\` (Mod/Owner)
▸ \`/ranking-restriction\` → \`/exp-penalty\` (Owner), hết trùng chữ với \`/restrict\` của Mod
▸ \`/set-exp\` → \`/exp-set\` (NekoRin)
-# Chỉ đổi tên thôi, dữ liệu của mọi người vẫn y nguyên nhé!`
        },
        {
            Name: '<a:ShirokoAlert:1230150424334438421> Ai dùng được lệnh nào',
            Value: `▸ Nhóm **Quản lí (Mod)** vẫn chỉ dành cho role Mod của server (chủ bot cũng phải có role Mod), trừ \`/restrict\`, \`/unrestrict\` và \`/mod-afk\`: chủ bot luôn dùng được
▸ Lệnh ranking / bảng điểm thì chủ bot luôn dùng được: \`/leaderboard-reset\`, \`/background-manage\`, \`/background-manage-list\`, \`/data-transfer\`, \`/quick-math-reset\`, \`/game-2048-reset\`
▸ Mô tả lệnh ghi rõ ai dùng được: \`-Mod Only-\`, \`-Mod/Owner Only-\`, \`-Owner Only-\`
▸ \`/help\` làm mới: menu chọn thẳng từng nhóm lệnh, mỗi nhóm chia phần 👥 Mọi người / 🛡️ Mod / 👑 Owner, bấm vào tên lệnh là dùng được luôn
▸ Cả nhóm \`/background-*\` nằm chung trang **Tiện ích**, \`/exp-set\` + \`/exp-penalty\` ở trang **Xếp hạng**`
        },
        {
            Name: '<:seiaheh:1244128244664504392> Rank card theo từng server',
            Value: `▸ Card đã mở khoá giờ tính riêng từng server: card mở ở \`LazyGang\` không tự có ở All Factor, và ngược lại
▸ Card mọi người mở khoá từ trước được giữ ở \`LazyGang\`
▸ Bộ sưu tập card thì server nào cũng như nhau, \`/background-list\` cho biết card nào Sensei đã nhận ở server đang dùng
▸ \`/data-transfer\` chỉ chuyển card của server đang dùng lệnh
▸ \`/leaderboard-reset\` không đụng tới card đã mở khoá và background đang dùng`
        },
        {
            Name: '<:typhoYahoo:1568985448762843237> Card mới: Arknights: Endfield',
            Value: `▸ Bộ sưu tập mới **ArknightsEndfield** với card \`typhoeus\`
▸ Xem thử bằng \`/background-list\` (card cuối cùng đó)`
        },
        {
            Name: '<:SeiaSip:1244890166116618340> Linh tinh',
            Value: `▸ \`/howgay\` ở All Factor giờ cũng có role **﹝🌈﹞ I'M GAY** và **﹝🔥﹞Giga CHAD**, nằm trên role Member để hiện màu
▸ Cập nhật danh sách người dùng không thể check bằng \`/howgay\`
▸ \`/mod-afk\`: ping chủ bot lúc ổng đang AFK sẽ thấy một lời nhắc đặc biệt của Seia, thử là biết~
▸ \`/rank\` và \`/leaderboard\` ghi rõ "bị phạt EXP" thay vì "bị hạn chế" (để khỏi nhầm với \`/restrict\`)
▸ Emoji Hololive / Touhou cũ trong câu trả lời của lệnh đã đổi sang emoji Blue Archive / Senren Banka (card Touhou và các asset của game vẫn giữ nguyên)
▸ \`/background-list\`: nút trang có tiếng Việt, sửa vài lỗi chính tả trong câu trả lời của \`/background-manage\``
        }
    ],

    En: {
        Description: `<:SeiaSip:1244890166116618340> Hello Sensei! Version **\`1.4.2\`** is a small clean-up: some commands got new names so member commands and staff commands are easy to tell apart, unlocked cards are per server now, and there's a new card~`,
        Sections: [
            {
                Name: '<:SeiaSmug:1250768503431233616> Clearer command names',
                Value: `▸ Commands of the same group now sit next to each other when you type \`/\`, **manage** = a staff command
▸ \`/set-background\` → \`/background-set\` (members)
▸ \`/background-view\` → \`/background-owned\` (members)
▸ \`/rank-background\` → \`/background-manage\` (Mod/Owner)
▸ \`/rank-background-list\` → \`/background-manage-list\` (Mod/Owner)
▸ \`/reset-rank\` → \`/leaderboard-reset\` (Mod/Owner)
▸ \`/ranking-restriction\` → \`/exp-penalty\` (Owner), no more mix-up with the Mods' \`/restrict\`
▸ \`/set-exp\` → \`/exp-set\` (NekoRin)
-# Only the names changed, everyone's data is the same!`
            },
            {
                Name: '<a:ShirokoAlert:1230150424334438421> Who can use what',
                Value: `▸ The **Moderation (Mod)** group is still for the server's Mod roles only (bot owners need one too), except \`/restrict\`, \`/unrestrict\` and \`/mod-afk\`: bot owners can always use those
▸ Ranking / leaderboard commands can always be used by the bot owners: \`/leaderboard-reset\`, \`/background-manage\`, \`/background-manage-list\`, \`/data-transfer\`, \`/quick-math-reset\`, \`/game-2048-reset\`
▸ Command descriptions say who can use them: \`-Mod Only-\`, \`-Mod/Owner Only-\`, \`-Owner Only-\`
▸ New \`/help\`: the menu goes straight to each command group, each group is split into 👥 Everyone / 🛡️ Mod / 👑 Owner, and you can click a command to use it
▸ Every \`/background-*\` command is on the **Utils** page, \`/exp-set\` + \`/exp-penalty\` on the **Ranking** page`
            },
            {
                Name: '<:seiaheh:1244128244664504392> Rank cards per server',
                Value: `▸ Unlocked cards are per server now: a card unlocked on \`LazyGang\` isn't on All Factor, and the other way around
▸ Cards unlocked before stay on \`LazyGang\`
▸ Every server has the same card collection, \`/background-list\` shows which ones you have on the server you're in
▸ \`/data-transfer\` only moves the cards of the server it's used on
▸ \`/leaderboard-reset\` keeps unlocked cards and equipped backgrounds`
            },
            {
                Name: '<:typhoYahoo:1568985448762843237> New card: Arknights: Endfield',
                Value: `▸ New **ArknightsEndfield** collection with the \`typhoeus\` card
▸ Take a look with \`/background-list\` (it's the last card)`
            },
            {
                Name: '<:SeiaSip:1244890166116618340> Misc',
                Value: `▸ \`/howgay\` on All Factor now has the **﹝🌈﹞ I'M GAY** and **﹝🔥﹞Giga CHAD** roles too, right above Member so their color shows
▸ Updated the list of users \`/howgay\` can't check
▸ \`/mod-afk\`: ping the bot owner while he's AFK and Seia has a special reminder for you, try it~
▸ \`/rank\` and \`/leaderboard\` say "EXP penalty" instead of "restricted" (no mix-up with \`/restrict\`)
▸ The old Hololive / Touhou emojis in command answers were swapped for Blue Archive / Senren Banka ones (Touhou cards and game assets stay)
▸ \`/background-list\`: Vietnamese page button, a few typos fixed in \`/background-manage\`'s answers`
            }
        ]
    }
}

module.exports = (Changelog)
