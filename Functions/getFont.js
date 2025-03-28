const { GlobalFonts } = require('@napi-rs/canvas'),
    path = require('path')

function getFonts() {
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
              variants: ["arial", "arialbd", "arialbi", "ariali"]},
        BIZ_UDGothic: {
              name: "BIZ UDGothic", 
              variants: ["BIZUDGothic-Regular", "BIZUDGothic-Bold"]}
    }

    const keys = Object.keys(Fonts)
    for(var i in keys) {
        for(var j in keys) {
             GlobalFonts.registerFromPath(path.resolve(__dirname, `./../Assets/Font/${keys[i]}/${Fonts[keys[i]].variants[j]}.ttf`), Fonts[keys[i]].name)
        }
    }

}

module.exports = { getFonts }
