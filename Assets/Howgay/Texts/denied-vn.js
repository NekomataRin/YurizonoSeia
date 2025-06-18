const ImgList = require('./imglist')

const Denied_CasesVN = [
    {
        "id": "1244213929438089286",
        "desc": "<:SeiaMuted:1244890584276008970> Cậu muốn thử lệnh **`/howgay`** trên tớ (<@1244213929438089286>) sao? **BA ƠI!!!** ĐỨA **KẺ LẠ** NÀY ĐANG CỐ TÌM XEM TỚ **GAY** CỠ NÀO ĐẤY!!!!",
        "img": ImgList.Rejected.Seia.value,
        "ctx": ImgList.Rejected.Seia.ctx
    },
    {
        "id": "751225225047179324",
        "desc": "<:CastoriceAngy:1360440200966176878> Vậy là ngay cả *ba tớ* cũng chọn **biện pháp cuối cùng** này... Ông ấy thật sự muốn cậu **'ra đi'** ngay và luôn... sao cậu lại kiểm tra **`/howgay`** trên <@751225225047179324>? Khi cậu *đã biết* là ông ấy **không thể bị kiểm tra** rồi mà?",
        "img": ImgList.Rejected.Rin.value,
        "ctx": ImgList.Rejected.Rin.ctx
    },
    {
        "id": "786816081032773662",
        "desc": "<:serikadisgust:1230835681224298546> \"*Hừm*, cậu thật sự muốn **chết** nếu kiểm tra **`/howgay`** trên tui, đúng không?\" -<@786816081032773662>",
        "img": ImgList.Rejected.None.value,
        "ctx": ImgList.Rejected.None.ctx
    },
    {
        "id": "999614067322925087",
        "desc": "<a:YaeSlap:1251733720600412240> *Này*, cậu không thể dùng lệnh **`/howgay`** trên <@999614067322925087> đâu, đi kiểm tra **người khác** đi nhé!",
        "img": ImgList.Rejected.None.value,
        "ctx": ImgList.Rejected.None.ctx
    },
    {
        "id": "790882475173609472",
        "desc": "<:mikacopium:1254110047831720058> Cậu muốn kiểm tra lệnh **`/howgay`** trên <@790882475173609472> ư? **Không đời nào!** Khứa này thuộc về **Misono Mika** rồi!",
        "img": ImgList.Rejected.None.value,
        "ctx": ImgList.Rejected.None.ctx
    },
    {
        "id": "1206234286056017923",
        "desc": "<:SeiaL:1355916415529521213> *Oya?* Kiểm tra lệnh **`/howgay`** trên <@1206234286056017923>? Sau khi thấy tớ đi chơi với **Neru** từ **Millennium Science School** làm cậu **phát điên** à?\nĐừng lo, một *nghệ sĩ thông thái* đã nói: **\"Nam nữ quan trọng éo gì, sướng là được\"**, đúng không?\nVậy nên, đừng **ngại ngùng**, anh bạn, ngay cả *ba tớ* cũng là tớ, đừng lo, ông ấy **KHÔNG GAY** như cậu đâu... và điều đó **LUÔN LUÔN** là thế.",
        "img": ImgList.Rejected.QuocMinh.value,
        "ctx": ImgList.Rejected.QuocMinh.ctx
    }
]
/*
Denied Cases:
[0] User_ID
[1] Msg
*/

module.exports = (Denied_CasesVN)