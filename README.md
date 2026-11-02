# YurizonoSeia
Yep... Back to my original server - Lazy Gang

Nekorin727 - The TRUE Owner Of This Bot

> v1.4.1 (heh.)

## Changelog - v1.4.1

Lots of commands are back from **Miosha** (Seia's predecessor), Mods get moderation commands, and every command speaks both Vietnamese and English.

### Commands back from Miosha
- **Fun:** `/coinflip`, `/dice`, `/shiprate`
- **Misc:** `/pick`, `/roll`, `/number-convert`, `/check-cooldown`, `/minigames`
- **Server:** `/user-info`
- `/help` lists every command by category by itself (never outdated), with Changelog, Credits and FAQ pages
- Mio's emojis were swapped for Seia's; commands Seia already had keep Seia's version

### Moderation (Mod roles only)
- `/ban`, `/unban`, `/kick`, `/timeout`, `/warn`, `/warn-list`, `/warn-remove`
- `/announcement` posts an announcement written in a form (modal)
- `/restrict` + `/unrestrict`: stop someone from using Seia's commands for a while (except `/help`)
- `/mod-afk`: Mods / bot owners go AFK, whoever pings them gets a reminder
- `/rank-background-list`, `/data-transfer` (move ranking data to a new account)
- Only people with a Mod role of that server can use them (bot owners too need one); warnings are saved per server
- Mod roles per server: **Lazy Gang** (President, Senior Admin, Admin, Mod, Staff, PCB Team ID Card), **All Factor** (Founder, 2nd Factor Leader, All Factor Member Management, All Factor Chunithm Leader)

### Ranking & minigames
- `/top` → `/leaderboard`, with ◀ ▶ pages and medals for the top 3
- New permanent **﹝🔥﹞True Member** role at **30000** total EXP (Lazy Gang)
- `/quick-math` scores are per server now (the old ones stay on Lazy Gang)
- Mods can reset the server's boards: `/quick-math-reset`, `/game-2048-reset`
- `/reset-rank` and `/rank-background` work on **All Factor** too
- When Seia can't give ranking roles in one server, only that server pauses for 10 minutes

### Vietnamese / English
- Every command has Vietnamese and English descriptions and answers (pick yours with `/setup-language`)
- `/changelog`: anyone can read it (only they see it), only the bot owners post it
- `/avatar`: `[Guild + Banner]` fixed: it tells whether it's the server or the global avatar / banner, says when there's no banner, adds a GIF link for animated avatars

### Typhoeus role (All Factor)
- An owner-only role: Seia makes it on her first start, in lavender `#DCC3E3` (Typhoeus's hair color)
- Anyone else who gets it loses it right away, with a notice: *"Hey! This role is meant to be only used by my dad, no one else has the perm to do this!"*
- The notice is sent by DM; when DMs are closed, Seia pings them in a channel and deletes the ping after 10 seconds
- Lazy Gang is not affected

## Changelog - v1.4.0

> *Well, after a looong time, here is finally the `1.4.0` update. From this version on, everything is written with `Claude Pro` instructions, but the core logic is the same one you know, don't worry. I'm in control of the prompts, so bugs should be here and might be found btw* - nekorin727

### Rewritten codebase
- Cleaner code that is easier to maintain and runs reliably on a phone (Termux)
- The bot no longer crashes on errors, and reconnects by itself when the network or the database drops
- A command that fails now tells you so, instead of "Seia is thinking..." forever
- Using a command for the first time runs it right away (no more "not in the cooldown database yet")
- Cooldowns and daily resets follow Discord's clock, so a wrong phone clock doesn't matter

### /howgay
- Results now have 4 decimals: `0.0000%` → `101.0000%`
- Special cases (WYSI `72.7`, Error `404`...) can **actually** show up now; a bug meant they never appeared before
- `/howgay-stats`: server stats are split into 2 pages (Normal / Special); user stats are based on the last 100 checks
- Old data was moved to the new format, nothing was lost

### Ranking
- `/rank` shows the right position (everyone used to be #1), ranked by total EXP per server; same EXP = same rank
- EXP only counts in the **Server Lobby**, **LazyTown**, **Voice** and **PCB HQ** categories
- Milestone roles from **Level 4 to 48** (the previous milestone role is removed) + a **permanent** role at **10000** total EXP
- Level up messages show `> Granted @user role - @role` when a role is given
- Support for a 2nd server, with its own ranking and level up channel
- Rank card backgrounds are per server; `/background-list` also shows the card's collection

### /quick-math
- Every difficulty was rebalanced:
  - **Easy**: positive numbers only, × ÷ within the times tables
  - **Normal → Lunatic**: integers, negative numbers, divisions always exact
  - **Extra, Phantasm**: + − with 2-decimal numbers, × ÷ with (negative) integers
  - **Asian**: no limits, still Asian =)))
- Every result stays within `±99999.99`, and nothing gets harder after level 10
- Answers like `3,75` or `3.75` both work, and the solving time can't be negative anymore

### /game-2048
- Every player has their own board (players used to share one when playing at the same time)
- The game ends when no moves are left, and you can undo once after each move
- Swap mode swaps 2 real tiles
- Best scores are saved for every mode

### New leaderboards
- `/quick-math-top`: leaderboard for each difficulty
- `/game-2048-top`: leaderboard for each mode
- Beating your best score shows a 🏆 message at the end of the game

### /omikuji
- Fixed a crash when drawing an SS / EX card in Vietnamese
- Fixed being able to draw again and again after 22:00 UTC

### Logs & moderation
- The edit log only reports **real** edits (no more spam from link previews, pins...)
- The delete log no longer fails on long messages, and also logs image-only messages
- Converted X / Facebook links get a **Context** line (the rest of the message) and never ping anyone
- Invite blocker: broken invite links no longer crash the bot

### Other fixes
- Welcome messages work for users without an avatar
- Fixed `/avatar` (banners) and `/random-user` (when nobody is online)
- `/howgay-stats`, `/omikuji-stats`: other people can't click your menu anymore
- New `/changelog` command (owner only) to post these notes in the announcement channels
