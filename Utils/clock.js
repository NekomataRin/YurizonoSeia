/*
Discord's clock. The phone's clock can be wrong or jump (time sync after the network comes back...),
so cooldowns, daily resets and "edited just now" checks use Discord's time instead.
Every interaction / message ID contains the time Discord made it: Sync() learns the difference
between that and the phone's clock, Now() = phone clock + that difference.
*/
const Samples = []
let Offset = 0

// Discord time of something that just arrived (interaction.createdTimestamp, message.createdTimestamp)
function Sync(DiscordTime) {
    if (!Number.isFinite(DiscordTime)) return
    Samples.push(DiscordTime - Date.now())
    if (Samples.length > 20) Samples.shift()

    //3 samples in a row way lower = the phone clock jumped forward: forget the older ones
    //(one late message alone, like a replay after a reconnect, is just ignored)
    const last = Samples.slice(-3)
    if (last.length === 3 && last.every(s => s < Offset - 5000)) Samples.splice(0, Samples.length - 3)

    //Network lag only makes a sample smaller, so the biggest recent one is the closest
    Offset = Math.max(...Samples)
}

// Current time on Discord's clock (ms)
function Now() {
    return Date.now() + Offset
}

module.exports = { Sync, Now }
