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
        { file: new AttachmentBuilder('./Assets/Defaults/Image_Embeds/Seia0.png'), ctx: 'attachment://Seia0.png' },
        { file: new AttachmentBuilder('./Assets/Defaults/Image_Embeds/Seia1.png'), ctx: 'attachment://Seia1.png' },
        { file: new AttachmentBuilder('./Assets/Defaults/Image_Embeds/Seia2.png'), ctx: 'attachment://Seia2.png' },
        { file: new AttachmentBuilder('./Assets/Defaults/Image_Embeds/Seia3.png'), ctx: 'attachment://Seia3.png' },
        { file: new AttachmentBuilder('./Assets/Defaults/Image_Embeds/Seia4.png'), ctx: 'attachment://Seia4.png' },
    ]
]
/*Footer Embeds
[0] Footer Line 
[1] Footer URL*/
module.exports = (FooterEmbeds)