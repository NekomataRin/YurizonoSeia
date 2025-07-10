const { AttachmentBuilder } = require('discord.js')
var CreatedDate = new Date(1716717600 * 1000)
CreatedDate = CreatedDate.toString()
const CYear = CreatedDate.slice(11, 15)

var CurrentDate = new Date(Date.now())
CurrentDate = CurrentDate.toString()
const CurYear = CurrentDate.slice(11, 15)

const FooterEmbeds = [
    [
        `©${CYear}-${CurYear} • Yurizono Seia ▸ LYG Code V2 by nekorin727`
    ],
    [
        'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia0.png',
        'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia1.png',
        'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia2.png',
        'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia3.png',
        'https://raw.githubusercontent.com/NekomataRin/YurizonoSeia/refs/heads/droid_ver/Assets/Defaults/Image_Embeds/Seia4.png'
    ]
]

/*Footer Embeds
[0] Footer Line 
[1] Footer URL*/
module.exports = (FooterEmbeds)