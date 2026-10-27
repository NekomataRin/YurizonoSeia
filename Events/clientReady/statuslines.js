const { ActivityType, PresenceUpdateStatus } = require('discord.js')
const { version } = require('../../package.json')

// Maintenance = true -> Do Not Disturb + the maintenance lines
const Maintenance = false

const StatusLines = [
    `v${version} - Yurizono Seia, Prepare To Run!`,
    'Replace Old IochiMari Lmao',
    'Popular commands: /howgay | /quickmath | /omikuji',
    'Now Only For LazyGang Server, Of Course!',
    '@nekorin727 - My Dad!',
]

const MaintenanceLines = [
    '/howgay and /howgay-stats are under maintenance, please do not use those commands until the maintenance has been done.'
]

let timer = null

// Changes the "Playing ..." status every 20 seconds
module.exports = async (client) => {
    const lines = (Maintenance) ? MaintenanceLines : StatusLines
    const status = (Maintenance) ? PresenceUpdateStatus.DoNotDisturb : PresenceUpdateStatus.Online
    let i = 0

    const Update = () => {
        client.user.setPresence({
            activities: [{ name: lines[i], type: ActivityType.Playing }],
            status
        })
        i = (i + 1) % lines.length
    }

    //clientReady can fire again after a reconnect, only keep one timer
    if (timer) clearInterval(timer)
    Update()
    timer = setInterval(Update, 20000)
}
