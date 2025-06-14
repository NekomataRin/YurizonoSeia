const { ActivityType, PresenceUpdateStatus } = require('discord.js');
const wait = require('node:timers/promises').setTimeout
const mongoose = require('mongoose')
const chalk = require('chalk')
const mongodbURL = process.env.MONGO_URL;


module.exports = async (client) => {
    if (!mongodbURL) return;
    await mongoose.connect(mongodbURL || '', {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    if (mongoose.connect) {
        console.log(chalk.blue('[LOG]') + ' Database, Check!')
    }

    var i = 0, a = 1
    b = [
        'v1.3.0 - Yurizono Seia, Prepare To Run!',
        'Replace Old IochiMari Lmao',
        'Popular commands: /howgay | /quickmath | /omikuji',
        'Now Only For LazyGang Server, Of Course!',
        '@nekorin727 - My Dad!',
    ], 
    c = [
        '/howgay and /howgay-stats are under maintenance, please do not use those commands until the maintenance has been done.'
    ], namearr = (a === 0) ? c : b
    while (i !== -1) {
        await client.user.setPresence({
            activities: [{
                name: `${namearr[i]}`,
                type: ActivityType.Playing,
            }],
            status: (a === 0) ? PresenceUpdateStatus.DoNotDisturb : PresenceUpdateStatus.Online,
        })
        await wait(20000)
        i++
        if (i === Number(namearr.length))
            i = 0
    }
}