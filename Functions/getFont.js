const path = require('path')
const fs = require('fs')
const Log = require('../Utils/logger')

// Bundled fonts (Termux has no system fonts) - folder name: { family name, file names }
const Fonts = {
    Ubuntu: {
        name: "Ubuntu",
        variants: ["Ubuntu-Regular", "Ubuntu-Bold", "Ubuntu-BoldItalic"]
    },
    Noto_Sans: {
        name: "Noto Sans",
        variants: ["NotoSans-VariableFont_wdth,wght"]
    },
    Segoe_UI_Symbol: {
        name: "Segoe UI Symbol",
        variants: ["Segoe-UI-Symbol"]
    },
    Inter_Tight: {
        name: "Inter Tight",
        variants: ["InterTight-VariableFont_wght"]
    },
    Arial: {
        name: "Arial",
        variants: ["arial", "arialbd", "arialbi", "ariali"]
    },
    BIZ_UDGothic: {
        name: "BIZ UDGothic",
        variants: ["BIZUDGothic-Regular", "BIZUDGothic-Bold"]
    }
}

let Canvas = null

// Loads @napi-rs/canvas only when an image is drawn, so a broken canvas install
// can't stop the whole bot from starting (only the image commands fail)
function GetCanvas() {
    if (Canvas) return Canvas
    Canvas = require('@napi-rs/canvas')

    for (const [folder, font] of Object.entries(Fonts)) {
        for (const variant of font.variants) {
            const file = path.join(__dirname, '..', 'Assets', 'Font', folder, `${variant}.ttf`)
            if (!fs.existsSync(file) || !Canvas.GlobalFonts.registerFromPath(file, font.name)) {
                Log.Warn(`Cannot load font ${folder}/${variant}.ttf`)
            }
        }
    }
    return Canvas
}

module.exports = { GetCanvas }
