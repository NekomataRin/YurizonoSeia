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
        'v0.5.0 - Yurizono Seia, Prepare To Run!',
        '/quick-math and /room-history Commands: Done!',
        'Revived! Now you can use me again!',
    ], 
    c = [
        '/drp-calc is working in progress, please wait until it\'s stable to use! -Nakamura Taki'
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