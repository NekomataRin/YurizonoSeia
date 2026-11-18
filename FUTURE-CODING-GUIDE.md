# Hướng dẫn code Yurizono Seia (tự code tay)

> Dùng chung cho mọi phiên bản. Đọc phần 1 → 3 một lần cho nắm luồng, sau đó tra phần cần làm như tra công thức.
> Tên lệnh, ID, emoji trong file chỉ là **ví dụ** lấy từ code lúc viết; nguồn chuẩn luôn là code. Khi đổi một **quy ước** (cách đặt tên, cách phân quyền, cấu trúc thư mục...), sửa luôn file này.
> File `CLAUDE.md` có bản tóm tắt kỹ thuật (tiếng Anh) cho Claude Code, file này là bản dễ đọc cho người.

## Mục lục
1. [Bot chạy thế nào](#1-bot-chạy-thế-nào)
2. [Mỗi thư mục để làm gì](#2-mỗi-thư-mục-để-làm-gì)
3. [Quy ước code](#3-quy-ước-code)
4. [Thêm một lệnh mới](#4-thêm-một-lệnh-mới)
5. [Quyền dùng lệnh](#5-quyền-dùng-lệnh)
6. [Nút bấm, menu, phân trang, modal](#6-nút-bấm-menu-phân-trang-modal)
7. [Thêm một event](#7-thêm-một-event)
8. [Database: model, dữ liệu theo server, migration](#8-database-model-dữ-liệu-theo-server-migration)
9. [Config và ID Discord](#9-config-và-id-discord)
10. [Rank card](#10-rank-card)
11. [Dữ liệu game: howgay, omikuji, quick-math, 2048](#11-dữ-liệu-game-howgay-omikuji-quick-math-2048)
12. [Emoji](#12-emoji)
13. [Ra phiên bản mới](#13-ra-phiên-bản-mới)
14. [Giới hạn của Discord hay đụng phải](#14-giới-hạn-của-discord-hay-đụng-phải)
15. [Kiểm tra trước khi chạy thật](#15-kiểm-tra-trước-khi-chạy-thật)
16. [Lỗi hay gặp](#16-lỗi-hay-gặp)
17. [Checklist nhanh](#17-checklist-nhanh)

---

## 1. Bot chạy thế nào

```
npm start  (= node index.js)
  1. Nạp lệnh + event                     -> mọi file trong Commands/<Nhóm>/ và Events/<tên event>/
  2. Kết nối MongoDB (MONGO_URL)          -> rớt mạng thì thử lại mỗi 10 giây
  3. Database/migrate.js                  -> chạy các bước dọn dữ liệu 1 lần + tạo index cho mọi model đã nạp
  4. Đăng ký lệnh GLOBAL với Discord       -> commandHandler.js RegisterCommands
  5. Đăng nhập Discord (TOKEN)            -> lỗi mạng thì thử lại, TOKEN sai thì tắt
```

- **Lệnh được đăng ký lại mỗi lần khởi động** (ghi đè toàn bộ). Đổi tên / xoá lệnh thì lệnh cũ tự biến mất khỏi Discord, không cần làm gì thêm. Lệnh global có thể mất vài phút mới hiện.
- **Bot không bao giờ chết vì lỗi**: lỗi trong lệnh → Seia báo lỗi cho người dùng; lỗi trong event → chỉ ghi log, các file event khác vẫn chạy.
- `.env` (không commit): `TOKEN`, `CLIENT_ID`, `MONGO_URL`, `GUILD_ID` (= Lazy Gang), `DEBUG=true` (tuỳ chọn, hiện log debug).
- Bot chạy trên **điện thoại (Termux, Linux)**: tên file **phân biệt hoa thường**. `require('./Embed')` chạy được trên Windows nhưng **chết trên Termux** nếu file tên `embed.js`.

---

## 2. Mỗi thư mục để làm gì

| Thư mục | Chứa gì | Ghi chú |
|---|---|---|
| `Commands/<Nhóm>/` | Mỗi file = 1 slash command | Tên thư mục = nhóm trong `/help` (Fun, Misc, Server, Ranking, Utils, Moderation). Thư mục mới tự thành nhóm mới |
| `Events/<tên event>/` | Code chạy khi có sự kiện Discord | Tên thư mục **đúng tên event của discord.js** (`messageCreate`, `clientReady`, `guildMemberAdd`...) |
| `Functions/` | Logic dùng chung của lệnh (canvas, game, quyền mod...) | Lệnh mỏng, logic nặng để ở đây |
| `Utils/` | Helper nhỏ + config | `embed`, `language`, `cooldown`, `clock`, `config`, `owners`... |
| `Database/` | Model Mongoose + migrate | Chia thư mục giống Commands |
| `Assets/` | Dữ liệu + ảnh: rank card, changelog, câu chữ game | **Câu chữ / emoji trong Assets là "asset"**, sửa thoải mái mà không đụng code |
| `Handlers/` | Bộ nạp lệnh / event | Hầu như không cần sửa |

---

## 3. Quy ước code

### Kiểu viết
- **Không dấu chấm phẩy**, thụt lề **4 dấu cách**, chuỗi dùng **nháy đơn** `'...'` (cần chèn biến thì dùng `` `...${x}` ``).
- Tên hàm / hằng tự viết: **PascalCase** (`SeiaEmbed`, `GetLanguage`, `RankCards`). Biến tạm thì tuỳ (`vi`, `user`, `data`...).
- Comment ngắn bằng tiếng Anh, nói **tại sao**, không kể lại code.
- Không rải ID Discord trong code: ID channel / role để ở `Utils/config.js` (xem [phần 9](#9-config-và-id-discord)).

### Song ngữ + xưng hô
- Mọi lệnh có tiếng Việt và tiếng Anh. Lấy ngôn ngữ của người dùng bằng `GetLanguage`, rồi chọn câu:
  ```js
  const vi = (LangKey === 'vi')
  vi ? 'Câu tiếng Việt' : 'English sentence'
  ```
- **Seia xưng "em", gọi người dùng là "Sensei"**. Không dùng "tớ / cậu / bạn / bro" trong câu Seia trả lời.
  - Ngoại lệ: **mô tả lệnh / option** (chữ giao diện Discord) được viết "bạn": `'Người dùng bạn muốn kick'`.
  - Câu chữ trong `Assets/` (howgay, shiprate...) là nội dung game, giữ phong cách riêng của nó.
- Tiếng Anh viết tự nhiên, không dịch từng chữ.

### Thời gian
- Dùng `Clock.Now()` (từ `Utils/clock.js`) thay cho `Date.now()` với **mọi thứ lưu vào database hoặc so với thời gian Discord** (cooldown, hết hạn, ngày reset...). Đồng hồ điện thoại có thể sai.
- Hiển thị thời gian cho người dùng: `` `<t:${Math.floor(ms / 1000)}:R>` `` (Discord tự đổi sang giờ của từng người).

### Log
```js
const Log = require('../../Utils/logger')
Log.Info('...')      // xanh
Log.Warn('...')      // vàng
Log.Error('...', err) // đỏ
Log.Debug('...')     // chỉ hiện khi DEBUG=true
```

---

## 4. Thêm một lệnh mới

### 4.1 Mẫu đầy đủ

Tạo `Commands/Fun/hello.js` (đổi `Fun` thành nhóm phù hợp):

```js
const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')                                   // chữ thường, dùng gạch ngang, tối đa 32 ký tự
        .setDescription('Say hello to someone')             // tiếng Anh, tối đa 100 ký tự
        .setDescriptionLocalizations({ vi: 'Chào một người dùng' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who to greet - Default: you')
                .setDescriptionLocalizations({ vi: 'Chào ai - Mặc định: bạn' })
                .setRequired(false)),

    async execute(interaction) {
        // 1. Báo Discord "đang xử lý" NGAY (Discord chỉ chờ 3 giây)
        await interaction.deferReply()

        // 2. Ngôn ngữ (người chưa chọn ngôn ngữ đã được nhắc, chỉ cần return)
        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        // 3. Cooldown 10 giây (true = đang cooldown, Seia đã trả lời rồi)
        if (await OnCooldown(interaction, 'Hello', LangKey, 10000)) return

        // 4. Làm việc + trả lời bằng editReply (vì đã defer)
        const user = interaction.options.getUser('user') || interaction.user
        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'Blurple')
                .setTitle('<:seiaheh:1244128244664504392> **Hello!**')
                .setDescription(vi ? `Em chào ${user} nha~` : `Hello ${user}~`)]
        })
    }
}
```

Khởi động lại bot là xong: lệnh tự được đăng ký, tự hiện trong `/help` đúng nhóm.

### 4.2 Các loại option

```js
.addStringOption(o => o.setName('text').setDescription('...').setDescriptionLocalizations({ vi: '...' }).setMaxLength(400))
.addIntegerOption(o => o.setName('amount').setDescription('...').setDescriptionLocalizations({ vi: '...' }).setMinValue(1).setMaxValue(10))
.addBooleanOption(o => o.setName('status').setDescription('...').setDescriptionLocalizations({ vi: '...' }))
.addUserOption(o => o.setName('user').setDescription('...').setDescriptionLocalizations({ vi: '...' }))
.addChannelOption(o => o.setName('channel').setDescription('...').setDescriptionLocalizations({ vi: '...' }))
```

Đọc giá trị: `interaction.options.getString('text')`, `getInteger`, `getBoolean`, `getUser`, `getMember`, `getChannel`. Option không bắt buộc mà người dùng bỏ trống → `null`.

**Lựa chọn cố định (choices)**, tên tiếng Việt dùng `name_localizations`:
```js
.addStringOption(o => o.setName('method').setDescription('...').setDescriptionLocalizations({ vi: '...' })
    .addChoices(
        { name: '[Add]', value: 'add', name_localizations: { vi: '[Add] Thêm vào' } },
        { name: '[Remove]', value: 'remove', name_localizations: { vi: '[Remove] Gỡ ra' } }
    ))
```

**Gợi ý tự động (autocomplete)**: thêm `.setAutocomplete(true)` vào option, rồi thêm hàm `autocomplete` vào module:
```js
async autocomplete(interaction) {
    const q = interaction.options.getFocused().toLowerCase()
    const list = MyList.filter(x => x.includes(q)).slice(0, 25)      // tối đa 25 gợi ý
    await interaction.respond(list.map(x => ({ name: x, value: x })))
},
```
Lưu ý: gợi ý chỉ là gợi ý, người dùng vẫn gõ được chữ bất kỳ, nên **trong `execute` phải kiểm tra lại** giá trị hợp lệ.

### 4.3 Cách trả lời

| Tình huống | Cách làm |
|---|---|
| Bình thường | `await interaction.deferReply()` đầu tiên → sau đó `interaction.editReply({...})` |
| Chỉ người dùng thấy | `await interaction.deferReply({ flags: MessageFlags.Ephemeral })` (import `MessageFlags` từ discord.js) |
| Lệnh mở form (modal) | **Không defer**: `showModal` phải là câu trả lời đầu tiên. Xem `/announcement` |
| Gửi thêm tin nhắn | `interaction.followUp({...})` |
| Gửi ảnh | `files: [new AttachmentBuilder(pathOrBuffer, { name: 'card.png' })]` + trong embed `.setImage('attachment://card.png')` |

- `SeiaEmbed(interaction, color)` tạo embed có sẵn author (người dùng lệnh) + giờ + footer của Seia. Màu: tên (`'Red'`, `'Blurple'`, `'DarkAqua'`...) hoặc mã `'#ff94fa'`.
- Văn bản dài có thể vượt giới hạn embed → bọc bằng `Cut(text, 4096)` (mô tả) hoặc `Cut(text, 1024)` (field), lấy từ `Utils/embed`.

### 4.4 Thêm cooldown cho lệnh mới
1. Thêm một field vào `Database/cooldown.js`, ví dụ `Hello: String,` (đặt đúng nhóm cho dễ tìm).
2. Trong lệnh: `if (await OnCooldown(interaction, 'Hello', LangKey, 10000)) return`.
   - Muốn chỉ tính cooldown khi lệnh chạy xong (ví dụ game): gọi `OnCooldown(interaction, 'Hello', LangKey)` (không có số), rồi cuối lệnh `await SetCooldown(interaction.user.id, 'Hello', Clock.Now() + 10000)`.
3. Thêm vào danh sách `Commands` trong `Commands/Misc/check-cooldown.js`: `['Hello', '/hello']`, để `/check-cooldown` hiện ra.

### 4.5 Đổi tên / xoá lệnh
- Đổi `.setName(...)` + đổi tên file cho khớp (không bắt buộc nhưng dễ tìm). Lần khởi động sau lệnh cũ tự biến mất.
- Tìm mọi chỗ nhắc tên cũ: `/help` tự cập nhật, nhưng câu chữ trong lệnh khác, changelog, README thì phải tự sửa. Tìm nhanh bằng VS Code: `Ctrl+Shift+F` gõ `/ten-cu`.
- Quy ước tên: lệnh cùng nhóm **chung tiền tố** để đứng cạnh nhau khi gõ `/` (vd `/background-...`, `/exp-...`), bản cho staff thêm `manage` / `reset`. Đổi tên lệnh người dùng đã quen thì ghi rõ "tên cũ → tên mới" trong changelog.

---

## 5. Quyền dùng lệnh

### 5.1 Nhãn trong mô tả
Mô tả lệnh (cả tiếng Anh lẫn tiếng Việt) **bắt đầu bằng nhãn**. `/help` đọc nhãn này để xếp lệnh vào đúng phần, rồi tự bỏ nhãn khỏi mô tả:

| Nhãn | Ai dùng | Code kiểm tra | Phần trong `/help` |
|---|---|---|---|
| (không có) | Mọi người | — | 👥 Mọi người |
| `-Mod Only-` | Role Mod của server (owner cũng phải có role Mod) | `RequireMod(interaction, LangKey)` | 🛡️ Mod |
| `-Mod/Owner Only-` | Role Mod **hoặc** chủ bot | `RequireMod(interaction, LangKey, true)` | 🛡️ Mod / Owner |
| `-Owner Only-` | Chủ bot (`Utils/owners.js`) | `RequireOwner(interaction, LangKey)` | 👑 Owner |
| `-NekoRin's Only-` | 2 acc đầu trong `owners.js` | `BotOwner.slice(0, 2).includes(id)` | 👑 Owner (ghi chú NekoRin) |

```js
const { RequireMod, RequireOwner } = require('../../Functions/Moderation/mod')

// Sau GetLanguage:
if (!await RequireMod(interaction, LangKey, true)) return   // Mod hoặc owner
if (!await RequireOwner(interaction, LangKey)) return       // chỉ owner
```
Cả hai tự trả lời "Không đủ thẩm quyền" và chạy được cả trước lẫn sau `deferReply`.

### 5.2 Cách phân quyền
- Lệnh quản lí (ban, kick, warn... trong `Commands/Moderation`) mặc định **chỉ Mod**. Ngoại lệ nào thì ghi nhãn khác trong mô tả.
- Lệnh can thiệp ranking / bảng điểm (reset bảng, trao card, chuyển dữ liệu...) thường là **Mod hoặc owner**.
- Việc chỉ chủ bot quyết (vd cấm dùng lệnh, phạt EXP) là **chỉ owner**.
- Muốn biết lệnh nào đang thuộc loại nào: mở `/help` (mỗi nhóm chia sẵn theo quyền), hoặc đọc nhãn đầu mô tả trong file lệnh.
- **Đổi quyền một lệnh = sửa cả 2 chỗ**: nhãn trong mô tả (tiếng Anh + tiếng Việt) và hàm kiểm tra trong `execute`.
- Role Mod của mỗi server khai báo trong `Utils/config.js` → `Roles[guildId].Mod`.

### 5.3 Lệnh xử lý một người khác (ban, warn...)
Dùng `TargetProblem` để từ chối các trường hợp không được xử lý (chính mình, Seia, bot, chủ server, Mod khác, người có role cao hơn Seia):
```js
const { TargetProblem, ModE } = require('../../Functions/Moderation/mod')

const member = await interaction.guild.members.fetch(target.id).catch(() => null)
const problem = TargetProblem(interaction, target, member, LangKey, 'bannable')   // 'kickable' / 'moderatable' / bỏ trống
if (problem) return interaction.editReply({ embeds: [Embed('Green', `${ModE.Doi} | ${problem}`)] })
```
Ghi log hành động vào kênh ModLog của server: `ModLog(interaction, 'Red', LogText(vi, Emoji, 'Ban', [dòng 1, dòng 2...]))`. Lý do ghi vào audit log của Discord: `AuditReason(interaction, reason)`.

---

## 6. Nút bấm, menu, phân trang, modal

### 6.0 Luật Components V2 (nút / menu nằm TRONG khung)
Tin nhắn nào có nút hoặc menu thì gửi dạng **Components V2**: một khung (container) viền màu giống embed, nút / menu nằm bên trong khung. Không cần tự dựng container: cứ tạo embed bằng `SeiaEmbed` + hàng nút như bình thường, rồi bọc cả payload bằng `V2(...)`:
```js
const { V2 } = require('../../Utils/container')

await interaction.editReply(V2({ embeds: [MyEmbed], components: [Row] }))   // có nút
await i.update(V2({ embeds: [Result] }))                                     // bước sau, không còn nút
```
`V2` vẽ khung **giống hệt bố cục embed truyền thống**, chỉ thêm nút / menu vào trong: màu embed → viền màu; khối đầu = tên người dùng (chữ nhỏ) + tiêu đề in đậm + nội dung (thumbnail nằm bên phải như embed); field = tên in đậm + giá trị; ảnh lớn bên dưới; footer chữ nhỏ kèm giờ; hàng nút / menu ở đáy khung. Khung V2 không vẽ được icon nhỏ cạnh tên / footer, nên footer dùng một emoji Seia nhỏ thay icon.

**3 luật bắt buộc** (Discord kiểm tra, sai là lỗi `Invalid Form Body`):
1. **Tin đã gửi dạng V2 thì MỌI lần sửa sau của chính tin đó cũng phải qua `V2(...)`**: `i.update`, `editReply` kết quả, lần sửa xoá nút khi hết giờ... Không được quay lại `{ embeds }` thường.
2. Tin V2 **không có `content` / `embeds`** riêng (để `V2` lo).
3. Tổng chữ trong một tin V2 tối đa **4000 ký tự** (tính cả tiêu đề, footer). `V2` tự cắt bớt cho vừa, nhưng trang dài nên tự chia trước (vd `/help` chia trang ở 3500).

Hết giờ thì **không** gửi `{ components: [] }` (tin V2 rỗng là lỗi), mà gửi lại nội dung cũ không kèm nút: `interaction.editReply(V2({ embeds: [LastEmbed] }))`.
Tin không có nút / menu thì vẫn dùng embed thường như cũ.

### 6.1 Đợi 1 lần bấm (xác nhận Có/Không)
Có sẵn helper `Confirm`, hiện 2 nút [Đồng ý] [Giữ lại] trong khung V2:
```js
const { Confirm } = require('../../Functions/Server/confirm')
const { V2 } = require('../../Utils/container')

const choice = await Confirm(interaction, LangKey, EmbedHoiXacNhan, EmbedKhiHuy)
if (!choice) return                                   // bấm "Giữ lại" hoặc hết 60 giây (đã tự hiện EmbedKhiHuy)
await choice.update(V2({ embeds: [DangXuLy] }))       // bấm "Đồng ý": tin đã là V2, nên mọi bước sau cũng V2
await interaction.editReply(V2({ embeds: [KetQua] }))
```

### 6.2 Đợi nhiều lần bấm (menu, game)
```js
const { V2 } = require('../../Utils/container')

const Render = (rows = true) => V2({ embeds: [MyEmbed], components: (rows) ? [Row] : [] })
const message = await interaction.editReply(Render())
const collector = message.createMessageComponentCollector({
    filter: i => i.user.id === interaction.user.id,   // chỉ người dùng lệnh mới bấm được
    time: 5 * 60 * 1000                               // 5 phút
})
collector.on('collect', async (i) => {
    // i.customId = id của nút / menu, i.values[0] = lựa chọn của menu
    await i.update(Render()).catch(() => {})
})
collector.on('end', () => interaction.editReply(Render(false)).catch(() => {}))   // hết giờ: giữ nội dung, bỏ nút
```
- Nút: `new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Secondary)`, emoji: `.setEmoji('1086297678624854077')` (chỉ ID).
- Menu: `new StringSelectMenuBuilder().setCustomId('pick').setPlaceholder('...').addOptions({ label, description, value, emoji: '<:ten:id>', default: true/false })`.
- Mỗi hàng (`ActionRowBuilder`) chứa tối đa **5 nút** hoặc **1 menu**; tối đa **5 hàng**; menu tối đa **25 lựa chọn** (nhiều hơn thì chia nhóm, xem `/background-list`).
- Token của lệnh hết hạn sau **15 phút**: game dài phải chuyển sang `message.edit(...)` thay vì `interaction.editReply(...)`.

### 6.3 Phân trang có sẵn
Có sẵn mảng embed → `SendPages` lo nút ◀ ▶ (tự gửi dạng V2, tự bỏ nút khi hết giờ):
```js
const { SendPages } = require('../../Utils/pages')
await SendPages(interaction, Embeds, (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} |`)
```
Bảng xếp hạng (10 người / trang, huy chương top 3, hạng của người xem) dùng `LeaderboardPages` trong `Functions/Fun/leaderboard.js`, xem `/leaderboard` làm mẫu.

### 6.4 Modal (form nhập)
Xem `Commands/Moderation/announcement.js`. Điểm chính: **không `deferReply`**, gọi `GetLanguage` và kiểm tra quyền trước, rồi `interaction.showModal(modal)` và `interaction.awaitModalSubmit({ time, filter })`.

---

## 7. Thêm một event

Tạo `Events/<tên event discord.js>/<ten-file>.js`:
```js
// Events/messageCreate/hello-reply.js
module.exports = async (client, message) => {
    if (message.author.bot || !message.inGuild()) return
    if (message.content.toLowerCase() !== 'hello seia') return
    await message.reply({ content: 'Em chào Sensei~', allowedMentions: { repliedUser: false } }).catch(() => {})
}
```
- Tham số sau `client` đúng như discord.js đưa: `messageCreate(message)`, `messageUpdate(oldMessage, newMessage)`, `guildMemberAdd(member)`, `interactionCreate(interaction)`...
- Các file cùng một event chạy **lần lượt theo tên A → Z**. File lỗi không làm hỏng file khác.
- Event "bot đã sẵn sàng" là `clientReady` (không dùng `ready`, đã cũ).
- Event chạy với **mọi tin nhắn** → luôn thoát sớm (`return`) khi không liên quan, và đừng gọi database nếu không cần.
- Khi gửi tin nhắn có tag người khác mà không muốn ping: `allowedMentions: { parse: [] }`.
- Muốn biết người gửi dùng ngôn ngữ gì (không có interaction): `await SavedLanguage(userId).catch(() => null)`.

---

## 8. Database: model, dữ liệu theo server, migration

### 8.1 Tạo model mới
```js
// Database/Fun/hello.js
const { model, Schema } = require('mongoose')

// Số lần chào của một người trên một server
const Hello = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    Count: { type: Number, default: 0 }
})
Hello.index({ GuildID: 1, UserID: 1 }, { unique: true })   // 1 document / người / server

module.exports = model('Hello', Hello)
```
- **ID Discord luôn lưu dạng chuỗi (String)**. Lưu dạng Number sẽ bị sai số với ID 18-19 chữ số (Seia từng dính lỗi này).
- Dữ liệu nào khác nhau giữa các server thì **luôn có `GuildID`** (rank, card, cảnh cáo...). Index được tạo lúc khởi động (`migrate.js` gọi `createIndexes()` cho mọi model đã được `require` bởi một lệnh / event), không cần làm gì thêm.
- Tên collection: Mongoose tự đổi `Hello` → `hellos`. Tên kết thúc bằng số thì **không** thêm s (`Game2048` → `game2048`). Cần tên thật thì dùng `Hello.collection.name`.

### 8.2 Ghi dữ liệu an toàn
```js
// Cộng 1 (tạo mới nếu chưa có), không đọc-rồi-ghi nên 2 người bấm cùng lúc không mất số
await Hello.updateOne({ GuildID, UserID }, { $inc: { Count: 1 } }, { upsert: true })

// Đọc nhanh (chỉ đọc, không sửa): thêm .lean()
const data = await Hello.findOne({ GuildID, UserID }).lean()
```
Hay dùng: `$set` (gán), `$inc` (cộng), `$push` (thêm vào mảng), `$addToSet` (thêm nếu chưa có), `$pull` (gỡ khỏi mảng), `$setOnInsert` (chỉ gán khi tạo mới).

### 8.3 Migration (sửa dữ liệu cũ 1 lần)
Khi đổi cấu trúc dữ liệu (vd thêm `GuildID` cho dữ liệu cũ), thêm một bước vào cuối `Steps` trong `Database/migrate.js`:
```js
const Steps = [
    // ...các bước cũ, KHÔNG sửa / xoá
    // Mô tả ngắn bước này làm gì
    { Key: 'vN-YYYY-MM-hello-guilds', Run: MigrateVN }    // N = số kế tiếp sau bước cuối cùng, YYYY-MM = tháng viết
]

async function MigrateVN() {
    const res = await Hello.updateMany({ GuildID: { $exists: false } }, { $set: { GuildID: process.env.GUILD_ID } })
    return { hello: res.modifiedCount }    // số liệu này được ghi vào log + collection seiameta
}
```
- Mỗi bước chạy **đến khi thành công 1 lần** (đánh dấu bằng `Key` trong collection `seiameta`). Lỗi thì lần khởi động sau thử lại.
- `Key` không bao giờ đổi. Collection cũ chỉ đọc, **không xoá**.

### 8.4 Database rớt
Seia vẫn chạy khi MongoDB rớt. Code kiểm tra trước khi Discord hết 3 giây (vd kiểm tra bị restrict) dùng `DbReady()` (`Database/connect.js`) để bỏ qua ngay thay vì treo.

---

## 9. Config và ID Discord

### 9.1 `Utils/config.js`
- `Channels`: ID kênh (log, welcome, omikuji, quick-math, changelog...). Thứ gì khác nhau giữa server thì để theo **guild ID**:
  ```js
  ModLog: { '900742301373042809': '1165537322943643678' }   // không có server nào = không ghi log ở đó
  ```
- `Roles[guildId]`: `Mod` (danh sách role Mod), `Gay` / `GigaChad` (cho `/howgay`)...
- `OwnerRoles[guildId]`: role chỉ owner được có (Typhoeus ở All Factor). **Seia không bao giờ tạo role ở Lazy Gang.**
- Ghi chú tên role/kênh bằng comment bên cạnh ID để sau này đọc còn hiểu.

### 9.2 `Utils/owners.js`
Danh sách ID chủ bot: acc chính, acc phụ, bạn. Thứ tự có ý nghĩa: acc đầu = owner chính (lời nhắc AFK riêng), 2 acc đầu = được `/exp-set`.

### 9.3 `Utils/Ranking/guilds.js` (server nhận EXP)
Thêm một server = thêm 1 mục:
```js
'ID_SERVER': {
    LevelUpChannel: 'ID_KÊNH',            // nơi gửi thông báo lên level ('' = gửi ngay kênh vừa chat)
    ExpCategories: ['Server Lobby'],      // (tuỳ chọn) chỉ các danh mục này mới cho EXP, ghi tên hoặc ID
    NoExpChannels: ['ID_KÊNH', ...],      // kênh không bao giờ cho EXP
    RankRoles: { Levels: [{ Level: 4, Role: 'ID' }], TotalExp: [{ Total: 10000, Role: 'ID' }] }   // (tuỳ chọn)
}
```
- Role rank phải **tạo sẵn** trên Discord và nằm **dưới role của Seia**. Lúc khởi động, log sẽ báo role nào Seia không quản lý được.
- `Exp.Event.End` = thời điểm hết event x EXP (unix **giây**). Muốn mở event mới: đặt `End` mới.
- `Restrictions` = hệ số EXP của `/exp-penalty`.
- Công thức level ở `Utils/Ranking/lvlcalc.js` (`ReqExp`, `FromTotal`). **Đừng đổi công thức**: level của mọi người tính theo nó.

---

## 10. Rank card

### 10.1 Thêm 1 card vào bộ có sẵn
1. Ảnh **934 × 282** PNG, đặt tên `<key>.png` trong thư mục bộ, vd `Assets/RankCards/Touhou/reisen.png`.
2. Thêm 1 dòng vào `Assets/RankCards/Touhou/cards.js` (thứ tự trong file = thứ tự trong `/background-list`):
   ```js
   { Key: 'reisen', Color: '#c9a0ff', Emoji: '<:ReisenHi:123456789012345678>', Title: 'Touhou 8 - Reisen' },
   ```
   - `Key`: chữ thường, không dấu cách, **không trùng card khác**, **không bao giờ đổi sau khi đã dùng** (database lưu key).
   - `Emoji`: phải là emoji Seia dùng được (xem [phần 12](#12-emoji)). Emoji này cũng là icon nhỏ trên ảnh card và icon trong menu.
   - `Icon` (tuỳ chọn): link ảnh khác làm icon trên card thay cho ảnh emoji.

### 10.2 Thêm bộ mới
1. Tạo thư mục `Assets/RankCards/<Tên bộ>/` với `cards.js` (copy từ bộ khác) + ảnh.
2. Thêm tên bộ vào `Collections` trong `Assets/RankCards/index.js` (thứ tự = thứ tự hiển thị).
3. Bộ > 25 card thì `/background-list` tự chia trang menu (1-25, 26-...), không cần làm gì.

### 10.3 Trao card cho người dùng
Card **mở khoá theo từng server**. Mod / owner dùng `/background-manage` (`[Add]` thêm vào danh sách, `[Set]` đặt luôn làm background, `[Remove]` gỡ). Người dùng tự đặt card đã có bằng `/background-set`.

Khởi động bot mà card thiếu ảnh / trùng key thì log có dòng `[WARN] Rank card ...`, bot vẫn chạy.

---

## 11. Dữ liệu game: howgay, omikuji, quick-math, 2048

| Muốn | Sửa ở đâu |
|---|---|
| Thêm easter egg `/howgay` | `Assets/Howgay/special-cases.js`: key = kết quả **cắt** còn 1 chữ số thập phân, không làm tròn (`"72.7"` = 72.7000% → 72.7999%), + ảnh trong `Assets/Howgay/CaseImg/Special/NumberCases/`. Không cần sửa database |
| Thêm người không check được `/howgay` | `Assets/Howgay/rejected.js`: ID người dùng + ảnh trong `CaseImg/Rejected/` + câu `en-US` / `vi`. Comment phía trên = tên hiển thị (@username) |
| Câu nhận xét `/howgay` theo khoảng % | `Assets/Howgay/Texts/allcases.js` (tiếng Anh) + `allcases-vn.js` (tiếng Việt) |
| Câu `/omikuji` | `Assets/Omikuji/Texts/cases.js` + `cases-vn.js`, cấu hình ở `Assets/Omikuji/config.js` |
| Độ khó / thời gian / hệ số điểm `/quick-math` | `Assets/QuickMath/config.js` (`Profiles`, `Timer`, `MultiList`...) |
| Thêm chế độ 2048 | `Functions/Fun/Game-2048/2048-Modes.js` (+ `desc` / `descVi`) **và** thêm lựa chọn vào `addChoices` trong `Commands/Fun/game-2048.js` + `game-2048-top.js`. Chế độ có luật mới thì sửa engine `Game-2048.js` |

---

## 12. Emoji

- **Lấy mã emoji**: trong Discord gõ `\:tên_emoji:` rồi gửi → ra `<:tên:ID>` (emoji động: `<a:tên:ID>`). Copy nguyên chuỗi đó vào code.
- **Seia chỉ dùng được emoji của server Seia đang ở** (Lazy Gang, các server LYG_EmojiSaver / LYG Asset...). Emoji của server khác sẽ hiện thành chữ `:tên:`.
- **Không dùng emoji của All Factor.**
- Emoji Hololive / Touhou cũ đã lỗi thời trong câu trả lời của lệnh → dùng emoji **Blue Archive / Senren Banka**. Riêng emoji trong `Assets/` (card Touhou, ô 2048, xúc xắc...) là asset, giữ nguyên.
- **Không dùng emoji mặc định (Unicode) như 🏆 ✅ ❌ 👑 🥇** ở bất cứ đâu Seia hiển thị (lệnh, event, cả asset như lá xăm, changelog): luôn dùng emoji riêng của server cho chuyên nghiệp. Ký hiệu chữ như `▸ • ►` và `©` thì được. Vài emoji riêng thay thế hay dùng: hoàn thành `LYG_Check`, lỗi / thoát `LYG_Declined`, kỷ lục `LYG_Star`, top 3 bảng xếp hạng `RankX` / `RankS` / `RankA`.
- Nút bấm: `.setEmoji('ID')` (chỉ số ID). Menu: `emoji: '<:tên:ID>'`.

---

## 13. Ra phiên bản mới

Chọn số version `X.Y.Z`: sửa lỗi / thêm vài thứ nhỏ → tăng **Z**; thay đổi lớn (nhiều lệnh mới, đổi cách hoạt động) → tăng **Y**, Z về 0.

1. **Changelog**: tạo `Assets/Changelog/vX.Y.Z.js`, copy cấu trúc từ file changelog mới nhất:
   ```js
   const Changelog = {
       Version: 'X.Y.Z',
       Color: '#FB8BFF',
       Image: 'Changelog.png',          // ảnh trong Assets/Misc
       Title: '<:seiaheh:1244128244664504392> **Yurizono Seia - Changelog vX.Y.Z**',
       Description: `Đoạn mở đầu tiếng Việt`,
       Sections: [
           { Name: 'Tên mục', Value: `▸ Dòng 1\n▸ Dòng 2` }       // mỗi Value tối đa 1024 ký tự
       ],
       En: { Description: `English intro`, Sections: [ /* giống trên, tiếng Anh */ ] }
   }
   module.exports = (Changelog)
   ```
   Trong chuỗi `` `...` `` muốn hiện dấu `` ` `` thì viết `` \` ``.
2. **README.md**: thêm mục `## Changelog - vX.Y.Z` (tiếng Anh) lên đầu danh sách changelog, sửa dòng `> vX.Y.Z (heh.)`.
3. **Version**: sửa `"version"` trong `package.json` **và 2 chỗ** trong `package-lock.json` (dòng 3 và dòng 9, phần `"yurizono-seia"`). `/help` và `/changelog` đọc version từ đây.
4. Khởi động bot → `/changelog send-to:test` (đăng thử ở kênh test) → xem ổn thì `/changelog send-to:publish` (đăng ở kênh thông báo của mọi server, có nút xác nhận).
5. **Commit**: `YYYYMMDD-HHMM vX.Y.Z - tóm tắt` (ngày giờ lúc commit), vd `YYYYMMDD-HHMM vX.Y.Z - New /hello command`.
6. Ảnh footer embed lấy từ GitHub nhánh `droid_ver`, nên ảnh mới chỉ hiện sau khi **push**.

---

## 14. Giới hạn của Discord hay đụng phải

| Thứ | Giới hạn |
|---|---|
| Trả lời đầu tiên của lệnh | **3 giây** → `deferReply()` ngay đầu |
| Sửa trả lời / followUp sau defer | **15 phút** |
| Tên lệnh / option | 1-32 ký tự, chữ thường, `-` và `_` |
| Mô tả lệnh / option | **100 ký tự** (tính cả nhãn `-Mod Only-`) |
| Số option / số choices | 25 / 25 |
| Embed | title 256, description **4096**, field value **1024**, 25 field, tổng **6000** ký tự, 10 embed / tin nhắn |
| Nút / menu | 5 hàng, 5 nút / hàng hoặc 1 menu / hàng, menu **25 lựa chọn**, label 100 ký tự (nút 80) |
| Tin Components V2 (`V2(...)`) | tổng chữ **4000** ký tự, tối đa 40 thành phần (khung, chữ, nút... đều tính), không có `content` / `embeds` |
| Modal | tiêu đề 45 ký tự, 5 ô nhập |
| Tin nhắn chỉ mình người dùng thấy (ephemeral) | Chỉ có với interaction (lệnh / nút), event thường không làm được |
| Gợi ý autocomplete | 25 gợi ý, phải trả lời trong 3 giây |

---

## 15. Kiểm tra trước khi chạy thật

```sh
# Kiểm tra cú pháp 1 file (không chạy)
node --check Commands/Fun/hello.js

# Nạp thử MỌI lệnh, báo lỗi nếu file nào hỏng hoặc mô tả quá 100 ký tự (không đăng nhập Discord)
node -e "const c={};require('./Handlers/commandHandler').LoadCommands(c);for(const x of c.commands.values())x.data.toJSON();console.log('OK',c.commands.size,'commands')"

# Nạp thử toàn bộ rank card (báo card thiếu ảnh / trùng key)
node -e "console.log(require('./Assets/RankCards').RankCards.length,'cards')"
```
- Thử lệnh mới ở kênh test trước (`ChangelogTest` trong config là kênh test sẵn có).
- `DEBUG=true` trong `.env` để xem log chi tiết.
- Đổi gì trong database thật: **backup trước** (vd export collection trên MongoDB Atlas), chạy thử ở chế độ chỉ đọc trước khi ghi.

---

## 16. Lỗi hay gặp

| Triệu chứng | Nguyên nhân hay gặp | Cách sửa |
|---|---|---|
| "The application did not respond" | Quá 3 giây mới trả lời | `await interaction.deferReply()` ở **dòng đầu** `execute` |
| `Interaction has already been acknowledged` | Trả lời 2 lần (`reply` sau khi đã `deferReply`) | Sau defer chỉ dùng `editReply` / `followUp` |
| Lệnh mới không hiện | Chưa khởi động lại bot / lệnh global chưa kịp cập nhật | Khởi động lại, đợi vài phút, thử reload Discord (Ctrl+R) |
| Bot không khởi động, `Cannot find module` | Sai hoa / thường trong `require` (Termux) hoặc sai đường dẫn | Sửa đúng tên file, đếm đúng số `../` |
| `Invalid string length` / `ExpectedConstraintError` lúc khởi động | Mô tả > 100 ký tự, tên lệnh có chữ hoa, > 25 option | Rút gọn |
| `Invalid Form Body` khi gửi | Embed vượt giới hạn, menu > 25 lựa chọn, emoji sai định dạng | `Cut(...)`, chia nhỏ, kiểm tra `<:tên:ID>` |
| Bấm nút xong tin nhắn đứng im / báo lỗi | Tin đã là V2 mà bước sau gửi `{ embeds }` thường hoặc `{ components: [] }` | Bọc mọi lần sửa tin đó bằng `V2(...)` (xem 6.0) |
| Emoji hiện thành `:tên:` | Seia không ở server có emoji đó | Dùng emoji ở server Seia có mặt |
| Cooldown báo sai giờ | Dùng `Date.now()` | Dùng `Clock.Now()` |
| `E11000 duplicate key` | Tạo document trùng (index unique) | Dùng `updateOne(..., { upsert: true })` thay vì `create` |
| ID người dùng bị sai vài số cuối | Lưu ID dạng Number | Luôn lưu String |
| Nút bấm không phản hồi | Collector hết giờ / sai `customId` / filter sai người | Kiểm tra `time`, `customId`, `filter` |

---

## 17. Checklist nhanh

**Lệnh mới**
- [ ] File trong đúng `Commands/<Nhóm>/`, `.setName` chữ thường
- [ ] Mô tả + mọi option có `setDescriptionLocalizations({ vi })`, choices có `name_localizations`
- [ ] Nhãn quyền ở đầu mô tả (nếu có) + gọi `RequireMod` / `RequireOwner` tương ứng
- [ ] `deferReply()` đầu tiên (trừ lệnh mở modal)
- [ ] `GetLanguage` → `if (!LangKey) return`
- [ ] Câu trả lời song ngữ, Seia xưng "em" gọi "Sensei"
- [ ] Emoji dùng được, không phải All Factor, không phải Hololive / Touhou (ngoài asset), **không có emoji Unicode**
- [ ] Có nút / menu → gửi bằng `V2(...)`, và mọi lần sửa sau của tin đó cũng `V2(...)` (cả lúc hết giờ)
- [ ] Cooldown: field trong `Database/cooldown.js` + dòng trong `/check-cooldown`
- [ ] Thời gian lưu / so sánh dùng `Clock.Now()`
- [ ] `node --check` + lệnh nạp thử ở phần 15

**Ra bản mới**
- [ ] `Assets/Changelog/vX.Y.Z.js` (vi + En, field ≤ 1024)
- [ ] README
- [ ] `package.json` + 2 chỗ trong `package-lock.json`
- [ ] `/changelog send-to:test` → `publish`
- [ ] Commit `YYYYMMDD-HHMM vX.Y.Z - ...` → push
