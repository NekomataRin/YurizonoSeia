var CreatedDate = new Date(1716717600 * 1000)
CreatedDate = CreatedDate.toString()
const CYear = CreatedDate.slice(11, 15)

var CurrentDate = new Date(Date.now())
CurrentDate = CurrentDate.toString()
const CurYear = CurrentDate.slice(11, 15)

const FooterEmbeds = [
    [
        `©${CYear}-${CurYear} • Yurizono Seia`
    ],
    [
        'https://cdn.discordapp.com/attachments/1228689938946592878/1244225732557799474/Yurizono_Seia.jpeg'
    ]
]
/*Footer Embeds
[0] Footer Line 
[1] Footer URL*/
module.exports = (FooterEmbeds)