//-- Game 2048: one engine for every mode, one object per game (players never share a board)
const EmojisGame_2048 = require('../../../Assets/Game-2048/game-emojis')
const Game2048_Modes = require('./2048-Modes')
const Clock = require('../../../Utils/clock')

const EmptyBoard = () => [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
const Copy = (arr) => arr.map(row => row.slice())

// Cells of each line in the order they slide (index 0 = the wall they move to)
const Lines = {
    left: [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => [r, c])),
    right: [0, 1, 2, 3].map(r => [3, 2, 1, 0].map(c => [r, c])),
    up: [0, 1, 2, 3].map(c => [0, 1, 2, 3].map(r => [r, c])),
    down: [0, 1, 2, 3].map(c => [3, 2, 1, 0].map(r => [r, c]))
}

// Slides one line to the wall, every tile merges at most once -> [new line, points gained]
function SlideLine(line) {
    const tiles = line.filter(v => v !== 0)
    const result = []
    let gained = 0
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === tiles[i + 1]) {
            result.push(tiles[i] * 2)
            gained += tiles[i] * 2
            i++
        } else {
            result.push(tiles[i])
        }
    }
    while (result.length < 4) result.push(0)
    return [result, gained]
}

class Game2048 {
    constructor(mode = 'default') {
        this.mode = (Game2048_Modes[mode]) ? mode : 'default'
        this.settings = Game2048_Modes[this.mode]

        this.score = 0
        this.lastScore = 0
        this.curArr = EmptyBoard()
        this.lastArr = EmptyBoard()
        this.undoUsed = false
        this.moveCount = 0
        this.swapCount = 0
        this.lastSwapped = []
        this.lost = false
        this.lastAddedTile = []
        this.preNewTile = []
        this.showOnce = false
    }

    CreateGame() {
        this.curArr = EmptyBoard()
        this.AddTile()
        this.AddTile()
        this.lastArr = Copy(this.curArr)
        this.undoUsed = false
        this.score = 0
        this.lastScore = 0
        this.moveCount = 0
        this.swapCount = 0
        this.lastSwapped = []
        this.lost = false
        return this
    }

    // Saved gameStats (Database/Fun/game-2048.js) -> game
    Load(Stats) {
        this.curArr = Copy(Stats.board?.current || EmptyBoard())
        this.lastArr = Copy(Stats.board?.last || this.curArr)
        this.score = Stats.scores?.current || 0
        this.lastScore = Stats.scores?.last || 0
        this.moveCount = Stats.moveCount || 0
        this.undoUsed = Boolean(Stats.undoUsed)
        this.lastSwapped = Stats.lastSwapped || []
        this.swapCount = Stats.swapCount || 0
        this.showOnce = Boolean(Stats.showOnce)
        this.lastAddedTile = Stats.TilesIndexes?.lastAddedTile || []
        this.preNewTile = Stats.TilesIndexes?.preNewTile || []
        this.lost = Boolean(Stats.lost)
        return this
    }

    // game -> gameStats to save (the board is shown once when the game is loaded again)
    Save() {
        return {
            mode: this.mode,
            scores: { current: this.score, last: this.lastScore },
            board: { current: this.curArr, last: this.lastArr },
            moveCount: this.moveCount,
            undoUsed: this.undoUsed,
            lost: this.lost,
            TilesIndexes: { lastAddedTile: this.lastAddedTile || [], preNewTile: this.preNewTile || [] },
            lastSwapped: this.lastSwapped || [],
            swapCount: this.swapCount || 0,
            showOnce: true,
            timestamp: `${Clock.Now()}`
        }
    }

    // New tile on a random empty cell: 2 (10/11) or 4 (1/11)
    AddTile() {
        const empty = []
        this.curArr.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]) }))
        if (empty.length === 0) return

        const [row, col] = empty[Math.floor(Math.random() * empty.length)]
        this.curArr[row][col] = (Math.floor(Math.random() * 11) === 10) ? 4 : 2
        this.preNewTile = this.lastAddedTile || []
        this.lastAddedTile = [row, col]
    }

    // Swaps 2 random tiles (Swap modes)
    SwapTiles() {
        const filled = []
        this.curArr.forEach((row, r) => row.forEach((v, c) => { if (v !== 0) filled.push([r, c]) }))
        if (filled.length < 2) {
            this.lastSwapped = []
            return
        }

        const i = Math.floor(Math.random() * filled.length)
        let j
        do {
            j = Math.floor(Math.random() * filled.length)
        } while (j === i)

        const [ax, ay] = filled[i], [bx, by] = filled[j]
        const temp = this.curArr[ax][ay]
        this.curArr[ax][ay] = this.curArr[bx][by]
        this.curArr[bx][by] = temp
        this.lastSwapped = [filled[i], filled[j]]
    }

    // No empty cell and no equal neighbours = lost
    CheckLose() {
        const arr = this.curArr
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (arr[i][j] === 0) return false
                if (j < 3 && arr[i][j] === arr[i][j + 1]) return false
                if (i < 3 && arr[i][j] === arr[i + 1][j]) return false
            }
        }
        this.lost = true
        return true
    }

    // Biggest tile on the board
    MaxTile() {
        return Math.max(0, ...this.curArr.flat())
    }

    // direction: 'up' | 'down' | 'left' | 'right'. Returns false when nothing moved
    Move(direction) {
        const before = Copy(this.curArr)
        let gained = 0

        for (const cells of Lines[direction]) {
            const [line, points] = SlideLine(cells.map(([r, c]) => this.curArr[r][c]))
            gained += points
            cells.forEach(([r, c], k) => this.curArr[r][c] = line[k])
        }
        if (JSON.stringify(before) === JSON.stringify(this.curArr)) return false

        this.lastArr = before
        this.lastScore = this.score
        this.score += gained
        this.undoUsed = false
        this.moveCount++
        this.swapCount++
        this.AddTile()

        this.lastSwapped = []
        if (this.settings.swap && this.moveCount % 5 === 0) this.SwapTiles()

        this.CheckLose()
        return true
    }

    // One undo per move
    Undo() {
        if (this.undoUsed || this.moveCount <= 0) return false
        this.curArr = Copy(this.lastArr)
        this.score = this.lastScore
        this.undoUsed = true
        this.lastAddedTile = this.preNewTile || []
        this.lastSwapped = []
        this.moveCount--
        this.swapCount = Math.max(this.swapCount - 1, 0)
        this.lost = false
        return true
    }

    ToString() {
        const phase = this.moveCount % 7
        const visible = !this.settings.hidden || [4, 5].includes(phase) || this.lost || this.moveCount <= 5 || this.showOnce
        const [addRow, addCol] = this.lastAddedTile || [-1, -1]
        const swapped = this.lastSwapped || []

        const str = this.curArr.map((row, i) => row.map((v, j) => {
            const shown = visible || (i === addRow && j === addCol) || swapped.some(([x, y]) => x === i && y === j)
            return (shown) ? (EmojisGame_2048[v] || EmojisGame_2048[0]) : EmojisGame_2048[0]
        }).join(' ')).join('\n') + '\n'

        if (this.showOnce) this.showOnce = false
        return str
    }
}

module.exports = { Game2048, Game2048_Modes }
