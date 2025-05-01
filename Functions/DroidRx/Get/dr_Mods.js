const ModsObj = {
    '|': '',
    'a': "AT",
    'b': 'TC',
    'c': 'NC',
    'd': 'DT',
    'e': 'EZ',
    'f': 'PF',
    'h': 'HD',
    'i': 'FL',
    'm': 'CS',
    'n': 'NF',
    'P': 'AP',
    'r': 'HR',
    's': 'PR',
    't': 'HT',
    'u': 'SD',
    'v': 'V2',
    'x': 'RX'
}

function DroidRxMods(str) {
    let Mods = ''
    let Substr = str.split('|')
    if (Substr[0].length > 0) {
        for (var i in Substr[0]) {
            if (Object.keys(ModsObj).includes(Substr[0][i])) {
                Mods += ModsObj[Substr[0][i]]
            }
        }
    }
    if (Substr[1].length > 0) Mods += ` ${Substr[1]}`
    if (Substr[0].length === 0) Mods = 'No Mod'
    return Mods
}

module.exports = { DroidRxMods }