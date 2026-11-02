/*
/shiprate results: the first tier with rate <= Max is used, one of its comments is picked at random.
Emoji + color per tier. Add a comment = add a line in both languages.
*/
const Tiers = [
    { Max: 1, Color: '#000000', Emoji: '<:OrinWorry:1152868572499034203>' },
    { Max: 30, Color: 'Red', Emoji: '<:SeiaBlank:1244890260215955486>' },
    { Max: 60, Color: 'Yellow', Emoji: '<:LaylaHmm:1053640028049387620>' },
    { Max: 90, Color: 'Green', Emoji: '<:OkuuWut:1183327798509703289>' },
    { Max: 100, Color: 'Blue', Emoji: '<:KoishiSleep:1183319017709113456>' },
    { Max: 101, Color: 'Purple', Emoji: '<a:LYG_OkayuLove:1087692048280334347>' }
]

const Comments = {
    'vi': [
        [
            'Ai chà, vận mệnh của hai bạn như chó với mèo ý, cãi nhau suốt hoài à, thôi né ra né ra đi, cả server đang yên ổn mà...',
            'Yabe, hai người có thù oán gì với nhau không thế hả? Trời ạ...',
            'Coi bộ số kiếp này hai bạn không hợp nhau rồi, thôi kiếm người khác đi nhá'
        ],
        [
            'Người dưng chốn xa lạ, có thể chưa từng gặp nhau, chắc là do duyên phận ha',
            'Hmm... coi bộ hai người cũng chỉ mới gặp nhau gần đây, chưa quen lắm, nhỉ?',
            'Có vẻ như, có vẻ như, các bạn có mối quan hệ không tốt lắm nhỉ?'
        ],
        [
            'Bạn bè, chắc là vậy, em nghĩ hai bạn cũng chỉ đến mức độ này thôi ha',
            'Nếu như hai bạn thân thiết với nhau hơn nữa nhỉ... À mà thôi, bạn bè với nhau thì phải trong sáng chứ',
            'Coi bộ hai người hợp tác trên phương diện bạn bè cũng tốt đấy chứ nhỉ?'
        ],
        [
            'Bạn thân sao? Nghe có vẻ hợp đấy, hoà thuận phết chứ nhỉ? Chúc hai bạn vui vẻ nhé!',
            'Qua được mốc bạn bè là bạn thân rồi, thế thì... mong tình bạn của hai bạn mãi bền chặt nhé!',
            'Bao giờ bạn trai mới tỏ tình bạn gái thế? Đùa thôi, mức độ bạn thân này đã tốt lắm rồi nhé!'
        ],
        [
            'Hả? Gì cơ? Hai bạn hợp nhau đến mức độ này cơ á??? Trời ạ, sao không nói cho cả server biết?',
            'Wow, hai bạn hợp đôi hợp tính thế? Thế đã chính thức là người yêu của nhau chưa?',
            'Dude, ông bạn ga lăng đấy, gây dựng mối quan hệ tốt phết cho nửa kia của mình nhỉ? Hehe, mong hai người vẫn hợp nhau nhé!'
        ],
        [
            'Người tình đích thực là đây chứ đâu? Thế thì câu hỏi muôn thuở, bao giờ mới cưới nhau đấy?',
            'Thực tế cho thấy rằng hai bạn rất hợp nhau về mọi mặt, chắc hẳn đã trải qua nhiều sóng gió lắm nhỉ?',
            'Ể? À rế? Hai bạn đã quyết định cùng nhau đi đến hết cuộc đời rồi á? Giá mà em được nhận thiệp cưới từ hai bạn nhỉ...'
        ]
    ],
    'en-US': [
        [
            'Oh my, you two are like cats and dogs, always fighting... Step apart please, the whole server was at peace...',
            'Yabe, do you two hold some kind of grudge against each other? Good grief...',
            'Looks like you two just aren\'t meant for each other in this life, go find someone else'
        ],
        [
            'Total strangers, maybe you\'ve never even met, guess that\'s fate',
            'Hmm... looks like you two only met recently and don\'t know each other that well, right?',
            'It seems, it seems... your relationship isn\'t that great, huh?'
        ],
        [
            'Friends, I guess, I think this is about as far as you two go',
            'If only you two were a bit closer... Never mind, friends should stay pure',
            'Looks like you two get along pretty well as friends, don\'t you?'
        ],
        [
            'Best friends? Sounds like a good match, you get along really well! Have fun, you two!',
            'Past friends and into best friends, so... may your friendship last forever!',
            'So when is he confessing to her? Just kidding, being this close is already great!'
        ],
        [
            'Huh? What? You two match THIS well??? Good grief, why didn\'t you tell the whole server?',
            'Wow, a perfect match in every way? So are you officially a couple yet?',
            'Dude, what a gentleman, building such a nice relationship with your other half, huh? Hehe, hope you two stay this close!'
        ],
        [
            'True love, right here! So the eternal question: when\'s the wedding?',
            'Facts show you two match perfectly in every way, you must have been through a lot together, huh?',
            'Eh? Are? You two already decided to spend your whole lives together? If only I could get a wedding invitation from you two...'
        ]
    ]
}

module.exports = { Tiers, Comments }
