/*
Game 2048 modes
- Hidden: after 5 moves the board is hidden, it shows up again for 2 moves out of every 7
          (the newest tile is always shown)
- Swap: every 5 moves, 2 random tiles swap places (the swapped tiles are always shown)
*/
const Game2048_Modes = {
    default: {
        name: 'Default',
        desc: 'This is the default mode, no modifications at all. Suitable for everyone',
        hidden: false,
        swap: false
    },
    hidden: {
        name: 'Hidden',
        desc: 'The board will be hidden after 5 moves. It will stay hidden for 5 moves, and will be shown for 2 moves then hidden again. It will require your memory skills, so good luck!',
        hidden: true,
        swap: false
    },
    swap: {
        name: 'Swap',
        desc: 'The board will swap randomly 2 pieces after each 5 moves. Good luck with your rng, lmao.',
        hidden: false,
        swap: true
    },
    anomaly: {
        name: 'Anomaly',
        desc: 'Combo of Hidden and Swap, no need to explain further. This is insanely hard, not recommended for you to play it, unless you aren\'t normalhuman.',
        hidden: true,
        swap: true
    }
}

module.exports = (Game2048_Modes)
