const chalk = require('chalk')

// Debug lines only show when DEBUG=true is in .env
const Log = {
    Info: (...args) => console.log(chalk.blue('[LOG]'), ...args),
    Warn: (...args) => console.warn(chalk.yellow('[WARN]'), ...args),
    Error: (...args) => console.error(chalk.red('[ERROR]'), ...args),
    Debug: (...args) => {
        if (process.env.DEBUG === 'true') console.log(chalk.cyanBright('[DEBUG]'), ...args)
    }
}

module.exports = (Log)
