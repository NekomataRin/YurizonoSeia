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
    Description: `<:SeiaSip:1244890166116618340> Chào các Sensei! Bản nhỏ **\`1.4.3\`** đây: nút bấm với menu giờ nằm gọn ngay trong khung tin nhắn của Seia, không còn lơ lửng bên dưới nữa~`,

    Sections: [
        {
            Name: '<a:ShirokoSparkle:1230151011205648504> Nút & menu nằm trong khung',
            Value: `▸ Tin nhắn có nút / menu giờ là một khung có viền màu như embed, nút và menu nằm ngay bên trong khung (Components V2 của Discord)
▸ Áp dụng cho: \`/help\`, \`/background-list\`, \`/leaderboard\`, \`/quick-math-top\`, \`/game-2048-top\`, \`/game-2048\`, \`/howgay-stats\`, \`/omikuji-stats\`, \`/shiprate\`, \`/number-convert\`, \`/warn-list\`, \`/background-manage-list\`, các lệnh reset có nút xác nhận, \`/data-transfer\` và lúc chủ bot đăng \`/changelog\`
▸ Hết giờ thì nút / menu tự biến mất, nội dung vẫn giữ nguyên
-# Lệnh không có nút vẫn hiện embed như cũ nhé!`
        }
    ],

    En: {
        Description: `<:SeiaSip:1244890166116618340> A small one, Sensei: **\`1.4.3\`**! Buttons and menus now sit right inside Seia's message box instead of floating under it~`,
        Sections: [
            {
                Name: '<a:ShirokoSparkle:1230151011205648504> Buttons & menus inside the box',
                Value: `▸ Messages with buttons / menus are now one box with a colored edge like an embed, and the buttons and menus sit inside it (Discord's Components V2)
▸ For: \`/help\`, \`/background-list\`, \`/leaderboard\`, \`/quick-math-top\`, \`/game-2048-top\`, \`/game-2048\`, \`/howgay-stats\`, \`/omikuji-stats\`, \`/shiprate\`, \`/number-convert\`, \`/warn-list\`, \`/background-manage-list\`, the reset commands with a confirm button, \`/data-transfer\` and when the owners post \`/changelog\`
▸ When the time is up, the buttons / menus go away and the content stays
-# Commands without buttons still show embeds like before!`
            }
        ]
    }
}

module.exports = (Changelog)
