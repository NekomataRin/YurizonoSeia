//-- Game 2048: Hidden
const EmojisGame_2048 = require('../../../Assets/Game-2048/game-emojis');

const Game2048_Hidden = {
    score: 0,
    lastScore: 0,
    curArr: [],
    lastArr: [],
    undoUsed: false,
    moveCount: 0,
    lost: false,
    lastAddedTile: [],
    preNewTile: [],

    defaultArr: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    CreateGame() {
        let arr = this.defaultArr.map(row => row.slice());
        let tiles = 0;
        while (tiles < 2) {
            let rng = Math.floor(Math.random() * 11);
            let row = Math.floor(Math.random() * 4), col = Math.floor(Math.random() * 4);
            if (arr[row][col] === 0) {
                arr[row][col] = (rng === 10) ? 4 : 2;
                tiles++;
            }
        }
        this.curArr = arr;
        this.lastArr = this.UnMove(arr);
        this.undoUsed = false;
        this.score = 0;
        this.lastScore = 0;
        this.moveCount = 0;
        return arr;
    },

    Add(arr) {
        let added = false;
        this.preNewTile = this.lastAddedTile || [-1. - 1];
        let cord_arr = [];
        while (!added) {
            let rng = Math.floor(Math.random() * 11);
            let row = Math.floor(Math.random() * 4), col = Math.floor(Math.random() * 4);
            if (arr[row][col] === 0) {
                arr[row][col] = (rng === 10) ? 4 : 2;
                cord_arr.push(row, col);
                added = true;
            }
        }
        this.lastAddedTile = cord_arr;
        return arr;
    },

    CheckLose(arr) {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                if (arr[i][j] === 0) return false;
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 3; j++)
                if (arr[i][j] === arr[i][j + 1]) return false;
        for (let j = 0; j < 4; j++)
            for (let i = 0; i < 3; i++)
                if (arr[i][j] === arr[i + 1][j]) return false;

        this.lost = true;
        return true;
    },

    UnMove(arr) {
        return arr.map(row => row.slice());
    },

    ToString(arr) {
        const phase = this.moveCount % 7;
        const visible = ([4, 5].includes(phase) || this.lost || this.moveCount <= 5);
        const [addRow, addCol] = this.lastAddedTile || [-1, -1];

        let str = '';
        for (let i = 0; i < 4; i++) {
            str += arr[i].map((v, j) => {
                if (!visible) {
                    return (i === addRow && j === addCol)
                        ? EmojisGame_2048[v]
                        : EmojisGame_2048[0];
                } else {
                    return EmojisGame_2048[v];
                }
            }).join(' ') + '\n';
        }
        return str;
    },

    Undo() {
        if (this.undoUsed || this.moveCount <= 0) return false;
        this.curArr = this.UnMove(this.lastArr);
        this.score = this.lastScore;
        this.undoUsed = true;
        this.lastAddedTile = this.preNewTile || [-1, -1];
        this.moveCount--;
        return true;
    },

    moveTemplate(arr, transformFunc) {
        let changed = false;
        this.lastArr = this.UnMove(arr);
        this.lastScore = this.score;
        this.undoUsed = false;

        changed = transformFunc(arr);

        if (changed) {
            this.Add(arr);
            this.moveCount++;
        }

        return arr;
    },

    LMove(arr) {
        return this.moveTemplate(arr, (a) => {
            let changed = false;
            for (let i = 0; i < 4; i++) {
                let row = a[i].filter(v => v !== 0);
                let newRow = [], skip = false;
                for (let j = 0; j < row.length; j++) {
                    if (!skip && row[j] === row[j + 1]) {
                        newRow.push(row[j] * 2);
                        this.score += row[j] * 2;
                        skip = true;
                        changed = true;
                    } else {
                        if (!skip) newRow.push(row[j]);
                        skip = false;
                    }
                }
                while (newRow.length < 4) newRow.push(0);
                if (a[i].toString() !== newRow.toString()) changed = true;
                a[i] = newRow;
            }
            return changed;
        });
    },

    RMove(arr) {
        return this.moveTemplate(arr, (a) => {
            let changed = false;
            for (let i = 0; i < 4; i++) {
                let row = a[i].filter(v => v !== 0).reverse();
                let newRow = [], skip = false;
                for (let j = 0; j < row.length; j++) {
                    if (!skip && row[j] === row[j + 1]) {
                        newRow.push(row[j] * 2);
                        this.score += row[j] * 2;
                        skip = true;
                        changed = true;
                    } else {
                        if (!skip) newRow.push(row[j]);
                        skip = false;
                    }
                }
                while (newRow.length < 4) newRow.push(0);
                newRow.reverse();
                if (a[i].toString() !== newRow.toString()) changed = true;
                a[i] = newRow;
            }
            return changed;
        });
    },

    UMove(arr) {
        return this.moveTemplate(arr, (a) => {
            let changed = false;
            for (let j = 0; j < 4; j++) {
                let col = [];
                for (let i = 0; i < 4; i++) if (a[i][j] !== 0) col.push(a[i][j]);
                let newCol = [], skip = false;
                for (let i = 0; i < col.length; i++) {
                    if (!skip && col[i] === col[i + 1]) {
                        newCol.push(col[i] * 2);
                        this.score += col[i] * 2;
                        skip = true;
                        changed = true;
                    } else {
                        if (!skip) newCol.push(col[i]);
                        skip = false;
                    }
                }
                while (newCol.length < 4) newCol.push(0);
                for (let i = 0; i < 4; i++) {
                    if (a[i][j] !== newCol[i]) changed = true;
                    a[i][j] = newCol[i];
                }
            }
            return changed;
        });
    },

    DMove(arr) {
        return this.moveTemplate(arr, (a) => {
            let changed = false;
            for (let j = 0; j < 4; j++) {
                let col = [];
                for (let i = 0; i < 4; i++) if (a[i][j] !== 0) col.push(a[i][j]);
                col.reverse();
                let newCol = [], skip = false;
                for (let i = 0; i < col.length; i++) {
                    if (!skip && col[i] === col[i + 1]) {
                        newCol.push(col[i] * 2);
                        this.score += col[i] * 2;
                        skip = true;
                        changed = true;
                    } else {
                        if (!skip) newCol.push(col[i]);
                        skip = false;
                    }
                }
                while (newCol.length < 4) newCol.push(0);
                newCol.reverse();
                for (let i = 0; i < 4; i++) {
                    if (a[i][j] !== newCol[i]) changed = true;
                    a[i][j] = newCol[i];
                }
            }
            return changed;
        });
    }
};

module.exports = Game2048_Hidden;
