const path = require('path')
const getAllFiles = require('../Utils/getAllFiles')
const Log = require('../Utils/logger')

/*
Events/<eventName>/<file>.js -> every file exports async (client, ...eventArgs) => {}
Files of the same event run one by one (A -> Z). One file failing never stops the others
and never crashes the bot.
*/
module.exports = (client) => {
    const eventFolders = getAllFiles(path.join(__dirname, '..', 'Events'), true)

    for (const eventFolder of eventFolders) {
        const eventName = path.basename(eventFolder)
        const eventFiles = getAllFiles(eventFolder)
            .filter(file => file.endsWith('.js'))
            .map(file => ({ name: path.basename(file), run: require(file) }))

        client.on(eventName, async (...args) => {
            for (const eventFile of eventFiles) {
                try {
                    await eventFile.run(client, ...args)
                } catch (err) {
                    Log.Error(`Event ${eventName}/${eventFile.name}:`, err)
                }
            }
        })
    }
}
