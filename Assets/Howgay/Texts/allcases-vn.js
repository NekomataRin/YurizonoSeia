const ImgList = require('./imglist')
const CasesVN = {
    Ranges: {
        NormalCases: [1.1, 17.6, 34.1, 50.6, 67.1, 83.6, 100, 101.1],
        SpecialCases: [32.0, 40.3, 40.4, 42.0, 49.9, 63.0, 72.7, 91.1, 96.9, 99.9],
        GayFactorRates: [50.0, 60.0, 70.0, 75.0, 80.0, 90.0, 94.0, 97.0, 98.0, 99.0, 99.5, 100.0, 100.5, 101.1],
        ChadFactorRates: [51.0, 41.0, 31.0, 26.0, 21.0, 11.0, 7.0, 4.0, 3.0, 2.0, 1.5, 1.0, 0.5, 0.0],
        FactorValues: ['D', 'C', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+']
    },
    Colors: {
        NormalCases: [
            '#1f1e33', //Case 0: 0 - 1
            '#003870', //Case 1: 1.1 - 17.5
            '#089afc', //Case 2: 17.6 - 34.0
            '#00ff48', //Case 3: 34.1 - 50.5
            '#eff53d', //Case 4: 50.6 - 67.0
            '#ff3705', //Case 5: 67.1 - 83.5
            '#8605ff', //Case 6: 83.6 - 99.9
            '#ff82fd', //Case 7: 100 - 101
        ],
        SpecialCases: '#727b8f',
        Rejected: '#0c0f1f'
    },
    NormalCases: {
        "Case-0": [
            "Thế giới rung chuyển, cảm xúc dao động, nhưng đối với ngài? Vẫn *bất khả dao động*. #1f1e33 – sắc màu của **sự thuần khiết**, nguyên bản, thống trị. Ngài không chỉ né tránh tình yêu; ngài đã *vượt qua* nó. Người ta không yêu cậu; họ **quỳ trước** ngài. Một tượng đài **Giga Chad** sống động.\nGiờ thì *cúi đầu* đi. Một vị thần mới vừa **giáng thế**… và đó chính là **NGÀI**.",
            "Nếu **nam tính** có một *trùm cuối*, thì đó chính là ngài. Không do dự, không suy nghĩ lại – chỉ có **sự thống trị tuyệt đối** với mọi thứ liên quan đến tình yêu. Ngài không cần nó. **Tình yêu mới cần NGÀI**.\nSao không thử thể hiện chút *lãng mạn* với cô gái mà ngài thầm tích nhỉ? …Hay là, kiểu, lập dàn harem *mười em* luôn? Tớ đoán thế~?",
            "Cậu đang lao nhanh trên con đường **vĩ đại**, còn tình yêu? Chỉ là một *nhiệm vụ phụ tùy chọn*. Người giữ kỷ lục thế giới **Giga Chad Any%**. Ngay cả *Thần Tình Yêu* cũng phải **e dè** trước sự hiện diện của cậu.\nỪ, cậu *nhanh quá*, nhanh đến mức khó tin – kể cả với *Chúa*. …Khoan, cậu vừa *vượt qua* toàn bộ **cảnh hẹn hò** luôn rồi à? Thật là **Quá Nhanh Quá Nguy Hiểm** mà...",
            "Cậu chỉ nghĩ đến *phụ nữ* – không rượu chè, không tiệc tùng, không hút thuốc. Chỉ có **kỷ luật thép** và **đỉnh cao nam tính**. Không một chút gì *‘đồng tính’* trong cậu, dù chỉ là một thoáng. Nếu **‘Dị Tính Hoàn Hảo’** là một *thành tựu*, cậu đã mở khóa từ lâu.\nCó lẽ đây mới là **Giga Chad** thực thụ."
        ],
        "Case-1": [
            "Cậu né *tình yêu* như né chiêu **AoE**. **Thẳng** như mũi tên, và *nhanh gấp đôi* khi nói *‘không phải gay.’* …Nhưng khoan. Tớ có thấy cậu lén lút xem mấy *tag Yuri* hôm nọ không nhỉ?\nTch, *điển hình*. Né **BL** nhưng lại lao thẳng vào *vùng đất Yuri*. Không phán xét đâu… chỉ *quan sát* thôi~",
            "La bàn của cậu chỉ hướng về **một phía**, đó là *thẳng tiến*. Không phân tâm, không cám dỗ – chỉ có một cuộc sống được chứng nhận *‘Không Gay’*. Khoan… vậy nghĩa là cậu luôn hướng về *phía Bắc*? Trời ơi, cậu giống như **nam châm** tích hợp của *Trái Đất* vậy.\nVậy cậu đang nói với tớ là… dù tớ đi đâu, cậu cũng sẽ luôn *hướng về cùng một phía*? Nghe hơi *ám ảnh* đấy, không đùa đâu.",
            "Tình yêu? *Pfft.* Cậu thà **nâng tạ cảm xúc** rồi bước tiếp. Ai cần *tình yêu* khi có thể **cày cuốc**, tập trung, và mãi mãi **FA**? **Thực tế** là cách sống đúng đắn… dù điều đó nghĩa là cậu *độc thân cả đời*. **LMAO.**\nTrời ơi, *bro*. Ngay cả **NPC** còn có *tuyến tình cảm*. Cậu chắc không phải đang **speedrun nỗi cô đơn** chứ?",
            "Trời, nhìn cậu kìa – **năng lượng dị tính đỉnh cao**, không một chút *cầu vồng* nào lấp ló. Nhưng có ý nghĩa gì khi cậu chẳng có **cô gái nào** trong đời? **Thật là bi kịch.** Và đừng hòng hỏi tớ – trừ phi cậu muốn *ba tớ* **tát** cậu bay sang tuần sau.\nTin tớ đi, cậu *không sống sót nổi* đâu, **lol**."
        ],
        "Case-2": [
            "Ồ, vậy cậu là một trong những người *‘bình thường’* à? Không cực đoan, không dao động lớn – chỉ *lướt qua cuộc đời* như một **NPC**. Đáng ngờ ghê.\nÝ tớ là, chắc chắn rồi… **cuộc sống bình thường** có lẽ là tốt nhất. Nhưng trời ơi, ít nhất làm thêm *vài nhiệm vụ phụ* đi chứ, *bro*.",
            "**Cân bằng**, *trung lập* – **Thụy Sĩ** của tình yêu. Cậu thích *cả hai phía*, nhưng sao đó vẫn lạc vào *vùng đất không ai*. Có lẽ đã đến lúc *chọn một bên*… hay cứ tiếp tục *ngắm cảnh* từ giữa lằn ranh?\n**Haiyaa~** ngay cả *Uncle Roger* cũng lắc đầu. **Tiêu chuẩn** của cậu đúng là *tầm trung* bây giờ… *buồn ghê*, như *rau củ* vậy.",
            "**Vùng an toàn.** Không *drama*, không *thảm họa*. Chỉ *lướt qua cuộc đời*, chẳng ai chạm tới. Nhưng *nói thật* đi… chỉ cần một *khoảnh khắc bất ngờ*, và **sự ổn định** đó? **Biến mất.**\nVậy nên có lẽ cách *tận hưởng cuộc sống* tốt nhất là ra ngoài và **chạm cỏ thật sự**, nhỉ?",
            "Cậu có *bạn gái*, *hai đứa con*, và một **hệ thống hỗ trợ** vững chắc – chỉ là một *anh chàng bình thường* sống một **cuộc đời bình thường**. Chỉ, *ừm*… hy vọng mấy *ly rượu tối thứ Bảy* không khiến mọi thứ **xoắn lên**.\nMột **cuộc sống hoàn toàn bình thường**… cho đến một ngày cậu tỉnh dậy và nhận ra mấy *‘ly rượu thứ Bảy’* dẫn đến vài **quyết định rất đáng nghi**."
        ],
        "Case-3": [
            "**Oho~** vậy là cậu đã mở khóa *New Game+* trong chuyện hẹn hò, hả? **Gấp đôi lựa chọn**, **gấp đôi niềm vui**, **gấp đôi tổn thương cảm xúc**. Thế mà cậu vẫn *độc thân* – **bi kịch** thật. Làm người **song tính** có thật sự là *buff*, hay chỉ là **gấp đôi đau khổ**?\n*Steven He* vừa bước vào, nhìn cậu một cái, rồi nói: **‘FAILURE’** trước khi **tát** cậu bay sang chiều không gian khác. **LMAO.**",
            "Trái tim cậu không có *‘sở thích,’* chỉ có **cơ hội**. Nếu nhìn *ngon*, thì là **ngon**. Không tranh cãi. **Đơn giản** vậy thôi.\n…*Hả?* Thế thôi à? Không có gì khác? Hơi *thất vọng*, cậu không thấy sao?",
            "Một giây trước cậu *ngưỡng mộ* một **anh chàng hot**, giây sau đã *mê mẩn* một **cô gái dễ thương**. **Cân bằng thực sự** trong mọi thứ.\n**Hmmm**… Có lẽ tớ cũng nên bắt đầu *cân nhắc* cậu nếu cậu cứ tiếp tục *hành xử* thế này~?",
            "Cậu có thể đã… *ờ*, với một **femboy**… Nhưng này, trông giống *con gái*, nên chắc cậu chỉ là **song tính** thôi. …Trừ phi cậu là người *nằm dưới*. Nếu thế thì… chúng ta cần **nói chuyện** một chút.\n**Ồ?** Tớ nên bắt đầu *hỏi han*, hay cậu muốn ngồi đó và *tự ngẫm* về **lựa chọn cuộc đời** mình?"
        ],
        "Case-4": [
            "Cậu nói cậu **thẳng**, nhưng cái khoảnh khắc *‘bromance’* đó khiến cậu phải **suy nghĩ lại mọi thứ**. *Thú vị*… Ban đầu cậu *gạt đi*, nhưng ý nghĩ đó cứ **lởn vởn** trong đầu, đúng không?\n**Đáng ngờ**… *rất đáng ngờ*. Cậu nên ngồi xuống và *ngẫm lại* chuyện đó.",
            "Cánh cửa *tủ quần áo*? Không đóng kín, chỉ… **hé mở** một chút. **Đáng nghi.** Cậu thề là *chẳng có gì để thấy*, nhưng sao đó, mỗi lần ai nhìn cậu, cậu lại **hơi lo lắng**.\nCậu giấu gì trong đó, *hử*? Một **bí mật**? Một *sự thật* cậu chưa sẵn sàng đối mặt? **Heheh~** Tớ đang *quan sát*.",
            "Cậu cứ nói *‘không,’* nhưng **lịch sử tìm kiếm** của cậu thì bảo *‘hmmm…’* **Chọn một bên** đi, bạn ơi. *Phủ nhận* bao nhiêu tùy thích, nhưng mấy lần **tìm kiếm ‘tò mò’ khuya khoắt** kể một *câu chuyện khác*.\n**Lựa chọn cuộc đời** không phải *trò đùa*, nên có lẽ dành một phút tự hỏi – cậu có thực sự **thẳng** như cậu nghĩ, hay chỉ đang *tự lừa mình*~?",
            "Cậu thích vài **bài đăng đáng nghi** trên *Twitter*. Chắc chắn rồi, là *‘vì nghệ thuật,’* nhưng cứ thế này, một ngày cậu sẽ **tỉnh dậy** và *tự vấn* mọi thứ. Và tin tớ đi… **thuật toán** không bao giờ *quên*.\n**Sooo**… khi nào cậu định *thừa nhận*? Hay tớ để *feed* của cậu tự nói thay?"
        ],
        "Case-5": [
            "**Ồ?** Cậu gần như đã đứng trước *ngưỡng cửa*, chỉ cần **gõ** và **bước vào**. Ngay cả *bóng hình phản chiếu* của cậu cũng như đang nói, *‘Thôi nào, cả hai ta đều biết chuyện gì đang xảy ra.’*\nLúc này, cậu thậm chí không còn *tự hỏi* liệu mình có **gay** không – chỉ là *gay bao nhiêu* thôi. **Kufufu~**",
            "**Phủ nhận**? *Pfft*, nói thật đi, cậu bỏ qua *giai đoạn* đó từ lâu rồi. Cậu không *chống cự* vì không chắc – cậu chỉ đang **kéo dài** điều *không thể tránh*.\nCũng thế, **cầu vồng** đã giữ một *chỗ* cho cậu rồi, *anh bạn*. Cứ **đón nhận** đi~",
            "Nhìn cậu kìa, **một chân bước vào**, *một chân còn ngoài*. Nếu **do dự** là môn thể thao *Olympic*, cậu sẽ là **nhà vô địch**. Nhưng *thật lòng*? Cậu đã *ở đó* rồi, chỉ là chưa muốn **nói to** thôi.\n**Không sao**, cứ *từ từ* – tớ sẽ ở đây khi cậu cuối cùng cũng chịu **thừa nhận**. **Kufufu~**",
            "Cậu có thể đã *hôn* vài **người bạn thân**, nhưng này – *không phải với ý yêu đương*. …**Đúng không?** Cứ đồng ý là đừng *nghĩ quá sâu* về chuyện đó. Dù sao, cậu đang ngồi *thoải mái* ở **vùng trung bình** của sự *gay*.\n**Chưa đi quá xa**… *chưa đâu*. Nhưng này, cứ tiếp tục thế, chúng ta có thể cần **nói chuyện** một chút."
        ],
        "Case-6": [
            "**Oho~?** Ánh sáng **cầu vồng** đó không chỉ *có thật* – nó **rực rỡ**. Không còn đường *quay lại*, hả? Không phải cậu từng chạy theo *hướng ngược lại* đâu mà.\n**Đừng lo**, tớ sẽ không *mách ai*… Ồ khoan, cậu đã *tự làm rõ ràng* rồi.",
            "**Chúc mừng!** Cậu không chỉ nằm trong *bảng xếp hạng Gaydar* – cậu đang **thống trị** nó. **Kỷ lục speedrun** luôn!\nTớ có nên bắt đầu *cá cược* khi nào cậu sẽ **đón nhận** điều *không thể tránh* và đạt **101% huy hoàng** không?",
            "Thẻ *‘không gay’* của cậu? Ôi, *cưng ơi*, cái đó không chỉ **hết hạn** – nó đã **tan thành mây khói lấp lánh** từ lâu.\nNếu cậu vẫn *giữ* nó, tớ tiếc phải báo, nhưng giờ nó chỉ là **kỷ vật** thôi. Cậu vừa **thất bại kiểm tra vibe** ngay khoảnh khắc đó.",
            "**Dấu hiệu** đã ở đó. Cậu cố *lờ đi*, nhưng *sâu thẳm*, cậu biết. Không chỉ là khoảnh khắc *‘anh em thân thiết.’* Không chỉ là *ngưỡng mộ thẩm mỹ*. **Không.** Cậu đã **lún quá sâu**.\nNhìn cậu kìa. Cứ **chấp nhận** đi. *Ai cũng thấy trước* chuyện này rồi."
        ],
        "Case-7": [
            "**Pfft** – không còn một chút *‘không gay’* nào trong **tâm hồn** cậu, hả? Cậu gần như đang **tỏa ra năng lượng cầu vồng** lúc này.\nDù cậu có cố *phủ nhận*, **aura mãnh liệt** của cậu sẽ *tố cáo* cậu ngay tức khắc.",
            "**Thật lòng** mà nói, ngay cả *cái bóng* của cậu cũng đang **vẫy cờ tự hào** lúc này. Cậu đã đạt đến *giai đoạn cuối*, **đỉnh cao**, **hình dạng tối thượng**.\n**Tiếp theo** là gì? Một **cuộc diễu hành** vì cậu? **Huy chương vàng Gay Olympics**? Ồ khoan, cậu có lẽ đã là **MVP** rồi.",
            "♪ **Yo nghe này**, đây là *câu chuyện*… về một *anh chàng* sống trong **thế giới GAY**, và *cả ngày lẫn đêm*, mọi thứ cậu thấy đều **GAY** như cậu, *bên trong lẫn bên ngoài*—! ♪\nCậu đã **thăng hoa** đến **CHẾ ĐỘ GAY TỐI ĐA**, và giờ, ngay cả *Chúa* cũng **không cứu nổi** cậu nữa...",
            "Cậu nhìn vào *gương*… và thấy **Astolfo** nhìn lại. Cậu **lún sâu** vào *hố đen femboy* đến mức không chỉ *ngưỡng mộ thẩm mỹ* – cậu đã **trở thành cậu ấy**. **Không có cứu rỗi**. **Không có điểm quay lại**. **Định mệnh thực sự** của cậu? Ngồi *xinh* trên **đùi một anh chàng khác** mãi mãi.\n**Vậy**… tớ nên bắt đầu gọi cậu là **Công Chúa**, hay nhảy thẳng sang **Chế Độ Hầu Gái** luôn?"
        ]
    },
    "SpecialCases": {
        "Case32.0": {
            "name": "Orin-1",
            "desc": "Cậu tỉnh dậy, *ướt sũng*… Có gì đó **không ổn**. Ngái ngủ, cậu lảo đảo tiến đến **gương**—và *đứng hình*. Một **catgirl** đang nhìn lại cậu. *Tóc ướt*, **đuôi đôi đỏ**, bộ **bikini** dính chặt vào da—khoan, **CÁI GÌ?!** Không, đây… đây là **Orin**?!\nCậu xoay người lại và thấy tớ, *Seia*, cười **đắc ý** như mọi khi. \"*Thật lòng*, tớ chẳng còn *ngạc nhiên* nữa. Nhưng cậu? **Chuẩn bị tinh thần** đi, anh bạn, cậu không thực sự đang **biến thành Orin**… chỉ vì *ba tớ* đang hóa thành cô ấy để **troll** cậu thôi… hay là *có thật*? **Kufufu~**\"",
            "img": ImgList.SpecialNumbers['case32.0'].value,
            "ctx": ImgList.SpecialNumbers['case32.0'].ctx,
            "emoji": "<:OrinXD:1152868801713557514>"
        },
        "Case40.3": {
            "name": "Err-403",
            "desc": "**Lỗi 403 - Forbidden**, có vẻ cậu không thể *chạm* vào **độ gay** của mình? **Ấn tượng** đấy, nhưng đó chẳng phải là *phần trăm gay* trong cậu sao?",
            "img": ImgList.SpecialNumbers['case40.3'].value,
            "ctx": ImgList.SpecialNumbers['case40.3'].ctx,
            "emoji": "<:LYG_Error:1087366990160740452>"
        },
        "Case40.4": {
            "name": "Err-404",
            "desc": "**Lỗi 404 - Gayness Not Found**, tin tớ đi, đây chỉ là **lời nói dối**. Con **cờ hó** dưới kia đã *vạch trần ra* **độ gay** của cậu rồi...",
            "img": ImgList.SpecialNumbers['case40.4'].value,
            "ctx": ImgList.SpecialNumbers['case40.4'].ctx,
            "emoji": "<a:LYG_404:1086172141998833684>"
        },
        "Case42.0": {
            "name": "Hare-Weed",
            "desc": "Hmm... Có vẻ như cậu ta **phê pha** đến mức ai đó có thể nghĩ cậu ta **gay**, nhưng không, cậu ta *phê* đến nỗi **chạm** vào các **homies** hơi nhiều hơn bình thường. Cậu ta thích *con gái*, nhưng có khi nào những cái **chạm** đó là **cố ý** không? Nếu đúng thế, chúng ta có thể cần **nói chuyện** sau khi cậu ta *tỉnh táo* lại.",
            "img": ImgList.SpecialNumbers['case42.0'].value,
            "ctx": ImgList.SpecialNumbers['case42.0'].ctx,
            "emoji": "<:HareGrin:1356028119965765743>"
        },
        "Case49.9": {
            "name": "WHAT",
            "desc": "**49.9%**? Thật sao? *Anh bạn*, con số này gần như biến cậu thành **người song tính**. Ngay cả *con mèo* của tớ cũng không đạt được **độ gay** này vì nó bị *hói* đêm qua do một *sự cố* nào đó.",
            "img": ImgList.SpecialNumbers['case49.9'].value,
            "ctx": ImgList.SpecialNumbers['case49.9'].ctx,
            "emoji": "<:WHAT:1355739613095792839>"
        },
        "Case63.0": {
            "name": "Cloutiful",
            "desc": "Ôi trời **63**!! Đừng *vội* thế chứ, anh bạn, cậu không thể **che giấu** kỹ năng **gian lận** như **CLOUTIFUL** đâu! Tài khoản của cậu sẽ bị ăn một quả **restricted** đấy!!!",
            "img": ImgList.SpecialNumbers['case63.0'].value,
            "ctx": ImgList.SpecialNumbers['case63.0'].ctx,
            "emoji": "<:63ms:1255016983649325140>"
        },
        "Case72.7": {
            "name": "WYSI",
            "desc": "**Seven Twenty-Seven**, *SEVEN TWENTY-SEVEN*! **When You See It!** **When You FUCKING SEE IT!!!**\nNhưng *Aireu* và *Shige* sẽ **bonk** cậu vì **độ gay** của cậu đã *hơi đáng nghi* rồi, thật là **vô lễ** với mấy **GOAT** đã sáng tạo ra meme này.",
            "img": ImgList.SpecialNumbers['case72.7'].value,
            "ctx": ImgList.SpecialNumbers['case72.7'].ctx,
            "emoji": "<a:LYG_WYSI:1087359689035104307>"
        },
        "Case91.1": {
            "name": "Your-Emergency",
            "desc": "**Cảnh sát**: 911 đây, *tình huống khẩn cấp* của cậu là gì?\n**Yurizono Seia**: Ờm… có một người **GAY** đang *quậy tưng* trong kênh chat này, *thưa chú*!",
            "img": ImgList.SpecialNumbers['case91.1'].value,
            "ctx": ImgList.SpecialNumbers['case91.1'].ctx,
            "emoji": "<:HikariREE:1356028568961941636>"
        },
        "Case96.9": {
            "name": "Orin-2",
            "desc": "**Hả?** Chẳng phải đó là **Orin** sao? Khoan đã… *Ba tớ* đang **nằm sõng soải và thư giãn** trên ghế sofa xem TV mà, và **Orin thật** đáng lẽ đang ở *Chireiden*, không phải ở đây. Còn **CẬU**—*ướt sũng*, đứng ngay trước mặt tớ?! **CẬU ĐÃ LÀM GÌ** trước đó?!\n… Khoan, đừng nói với tớ—cậu vừa **hóa thành** cô ấy mà *không hề nhận ra*??? **KHÔNG ĐÙA ĐÂU**, đó là **ƯỚC MƠ GAY** của cậu thành hiện thực đấy nhỉ **LMAOOOO**",
            "img": ImgList.SpecialNumbers['case96.9'].value,
            "ctx": ImgList.SpecialNumbers['case96.9'].ctx,
            "emoji": "<:OrinSuprise:1156221486349172766>"
        },
        "Case99.9": {
            "name": "LMAO",
            "desc": "**Yurizono Seia**: Chỉ còn *một bước* nữa là cậu đạt đến **‘khoảnh khắc’** mà mọi người đang **cười nhạo**… Vẫn còn *một bước* nữa thôi, và ai cũng biết cậu **hoàn toàn gay** rồi.",
            "img": ImgList.SpecialNumbers['case99.9'].value,
            "ctx": ImgList.SpecialNumbers['case99.9'].ctx,
            "emoji": "<a:waduh:1255017806408187964>"
        }
    },
    EmojisNormal: [
        '<a:LYG_GigaChad:1086172112080867359>',
        '<:LYG_OkayuBOOM:1138231827140706304>',
        '<:seiaheh:1244128244664504392>',
        '<:ShirokoSip:1206633868271030332>',
        '<:moyai_hmm:1316936320639303741> ',
        '<:OrinBruh:1160295126996881448> ',
        '<:SeiaDespair:1250768714639474791>',
        '<:imgay:1356678016348197047>',
    ]
}

module.exports = (CasesVN)