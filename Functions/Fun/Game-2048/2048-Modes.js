/*
Game 2048 modes (desc = English, descVi = Vietnamese)
- Hidden: after 5 moves the board is hidden, it shows up again for 2 moves out of every 7
          (the newest tile is always shown)
- Swap: every 5 moves, 2 random tiles swap places (the swapped tiles are always shown)
*/
const Game2048_Modes = {
    default: {
        name: 'Default',
        desc: 'This is the default mode, no modifications at all. Suitable for everyone',
        descVi: 'Chế độ mặc định, không có thay đổi gì cả. Phù hợp với mọi người',
        hidden: false,
        swap: false
    },
    hidden: {
        name: 'Hidden',
        desc: 'The board will be hidden after 5 moves. It will stay hidden for 5 moves, and will be shown for 2 moves then hidden again. It will require your memory skills, so good luck!',
        descVi: 'Bàn cờ bị ẩn sau 5 nước đi: ẩn trong 5 nước, hiện lại 2 nước rồi lại ẩn. Cần trí nhớ tốt đấy, chúc may mắn!',
        hidden: true,
        swap: false
    },
    swap: {
        name: 'Swap',
        desc: 'The board will swap randomly 2 pieces after each 5 moves. Good luck with your rng, lmao.',
        descVi: 'Cứ mỗi 5 nước đi, 2 ô ngẫu nhiên sẽ đổi chỗ cho nhau. Chúc nhân phẩm tốt nhé, lmao.',
        hidden: false,
        swap: true
    },
    anomaly: {
        name: 'Anomaly',
        desc: 'Combo of Hidden and Swap, no need to explain further. This is insanely hard, not recommended for you to play it, unless you aren\'t normalhuman.',
        descVi: 'Kết hợp Hidden và Swap, khỏi giải thích thêm. Khó vô cùng, không khuyến khích chơi trừ khi bạn không phải người bình thường.',
        hidden: true,
        swap: true
    }
}

module.exports = (Game2048_Modes)
