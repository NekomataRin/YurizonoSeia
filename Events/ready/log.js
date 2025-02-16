const chalk = require('chalk')

module.exports = (client) => {
    console.log(`${chalk.cyanBright('[LOG]')} ${chalk.yellowBright(client.user.tag)} Is Online!`)
}