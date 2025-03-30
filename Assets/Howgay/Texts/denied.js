const ImgList = require('./imglist')

const Denied_Cases = [
    {
        id: '1244213929438089286', //Yurizono Seia,
        desc: `<:SeiaMuted:1244890584276008970> You wanna test the \`/howgay\` command on me (<@1244213929438089286>)? DAD!!! THIS CHILD MOLESTER TRYNA TEST HOW GAY I AM!!!!`,
        img: ImgList.Rejected.Seia.value,
        ctx: ImgList.Rejected.Seia.ctx
    },
    {
        id: '751225225047179324', //nekorin727
        desc: `<:SeiaMenacing:1250945297660641351> Are you trying to test the \`/howgay\` command on <@751225225047179324> ? Not so fast little bro, this is my dad (~~aka my clone rn~~), you do NOT have the permission to do this to him!`,
        img: ImgList.Rejected.Seia.value,
        ctx: ImgList.Rejected.Seia.ctx
    },
    {
        id: '786816081032773662', //serika.206
        desc: `<:serikadisgust:1230835681224298546> "Hmm, you really wanted to be dead if you check \`/howgay\` on me, right?" -<@786816081032773662>`,
        img: ImgList.Rejected.None.value,
        ctx: ImgList.Rejected.None.ctx
    },
    {
        id: '732131110255067198', //paytouse
        desc: `<:MomoiNi:1243212431661076520> You wanna test the \`/howgay\` command on <@732131110255067198>? My big brother? You can't do that! Big bro is not gay!`,
        img: ImgList.Rejected.None.value,
        ctx: ImgList.Rejected.None.ctx
    },
    {
        id: '999614067322925087', //welpyes
        desc: `<a:YaeSlap:1251733720600412240> Oi, you can't check \`/howgay\` command on <@999614067322925087>, please go check someone else!`,
        img: ImgList.Rejected.None.value,
        ctx: ImgList.Rejected.None.ctx
    },
    {
        id: '790882475173609472', //megaminxup
        desc: `<:mikacopium:1254110047831720058> You wanna check the \`/howgay\` command on <@790882475173609472>? Hell no! This guy belongs to Misono Mika!`,
        img: ImgList.Rejected.None.value,
        ctx: ImgList.Rejected.None.ctx
    },
    {
        id: '361673191199997954', //hyanna.
        desc: `<a:YaeSlap:1251733720600412240> Oi, you can't check \`/howgay\` command on <@999614067322925087>, please go check someone else!`,
        img: ImgList.Rejected.None.value,
        ctx: ImgList.Rejected.None.ctx
    },
    {
        id: '879893732302921738', //tacos727
        desc: `<:SeiaMuted:1244890584276008970> I see then, so you're gonna test the \`/howgay\` command on <@879893732302921738>? There's no need my guy, HE IS ALREADY CERTIFIED GAY!!!`,
        img: ImgList.Rejected.Tacos.value,
        ctx: ImgList.Rejected.Tacos.ctx
    },
    {
        id: '1206234286056017923', //quocminh._
        desc: `<:SeiaL:1355916415529521213> Oya? Checking \`/howgay\` command on <@1206234286056017923>? After you see me going out with **Neru** from Millennium Sciene School gotcha mad?\nDon't worry, a wise artist said: *"Men and women don't matter as long as they're happy"*, right?\nSo, no need to shy, my guy, even my dad is also me, don't wory, he is NOT GAY as you are... and it's ALWAYS has been.`,
        img: ImgList.Rejected.QuocMinh.value,
        ctx: ImgList.Rejected.QuocMinh.ctx
    }
]

/*
Denied Cases:
[0] User_ID
[1] Msg
*/

module.exports = (Denied_Cases)