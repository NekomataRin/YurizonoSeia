/*
Changelog of one version, posted by /changelog (one file per version: vX.Y.Z.js)
- Image: file in Assets/Misc (optional)
- Sections: embed fields, each Value must stay under 1024 characters
- En (optional): English version (Title / Description / Sections) for people reading /changelog in English.
  The announcement itself is always the Vietnamese one
*/
const Changelog = {
    Version: '1.4.3',
    Color: '#7FD8FF',
    Image: 'Changelog.png',
    Title: '<:seiaheh:1244128244664504392> **Yurizono Seia - Changelog v1.4.3**',
    Description: `<:SeiaSip:1244890166116618340> Chào các Sensei! Bản nhỏ **\`1.4.3\`** đây: nút bấm với menu giờ nằm gọn ngay trong khung tin nhắn của Seia, emoji gọn gàng hơn, và \`/howgay\` tính case đặc biệt chuẩn hơn~`,

    Sections: [
        {
            Name: '<a:ShirokoSparkle:1230151011205648504> Nút & menu nằm trong khung',
            Value: `▸ Tin nhắn có nút / menu vẫn trông y như embed cũ (viền màu, tên người dùng, tiêu đề, nội dung, ảnh, footer), chỉ khác là nút và menu nằm ngay bên trong khung (Components V2 của Discord)
▸ Áp dụng cho: \`/help\`, \`/background-list\`, \`/leaderboard\`, \`/quick-math-top\`, \`/game-2048-top\`, \`/game-2048\`, \`/howgay-stats\`, \`/omikuji-stats\`, \`/shiprate\`, \`/number-convert\`, \`/warn-list\`, \`/background-manage-list\`, các lệnh reset có nút xác nhận, \`/data-transfer\` và lúc chủ bot đăng \`/changelog\`
▸ Hết giờ thì nút / menu tự biến mất, nội dung vẫn giữ nguyên
-# Lệnh không có nút vẫn hiện embed như cũ nhé!`
        },
        {
            Name: '<:NoaNoted:1247028261847040050> Emoji gọn gàng hơn',
            Value: `▸ Bỏ hết emoji mặc định của Discord trong câu trả lời của Seia, thay bằng emoji riêng của server
▸ Top 3 bảng xếp hạng giờ là rank osu! <:RankX:1367507004058501341> <:RankS:1367506729545371788> <:RankA:1367506082892615760> thay cho huy chương
▸ Lá xăm \`/omikuji\` gọn hơn: bỏ icon ở tiêu đề, phần điềm báo thành danh sách ▸`
        },
        {
            Name: '<:imgay:1356678016348197047> /howgay',
            Value: `▸ Case đặc biệt giờ tính theo **1 chữ số thập phân đầu**, không làm tròn nữa: \`72.7\` = mọi kết quả từ \`72.7000%\` đến \`72.7999%\``
        }
    ],

    En: {
        Description: `<:SeiaSip:1244890166116618340> A small one, Sensei: **\`1.4.3\`**! Buttons and menus now sit right inside Seia's message box, the emojis are cleaner, and \`/howgay\` special cases are counted more precisely~`,
        Sections: [
            {
                Name: '<a:ShirokoSparkle:1230151011205648504> Buttons & menus inside the box',
                Value: `▸ Messages with buttons / menus still look just like the old embeds (colored edge, user name, title, text, image, footer), only the buttons and menus now sit inside the box (Discord's Components V2)
▸ For: \`/help\`, \`/background-list\`, \`/leaderboard\`, \`/quick-math-top\`, \`/game-2048-top\`, \`/game-2048\`, \`/howgay-stats\`, \`/omikuji-stats\`, \`/shiprate\`, \`/number-convert\`, \`/warn-list\`, \`/background-manage-list\`, the reset commands with a confirm button, \`/data-transfer\` and when the owners post \`/changelog\`
▸ When the time is up, the buttons / menus go away and the content stays
-# Commands without buttons still show embeds like before!`
            },
            {
                Name: '<:NoaNoted:1247028261847040050> Cleaner emojis',
                Value: `▸ No more default Discord emojis in Seia's answers, only the server's own emojis
▸ The top 3 of the leaderboards now get osu! ranks <:RankX:1367507004058501341> <:RankS:1367506729545371788> <:RankA:1367506082892615760> instead of medals
▸ \`/omikuji\` cards are cleaner: no icons in the titles, the omens are a ▸ list`
            },
            {
                Name: '<:imgay:1356678016348197047> /howgay',
                Value: `▸ Special cases now go by the **first decimal**, no rounding anymore: \`72.7\` = any result from \`72.7000%\` to \`72.7999%\``
            }
        ]
    }
}

module.exports = (Changelog)
