/*
Changelog of one version, posted by /changelog (one file per version: vX.Y.Z.js)
- Image: file in Assets/Misc (optional)
- Sections: embed fields, each Value must stay under 1024 characters
- En (optional): English version (Title / Description / Sections) for people reading /changelog in English.
  The announcement itself is always the Vietnamese one
*/
const Changelog = {
    Version: '1.4.0',
    Color: '#fff598',
    Image: 'Changelog.png',
    Title: '<:seiaheh:1244128244664504392> **Yurizono Seia - Changelog v1.4.0**',
    Description: `<:SeiaSip:1244890166116618340> Chào các Sensei! Bản **\`1.4.0\`** đã chính thức lên sóng, đây là toàn bộ những gì đã thay đổi nè~

### 💬 Lời nhắn từ chủ bot
> <:seiaheh:1244128244664504392> - *Well, sau một khoảng thời gian dài, cuối cùng cũng đã update cho mấy chế bản \`1.4.0\` đây, lưu ý là bản này trở đi là chỉ toàn instruction cho \`Claude Pro\`, nhưng logic cốt lõi vẫn quen thuộc đó thôi nhá, yên tâm, tui làm chủ được prompt mà nên nếu có bug thì có thể nhìn vào mà fix nhá =)))*`,

    Sections: [
        {
            Name: '<:SeiaSip:1244890166116618340> Toàn bộ code được viết lại',
            Value: `▸ Code gọn hơn, dễ bảo trì hơn, chạy ổn định trên điện thoại (Termux)
▸ Bot không còn sập khi gặp lỗi, tự kết nối lại khi rớt mạng hoặc mất database
▸ Lệnh bị lỗi sẽ báo cho Sensei, không còn "Seia đang suy nghĩ..." mãi mãi
▸ Dùng lệnh lần đầu là chạy luôn, hết câu "chưa có trong cooldown database"
▸ Cooldown và giờ reset theo đồng hồ của Discord, lệch giờ cũng không sao (chủ yếu vấn đề là ở local time trên máy)
-# Lưu ý: Cái này tui chưa kiểm chứng cụ thể ở phần dùng lệnh lần đầu, nên chưa rõ nhá!`
        },
        {
            Name: '<:SeiaDespair:1250768714639474791> `/howgay`',
            Value: `▸ Kết quả có đủ 4 chữ số thập phân: \`0.0000%\` → \`101.0000%\`
▸ Các case đặc biệt (WYSI \`72.7\`, Error \`404\`...) giờ đã **thật sự** xuất hiện được, trước đây bị lỗi nên chưa từng hiện lần nào lmao (cái này test trước đó vẫn bình thường, mà kệ, debug sớm luôn)
▸ \`/howgay-stats\`: thống kê server chia 2 trang (\`Bình Thường / Đặc Biệt\`), thống kê người dùng tính trên **100** lần gần nhất
▸ Dữ liệu cũ đã được chuyển sang hết, không mất gì đâu`
        },
        {
            Name: '<:seiaheh:1244128244664504392> Ranking',
            Value: `▸ \`/rank\` hiện đúng thứ hạng (trước đây ai cũng \`#1\` lol), xếp theo tổng EXP trong từng server, bằng điểm thì đồng hạng
▸ EXP chỉ tính khi chat ở **Server Lobby**, **LazyTown**, **Voice** và **PCB HQ**
▸ Role theo mốc **Level 4 → 48** (lên mốc mới thì gỡ role mốc cũ) + role **vĩnh viễn** khi đạt **10000** tổng EXP
▸ Thông báo lên level có thêm dòng \`> Granted @user role - @role\`
▸ Hỗ trợ thêm server thứ 2 với ranking và kênh level up riêng
▸ Background rank card tính theo từng server, \`/background-list\` hiện thêm bộ sưu tập của card
-# Cái Role Ranking này chỉ áp dụng cho Server \`LazyGang\`, còn exp nhận được thì toàn bộ đều đúng nhé!`
        },
        {
            Name: '<:SeiaConfused:1244890143333158932> `/quick-math`',
            Value: `▸ Cân bằng lại toàn bộ độ khó:
> **Easy**: chỉ số dương, nhân chia trong bảng cửu chương
> **Normal → Lunatic**: số nguyên, có số âm, phép chia luôn chia hết
> **Extra, Phantasm**: cộng trừ số thập phân, nhân chia số nguyên (có âm)
> **Asian**: không giới hạn, vẫn là Asian thôi =)))
▸ Mọi kết quả nằm trong khoảng \`±99999.99\`, từ level 10 trở đi không khó thêm nữa
▸ Trả lời \`3,75\` hay \`3.75\` đều được, thời gian giải không còn bị âm (cái này do thời gian local trên máy)
-# Nói thật, cái này không biết là nên nói là buff hay là nerf lại độ khó nữa, cảm giác nó khó hơn rất nhiều (maybe, có lẽ tui có vấn đề kĩ năng lol)`
        },
        {
            Name: '<:SeiaSmug:1250768503431233616> `/game-2048`',
            Value: `▸ Mỗi người chơi một bàn riêng (trước đây chơi cùng lúc là dính bàn của nhau...)
▸ Hết nước đi là kết thúc ván, Undo được 1 lần sau mỗi nước
▸ Chế độ Swap đổi chỗ đúng 2 ô có số
▸ Lưu kỷ lục của từng chế độ
-# Lưu ý: Cái này tui chưa kiểm chứng cụ thể, nên chưa rõ nhá!`
        },
        {
            Name: '<:SeiaPeek:1244890461592621147> Bảng xếp hạng mới',
            Value: `▸ \`/quick-math-top\`: bảng xếp hạng theo từng độ khó
▸ \`/game-2048-top\`: bảng xếp hạng theo từng chế độ
▸ Phá kỷ lục sẽ có thông báo 🏆 ở cuối ván
-# Lưu ý: Cái này tui chưa kiểm chứng cụ thể, nên chưa rõ nhá!`
        },
        {
            Name: '<:seiaconcerned:1244128341540208793> `/omikuji`',
            Value: `▸ Sửa lỗi bot sập khi bốc trúng SS / EX bằng tiếng Việt
▸ Sửa lỗi bốc lại được liên tục sau 22:00 UTC
-# Cái này chỉ áp dụng cho Server \`LazyGang\` btw`
        },
        {
            Name: '<:seiaehem:1244128370669650060> Log & quản lý server',
            Value: `▸ Log sửa tin nhắn chỉ ghi khi **thật sự** có sửa (hết spam vì preview link, ghim tin...)
▸ Log xoá tin nhắn: không còn lỗi với tin dài, ghi cả tin chỉ có ảnh
▸ Chuyển link X / Facebook có thêm dòng **Context** (nội dung tin nhắn), không ping ai
▸ Chặn link mời server khác: link hỏng không còn làm bot sập
-# Cái này chỉ áp dụng cho Server \`LazyGang\` btw`
        },
        {
            Name: '<:SeiaMuted:1244890584276008970> Sửa lỗi khác',
            Value: `▸ Tin chào mừng không còn lỗi với người không có avatar
▸ Sửa \`/avatar\` (banner) và \`/random-user\` (khi không ai online)
▸ \`/howgay-stats\`, \`/omikuji-stats\`: người khác không bấm vào menu của Sensei được nữa
-# Riêng \`/omikuji-stats\` này chỉ áp dụng cho Server \`LazyGang\` btw`
        }
    ],

    En: {
        Description: `<:SeiaSip:1244890166116618340> Hello Sensei! Version **\`1.4.0\`** is officially out, here is everything that changed~

### 💬 A message from the bot owner
> <:seiaheh:1244128244664504392> - *Well, after a looong time, here is finally the \`1.4.0\` update. From this version on, everything is written with \`Claude Pro\` instructions, but the core logic is the same one you know, don't worry. I'm in control of the prompts, so if there's a bug I can look at it and fix it =)))*`,
        Sections: [
            {
                Name: '<:SeiaSip:1244890166116618340> Rewritten codebase',
                Value: `▸ Cleaner code that is easier to maintain and runs reliably on a phone (Termux)
▸ The bot no longer crashes on errors, and reconnects by itself when the network or the database drops
▸ A command that fails now tells you so, instead of "Seia is thinking..." forever
▸ Using a command for the first time runs it right away (no more "not in the cooldown database yet")
▸ Cooldowns and daily resets follow Discord's clock, so a wrong clock doesn't matter (the problem was mostly the local time on the machine)
-# Note: I haven't fully checked the first-time-use part yet, so not sure!`
            },
            {
                Name: '<:SeiaDespair:1250768714639474791> `/howgay`',
                Value: `▸ Results now have 4 decimals: \`0.0000%\` → \`101.0000%\`
▸ Special cases (WYSI \`72.7\`, Error \`404\`...) can **actually** show up now, a bug meant they never appeared before lmao (it tested fine back then, but whatever, debugged early)
▸ \`/howgay-stats\`: server stats in 2 pages (\`Normal / Special\`), user stats based on the last **100** checks
▸ Old data was moved over, nothing was lost`
            },
            {
                Name: '<:seiaheh:1244128244664504392> Ranking',
                Value: `▸ \`/rank\` shows the right position (everyone used to be \`#1\` lol), ranked by total EXP per server, same EXP = same rank
▸ EXP only counts in **Server Lobby**, **LazyTown**, **Voice** and **PCB HQ**
▸ Milestone roles from **Level 4 → 48** (the previous milestone role is removed) + a **permanent** role at **10000** total EXP
▸ Level up messages show \`> Granted @user role - @role\`
▸ Support for a 2nd server with its own ranking and level up channel
▸ Rank card backgrounds are per server, \`/background-list\` also shows the card's collection
-# The ranking roles only apply to the \`LazyGang\` server, but the EXP you get is right everywhere!`
            },
            {
                Name: '<:SeiaConfused:1244890143333158932> `/quick-math`',
                Value: `▸ Every difficulty was rebalanced:
> **Easy**: positive numbers only, × ÷ within the times tables
> **Normal → Lunatic**: integers, negative numbers, divisions always exact
> **Extra, Phantasm**: + − with decimals, × ÷ with (negative) integers
> **Asian**: no limits, still Asian =)))
▸ Every result stays within \`±99999.99\`, nothing gets harder after level 10
▸ \`3,75\` or \`3.75\` both work, and the solving time can't be negative anymore (that came from the local time on the machine)
-# Honestly, I don't know if this is a buff or a nerf, it feels way harder (maybe I just have a skill issue lol)`
            },
            {
                Name: '<:SeiaSmug:1250768503431233616> `/game-2048`',
                Value: `▸ Every player has their own board (players used to share one when playing at the same time...)
▸ The game ends when no moves are left, you can undo once after each move
▸ Swap mode swaps 2 real tiles
▸ Best scores are saved for every mode
-# Note: I haven't fully checked this one yet, so not sure!`
            },
            {
                Name: '<:SeiaPeek:1244890461592621147> New leaderboards',
                Value: `▸ \`/quick-math-top\`: leaderboard for each difficulty
▸ \`/game-2048-top\`: leaderboard for each mode
▸ Beating your best score shows a 🏆 message at the end of the game
-# Note: I haven't fully checked this one yet, so not sure!`
            },
            {
                Name: '<:seiaconcerned:1244128341540208793> `/omikuji`',
                Value: `▸ Fixed a crash when drawing an SS / EX card in Vietnamese
▸ Fixed being able to draw again and again after 22:00 UTC
-# This only applies to the \`LazyGang\` server btw`
            },
            {
                Name: '<:seiaehem:1244128370669650060> Logs & moderation',
                Value: `▸ The edit log only reports **real** edits (no more spam from link previews, pins...)
▸ The delete log no longer fails on long messages, and logs image-only messages too
▸ Converted X / Facebook links get a **Context** line (the rest of the message) and never ping anyone
▸ Invite blocker: broken invite links no longer crash the bot
-# This only applies to the \`LazyGang\` server btw`
            },
            {
                Name: '<:SeiaMuted:1244890584276008970> Other fixes',
                Value: `▸ Welcome messages work for users without an avatar
▸ Fixed \`/avatar\` (banners) and \`/random-user\` (when nobody is online)
▸ \`/howgay-stats\`, \`/omikuji-stats\`: other people can't click your menu anymore
-# \`/omikuji-stats\` only applies to the \`LazyGang\` server btw`
            }
        ]
    }
}

module.exports = (Changelog)
