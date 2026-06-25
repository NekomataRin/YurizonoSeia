const ImgList = require('./imglist')

const Denied_CasesVN = [
    {
        "id": "1244213929438089286",
        "desc": "<:SeiaMuted:1244890584276008970> Cậu muốn thử lệnh **`/howgay`** trên tớ (<@1244213929438089286>) sao? **BA ƠI!!!** ĐỨA **KẺ LẠ** NÀY ĐANG CỐ TÌM XEM ĐỨA CON CỦA MÌNH **GAY** CỠ NÀO ĐẤY!!!!",
        "img": ImgList.Rejected.Seia.value,
        "ctx": ImgList.Rejected.Seia.ctx
    },
    {
        "id": "751225225047179324",
        "desc": "<:MuraAngry:1519660811776167940> Ừ thì... sao cậu lại kiểm tra **`/howgay`** trên <@751225225047179324>? Khi cậu *đã biết* là ông ấy **không thể bị kiểm tra** rồi mà?",
        "img": ImgList.Rejected.Rin.value,
        "ctx": ImgList.Rejected.Rin.ctx
    },
    {
        "id": "786816081032773662",
        "desc": "<:WakamoEvil:1275016475257733121> \"*Hừm*, cậu thật sự muốn **chết** nếu kiểm tra **`/howgay`** trên tui, đúng không?\" -<@786816081032773662>",
        "img": ImgList.Rejected.Wakamo.value,
        "ctx": ImgList.Rejected.Wakamo.ctx
    },
    {
        "id": "999614067322925087",
        "desc": "<a:YaeSlap:1251733720600412240> *Này*, cậu không thể dùng lệnh **`/howgay`** trên <@999614067322925087> đâu, đi kiểm tra **người khác** đi nhé!",
        "img": ImgList.Rejected.None.value,
        "ctx": ImgList.Rejected.None.ctx
    },
    {
        "id": "452041256319582208",
        "desc": "<a:YaeSlap:1251733720600412240> *Này*, cậu không thể dùng lệnh **`/howgay`** trên <@452041256319582208> đâu, đi kiểm tra **người khác** đi nhé!",
        "img": ImgList.Rejected.None.value,
        "ctx": ImgList.Rejected.None.ctx
    },
    {
        "id": "790882475173609472",
        "desc": "<:mikacopium:1254110047831720058> Cậu muốn kiểm tra lệnh **`/howgay`** trên <@790882475173609472> ư? **Không đời nào!** Khứa này thuộc về **Misono Mika** rồi!",
        "img": ImgList.Rejected.Mika.value,
        "ctx": ImgList.Rejected.Mika.ctx
    },
    {
        "id": "1365442209070972988",
        "desc": "<:mikacopium:1254110047831720058> Cậu muốn kiểm tra lệnh **`/howgay`** trên <@1365442209070972988> ư? **Không đời nào!** Khứa này thuộc về **Misono Mika** rồi!",
        "img": ImgList.Rejected.Mika.value,
        "ctx": ImgList.Rejected.Mika.ctx
    },
    {
        "id": "548041429411430440",
        "desc": "<:SeiaL:1355916415529521213> *Oya?* Kiểm tra lệnh **`/howgay`** trên <@548041429411430440>? Sau khi thấy tớ đi chơi với **Neru** từ **Millennium Science School** làm cậu **phát điên** à?\nĐừng lo, một *nghệ sĩ thông thái* đã nói: **\"Nam nữ quan trọng éo gì, sướng là được\"**, đúng không?\nVậy nên, đừng **ngại ngùng**, anh bạn, ngay cả *ba tớ* cũng là tớ, đừng lo, ông ấy **KHÔNG GAY** như cậu đâu... và điều đó **LUÔN LUÔN** là thế.",
        "img": ImgList.Rejected.Hirru.value,
        "ctx": ImgList.Rejected.Hirru.ctx
    },
    {
        "id": "892054339072438303",
        "desc": "<:AcidFAQ:1392733235699777597> Này nhá, tớ **KHÔNG** phải là nơi mà cậu check lệnh **`/howgay`** được đâu nhá! **Nghe đây, có cái TOAI mà check được nhá!**",
        "img": ImgList.Rejected.Acid.value,
        "ctx": ImgList.Rejected.Acid.ctx,
    },
    {
        "id": "420040094737760268",
        "desc": "<:Senko_Gun:1473176767782191245> Này. Đừng nghĩ đến chuyện check lệnh **`/howgay`** lên tau! Seia nó quá bịp với tau rồi còn gì!",
        "img": ImgList.Rejected.Mori.value,
        "ctx": ImgList.Rejected.Mori.ctx,
    }
]
/*
Denied Cases:
[0] User_ID
[1] Msg
*/

module.exports = (Denied_CasesVN)