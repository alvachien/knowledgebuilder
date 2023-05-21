// Defintion of board
const boardDefinition: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const fortDefinition: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// 辅助数组，用于校验将（帅）、士（仕）、象（相）的走法是否合法
const legalSpan: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1,
  2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0,
];

// 辅助数组，用于校验马的走法是否合理。如果合理，返回对应马脚的方向；否则，返回0
const knightPin: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 0, -16, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0,
  0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

const kingDelta: number[] = [-16, -1, 1, 16];
const advisorDelta: number[] = [-17, -15, 15, 17];
const knightDelta = [
  [-33, -31],
  [-18, 14],
  [-14, 18],
  [31, 33],
];
const knightCheckDelta = [
  [-33, -18],
  [-31, -14],
  [14, 31],
  [18, 33],
];
// MVV/LVA每种子力的价值
const mvvValue: number[] = [50, 10, 10, 30, 40, 30, 20, 0];

// 棋子位置价值数组
const pieceValue = [
  [
    // 帅（与兵合并）
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 11, 13, 11, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 19, 24, 34, 42, 44, 42, 34,
    24, 19, 0, 0, 0, 0, 0, 0, 0, 19, 24, 32, 37, 37, 37, 32, 24, 19, 0, 0, 0, 0, 0, 0, 0, 19, 23, 27, 29, 30, 29, 27,
    23, 19, 0, 0, 0, 0, 0, 0, 0, 14, 18, 20, 27, 29, 27, 20, 18, 14, 0, 0, 0, 0, 0, 0, 0, 7, 0, 13, 0, 16, 0, 13, 0, 7,
    0, 0, 0, 0, 0, 0, 0, 7, 0, 7, 0, 15, 0, 7, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 15, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],
  [
    // 仕
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 20, 23, 20, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 20, 0, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    // 相
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 20, 23, 20, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 20, 0, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    // 马
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 90, 96, 90, 96, 90, 90, 90, 0, 0, 0, 0, 0, 0, 0, 90, 96, 103, 97, 94,
    97, 103, 96, 90, 0, 0, 0, 0, 0, 0, 0, 92, 98, 99, 103, 99, 103, 99, 98, 92, 0, 0, 0, 0, 0, 0, 0, 93, 108, 100, 107,
    100, 107, 100, 108, 93, 0, 0, 0, 0, 0, 0, 0, 90, 100, 99, 103, 104, 103, 99, 100, 90, 0, 0, 0, 0, 0, 0, 0, 90, 98,
    101, 102, 103, 102, 101, 98, 90, 0, 0, 0, 0, 0, 0, 0, 92, 94, 98, 95, 98, 95, 98, 94, 92, 0, 0, 0, 0, 0, 0, 0, 93,
    92, 94, 95, 92, 95, 94, 92, 93, 0, 0, 0, 0, 0, 0, 0, 85, 90, 92, 93, 78, 93, 92, 90, 85, 0, 0, 0, 0, 0, 0, 0, 88,
    85, 90, 88, 90, 88, 90, 85, 88, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    // 车
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 206, 208, 207, 213, 214, 213, 207, 208, 206, 0, 0, 0, 0, 0, 0, 0, 206, 212, 209,
    216, 233, 216, 209, 212, 206, 0, 0, 0, 0, 0, 0, 0, 206, 208, 207, 214, 216, 214, 207, 208, 206, 0, 0, 0, 0, 0, 0, 0,
    206, 213, 213, 216, 216, 216, 213, 213, 206, 0, 0, 0, 0, 0, 0, 0, 208, 211, 211, 214, 215, 214, 211, 211, 208, 0, 0,
    0, 0, 0, 0, 0, 208, 212, 212, 214, 215, 214, 212, 212, 208, 0, 0, 0, 0, 0, 0, 0, 204, 209, 204, 212, 214, 212, 204,
    209, 204, 0, 0, 0, 0, 0, 0, 0, 198, 208, 204, 212, 212, 212, 204, 208, 198, 0, 0, 0, 0, 0, 0, 0, 200, 208, 206, 212,
    200, 212, 206, 208, 200, 0, 0, 0, 0, 0, 0, 0, 194, 206, 204, 212, 200, 212, 204, 206, 194, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
  [
    // 炮
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 96, 91, 90, 91, 96, 100, 100, 0, 0, 0, 0, 0, 0, 0, 98, 98, 96, 92, 89,
    92, 96, 98, 98, 0, 0, 0, 0, 0, 0, 0, 97, 97, 96, 91, 92, 91, 96, 97, 97, 0, 0, 0, 0, 0, 0, 0, 96, 99, 99, 98, 100,
    98, 99, 99, 96, 0, 0, 0, 0, 0, 0, 0, 96, 96, 96, 96, 100, 96, 96, 96, 96, 0, 0, 0, 0, 0, 0, 0, 95, 96, 99, 96, 100,
    96, 99, 96, 95, 0, 0, 0, 0, 0, 0, 0, 96, 96, 96, 96, 96, 96, 96, 96, 96, 0, 0, 0, 0, 0, 0, 0, 97, 96, 100, 99, 101,
    99, 100, 96, 97, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 98, 98, 98, 98, 97, 96, 0, 0, 0, 0, 0, 0, 0, 96, 96, 97, 99, 99,
    99, 97, 96, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    // 兵（与帅合并）
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 11, 13, 11, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 19, 24, 34, 42, 44, 42, 34,
    24, 19, 0, 0, 0, 0, 0, 0, 0, 19, 24, 32, 37, 37, 37, 32, 24, 19, 0, 0, 0, 0, 0, 0, 0, 19, 23, 27, 29, 30, 29, 27,
    23, 19, 0, 0, 0, 0, 0, 0, 0, 14, 18, 20, 27, 29, 27, 20, 18, 14, 0, 0, 0, 0, 0, 0, 0, 7, 0, 13, 0, 16, 0, 13, 0, 7,
    0, 0, 0, 0, 0, 0, 0, 7, 0, 7, 0, 15, 0, 7, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 15, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],
];

// 帅 K 将 k king
// 仕 A 士 a advisor
// 相 B 象 b bishop
// 马 N 马 n knight
// 车 R 车 r rook
// 炮 C 炮 c cannon
// 兵 P 卒 p pawn
const PIECE_KING = 0; // 将
const PIECE_ADVISOR = 1; // 士
const PIECE_BISHOP = 2; // 象
const PIECE_KNIGHT = 3; // 马
const PIECE_ROOK = 4; // 车
const PIECE_CANNON = 5; // 炮
const PIECE_PAWN = 6; // 卒

const MATE_VALUE = 10000; // 最高分值
const BAN_VALUE = MATE_VALUE - 100; // 长将判负的分值
const WIN_VALUE = MATE_VALUE - 200; // 赢棋分值（高于此分值都是赢棋）
const DRAW_VALUE = 20; // 和棋时返回的分数(取负值)
const NULL_SAFE_MARGIN = 400; // 空步裁剪有效的最小优势
const NULL_OKAY_MARGIN = 200; // 可以进行空步裁剪的最小优势
const ADVANCED_VALUE = 3; // 先行权分值

// 棋盘范围
const RANK_TOP = 3;
const RANK_BOTTOM = 12;
const FILE_LEFT = 3;
const FILE_RIGHT = 11;

const ADD_PIECE = false;
const DEL_PIECE = true;

// Utility
export class ChineseChessUtil {
  public inBoard(pos: number): boolean {
    // IN_BOARD
    // 判断某位置是否在棋盘
    return boardDefinition[pos] !== 0;
  }

  public inFort(pos: number): boolean {
    // IN_FORT
    // 判断某位置是否在九宫
    return fortDefinition[pos] !== 0;
  }

  public getCoordiate(row: number, col: number): number {
    // COORD_XY
    return row + (col << 4);
  }

  public flipSquare(pos: number): number {
    // SQUARE_FLIP
    return 254 - pos;
  }

  public getColumnFromCoordinate(pos: number): number {
    // RANK_Y
    // 根据一维矩阵，获取二维矩阵行数
    return pos >> 4;
  }

  public getRowFromCoordinate(pos: number): number {
    // FILE_X
    // 根据一维矩阵，获取二维矩阵列数
    return pos & 15;
  }

  public flipRow(row: number): number {
    // FILE_FLIP
    return 14 - row;
  }

  public flipColumn(col: number): number {
    // RANK_FLIP
    return 15 - col;
  }

  public mirrorCoordinate(pos: number): number {
    // MIRROR_SQUARE
    return this.getCoordiate(this.flipRow(this.getRowFromCoordinate(pos)), this.getColumnFromCoordinate(pos));
  }

  public forwardCoordinate(pos: number, sd: number): number {
    // SQUARE_FORWARD
    // pos 是棋子位置，sd是走棋方（红方0，黑方1）。返回兵（卒）向前走一步的位置。
    return pos - 16 + (sd << 5);
  }

  public kingSpan(posSrc: number, posDst: number): boolean {
    // KING_SPAN
    // 校验将（帅）的走法
    return legalSpan[posDst - posSrc + 256] === 1;
  }

  public advisorSpan(posSrc: number, posDst: number): boolean {
    // ADVISOR_SPAN
    // 检验士（仕）的走法
    return legalSpan[posDst - posSrc + 256] === 2;
  }

  public bishopSpan(posSrc: number, posDst: number): boolean {
    // BISHOP_SPAN
    // 校验象（相）的走法
    return legalSpan[posDst - posSrc + 256] === 3;
  }

  public bishopPin(posSrc: number, posDst: number): number {
    // BISHOP_PIN
    // 象眼的位置
    return (posSrc + posDst) >> 1;
  }

  public knightPin(posSrc: number, posDst: number): number {
    // KNIGHT_PIN
    // 如果马的走法合法，则返回相应马脚的位置。否则返回sqSrc。
    return posSrc + knightPin[posDst - posSrc + 256];
  }

  public homeHalf(pos: number, sd: number): boolean {
    // HOME_HALF
    // pos 是棋子位置，sd是走棋方（红方0，黑方1）。如果该位置未过河，则返回true；否则返回false。
    return (pos & 0x80) !== sd << 7;
  }

  public awayHalf(pos: number, sd: number): boolean {
    // AWAY_HALF
    // pos是棋子位置，sd是走棋方（红方0，黑方1）。如果该位置已过河，则返回true；否则返回false。
    return (pos & 0x80) === sd << 7;
  }

  public sameHalf(posSrc: number, posDst: number): boolean {
    // SAME_HALF
    // 如果从起点posSrc到终点posDst没有过河，则返回true；否则返回false
    return ((posSrc ^ posDst) & 0x80) === 0;
  }
  public sameColumn(posSrc: number, posDst: number): boolean {
    // SAME_RANK
    // 如果posSrc和posDst在同一行则返回true，否则返回false
    return ((posSrc ^ posDst) & 0xf0) === 0;
  }
  public sameRow(posSrc: number, posDst: number): boolean {
    // SAME_FILE
    // 如果posSrc和posDst在同一列则返回true，否则返回false
    return ((posSrc ^ posDst) & 0x0f) == 0;
  }
  public sideTag(sd: number): number {
    // SIDE_TAG
    // 获得红黑标记(红子是8，黑子是16)
    return 8 + (sd << 3);
  }
  public oppSideTag(sd: number): number {
    // OPP_SIDE_TAG
    // 获得对方红黑标记
    return 16 - (sd << 3);
  }
  public Source(mv: number): number {
    // SRC
    // 获取走法的起点
    return mv & 255;
  }
  public Target(mv: number): number {
    // DST
    // 获取走法的终点
    return mv >> 8;
  }
  public move(posSrc: number, posDst: number): number {
    // MOVE
    // 将一个走法的起点和终点，转化为一个整型数字
    return posSrc + (posDst << 8);
  }
  public mirrorMove(mv: number): number {
    // MIRROR_MOVE
    return this.move(this.mirrorCoordinate(this.Source(mv)), this.mirrorCoordinate(this.Target(mv)));
  }

  public mvvLva(pc: number, lva: number) {
    // MVV_LVA
    // 求MVV/LVA值
    return mvvValue[pc & 7] - lva;
  }

  public char(n: number): string {
    // CHR
    return String.fromCharCode(n);
  }
  public charCodeAt(c: string): number {
    // ASC
    return c.charCodeAt(0);
  }

  public getPieceFromChar(c: string): number {
    // CHAR_TO_PIECE
    switch (c) {
      case 'K':
        return PIECE_KING;
      case 'A':
        return PIECE_ADVISOR;
      case 'B':
        return PIECE_BISHOP;
      case 'N':
        return PIECE_KNIGHT;
      case 'R':
        return PIECE_ROOK;
      case 'C':
        return PIECE_CANNON;
      case 'P':
        return PIECE_PAWN;
      default:
        return -1;
    }
  }
}

class ChineseChessRC4 {
  x = 0;
  y = 0;
  state: number[] = [];

  constructor(key: number[]) {
    for (let i = 0; i < 256; i++) {
      this.state.push(i);
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.state[i] + key[i % key.length]) & 0xff;
      this.swap(i, j);
    }
  }

  swap(i: number, j: number) {
    const t: number = this.state[j];
    this.state[i] = this.state[j];
    this.state[j] = t;
  }

  nextByte() {
    this.x = (this.x + 1) & 0xff;
    this.y = (this.y + this.state[this.x]) & 0xff;
    this.swap(this.x, this.y);
    const t: number = (this.state[this.x] + this.state[this.y]) & 0xff;
    return this.state[t];
  }

  // 生成32位随机数
  nextLong() {
    const n0 = this.nextByte();
    const n1 = this.nextByte();
    const n2 = this.nextByte();
    const n3 = this.nextByte();
    return n0 + (n1 << 8) + (n2 << 16) + ((n3 << 24) & 0xffffffff);
  }
}

export class ChineseChessPosition {
  sdPlayer = 0; // 该谁走棋。0-红方；1-黑方
  squares: number[] = []; // 一维棋局数组

  zobristKey = 0;
  zobristLock = 0;
  vlWhite = 0;
  vlBlack = 0;

  mvList: number[] = [0]; // 存放每步走法的数组
  pcList: number[] = [0]; // 存放每步被吃的棋子。如果没有棋子被吃，存放的是0
  keyList: number[] = [0]; // 存放zobristKey
  chkList = [this.checked()]; // 是否被将军
  distance = 0; // 搜索的深度
  utilObj = new ChineseChessUtil();

  PreGen_zobristKeyPlayer: number;
  PreGen_zobristLockPlayer: number;
  PreGen_zobristKeyTable: number[] = [];
  PreGen_zobristLockTable: number[] = [];

  constructor() {
    const rc4 = new ChineseChessRC4([0]);
    this.PreGen_zobristKeyPlayer = rc4.nextLong();
    rc4.nextLong();
    this.PreGen_zobristLockPlayer = rc4.nextLong();
    for (let i = 0; i < 14; i++) {
      const keys: number[] = [];
      const locks: number[] = [];
      for (let j = 0; j < 256; j++) {
        keys.push(rc4.nextLong());
        rc4.nextLong();
        locks.push(rc4.nextLong());
      }
      this.PreGen_zobristKeyTable.push(...keys);
      this.PreGen_zobristLockTable.push(...locks);
    }
  }

  public clearBoard() {
    this.sdPlayer = 0;
    this.squares = [];
    for (let sq = 0; sq < 256; sq++) {
      this.squares.push(0);
    }
    this.zobristKey = this.zobristLock = 0;
    this.vlWhite = this.vlBlack = 0;
  }

  public setIrrev() {
    this.mvList = [0]; // 存放每步走法的数组
    this.pcList = [0]; // 存放每步被吃的棋子。如果没有棋子被吃，存放的是0
    this.keyList = [0]; // 存放zobristKey
    this.chkList = [this.checked()]; // 是否被将军
    this.distance = 0; // 搜索的深度
  }

  public initialize(fen: string) {
    // fromFEN
    // 将FEN串转为一维数组，初始化棋局
    this.clearBoard();
    let y = RANK_TOP;
    let x = FILE_LEFT;
    let index = 0;
    if (index === fen.length) {
      this.setIrrev();
      return;
    }
    let c = fen.charAt(index);
    while (c !== ' ') {
      if (c === '/') {
        x = FILE_LEFT;
        y++;
        if (y > RANK_BOTTOM) {
          break;
        }
      } else if (c >= '1' && c <= '9') {
        x += this.utilObj.charCodeAt(c) - this.utilObj.charCodeAt('0');
      } else if (c >= 'A' && c <= 'Z') {
        if (x <= FILE_RIGHT) {
          const pt = this.utilObj.getPieceFromChar(c);
          if (pt >= 0) {
            this.addPiece(COORD_XY(x, y), pt + 8);
          }
          x++;
        }
      } else if (c >= 'a' && c <= 'z') {
        if (x <= FILE_RIGHT) {
          var pt = CHAR_TO_PIECE(CHR(ASC(c) + ASC('A') - ASC('a')));
          if (pt >= 0) {
            this.addPiece(COORD_XY(x, y), pt + 16);
          }
          x++;
        }
      }
      index++;
      if (index == fen.length) {
        this.setIrrev();
        return;
      }
      c = fen.charAt(index);
    }
    index++;
    if (index == fen.length) {
      this.setIrrev();
      return;
    }

    this.setIrrev();
  }

  // 生成棋局的所有走法，vls不为null时，生成吃子走法
  public generateMoves(vls) {
    var mvs = [];
    var pcSelfSide = this.utilObj.sideTag(this.sdPlayer);
    var pcOppSide = this.utilObj.oppSideTag(this.sdPlayer);
    for (var sqSrc = 0; sqSrc < 256; sqSrc++) {
      var pcSrc = this.squares[sqSrc];
      if ((pcSrc & pcSelfSide) === 0) {
        continue;
      }
      switch (pcSrc - pcSelfSide) {
        case PIECE_KING: {
          for (var i = 0; i < 4; i++) {
            var sqDst = sqSrc + KING_DELTA[i];
            if (!this.utilObj.inFort(sqDst)) {
              continue;
            }
            var pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(this.utilObj.move(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              // 目标位置存在对方棋子（这是要生成吃子走法）
              mvs.push(this.utilObj.move(sqSrc, sqDst)); // 存储吃子走法
              vls.push(this.utilObj.mvvLva(pcDst, 5)); // 该吃子走法的分值（MVV/LVA启发）
            }
          }
          break;
        }

        case PIECE_ADVISOR: {
          for (var i = 0; i < 4; i++) {
            var sqDst = sqSrc + advisorDelta[i];
            if (!this.utilObj.inFort(sqDst)) {
              continue;
            }
            var pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(this.utilObj.move(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              mvs.push(this.utilObj.move(sqSrc, sqDst));
              vls.push(this.utilObj.mvvLva(pcDst, 1));
            }
          }
          break;
        }

        case PIECE_BISHOP: {
          for (var i = 0; i < 4; i++) {
            var sqDst = sqSrc + advisorDelta[i];
            if (
              !(this.utilObj.inBoard(sqDst) && this.utilObj.homeHalf(sqDst, this.sdPlayer) && this.squares[sqDst] === 0)
            ) {
              continue;
            }
            sqDst += advisorDelta[i];
            var pcDst = this.squares[sqDst];
            if (vls === null) {
              if ((pcDst & pcSelfSide) === 0) {
                mvs.push(this.utilObj.move(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) !== 0) {
              mvs.push(this.utilObj.move(sqSrc, sqDst));
              vls.push(this.utilObj.mvvLva(pcDst, 1));
            }
          }
          break;
        }

        case PIECE_KNIGHT: {
          for (var i = 0; i < 4; i++) {
            var sqDst = sqSrc + kingDelta[i];
            if (this.squares[sqDst] > 0) {
              continue;
            }
            for (var j = 0; j < 2; j++) {
              sqDst = sqSrc + knightDelta[i][j];
              if (!this.utilObj.inBoard(sqDst)) {
                continue;
              }
              var pcDst = this.squares[sqDst];
              if (vls === null) {
                if ((pcDst & pcSelfSide) == 0) {
                  mvs.push(this.utilObj.move(sqSrc, sqDst));
                }
              } else if ((pcDst & pcOppSide) != 0) {
                mvs.push(this.utilObj.move(sqSrc, sqDst));
                vls.push(this.utilObj.mvvLva(pcDst, 1));
              }
            }
          }
          break;
        }

        case PIECE_ROOK: {
          for (var i = 0; i < 4; i++) {
            var delta = kingDelta[i];
            var sqDst = sqSrc + delta;
            while (this.utilObj.inBoard(sqDst)) {
              var pcDst = this.squares[sqDst];
              if (pcDst == 0) {
                if (vls == null) {
                  mvs.push(this.utilObj.move(sqSrc, sqDst));
                }
              } else {
                if ((pcDst & pcOppSide) != 0) {
                  mvs.push(this.utilObj.move(sqSrc, sqDst));
                  if (vls != null) {
                    vls.push(this.utilObj.mvvLva(pcDst, 4));
                  }
                }
                break;
              }
              sqDst += delta;
            }
          }
          break;
        }

        case PIECE_CANNON: {
          for (var i = 0; i < 4; i++) {
            var delta = kingDelta[i];
            var sqDst = sqSrc + delta;
            while (this.utilObj.inBoard(sqDst)) {
              var pcDst = this.squares[sqDst];
              if (pcDst == 0) {
                if (vls == null) {
                  mvs.push(this.utilObj.move(sqSrc, sqDst));
                }
              } else {
                break;
              }
              sqDst += delta;
            }
            sqDst += delta;
            while (this.utilObj.inBoard(sqDst)) {
              var pcDst = this.squares[sqDst];
              if (pcDst > 0) {
                if ((pcDst & pcOppSide) != 0) {
                  mvs.push(this.utilObj.move(sqSrc, sqDst));
                  if (vls != null) {
                    vls.push(this.utilObj.mvvLva(pcDst, 4));
                  }
                }
                break;
              }
              sqDst += delta;
            }
          }
          break;
        }

        case PIECE_PAWN: {
          var sqDst = SQUARE_FORWARD(sqSrc, this.sdPlayer);
          if (IN_BOARD(sqDst)) {
            var pcDst = this.squares[sqDst];
            if (vls == null) {
              if ((pcDst & pcSelfSide) == 0) {
                mvs.push(this.utilObj.move(sqSrc, sqDst));
              }
            } else if ((pcDst & pcOppSide) != 0) {
              mvs.push(this.utilObj.move(sqSrc, sqDst));
              vls.push(MVV_LVA(pcDst, 2));
            }
          }
          if (AWAY_HALF(sqSrc, this.sdPlayer)) {
            for (var delta = -1; delta <= 1; delta += 2) {
              sqDst = sqSrc + delta;
              if (IN_BOARD(sqDst)) {
                var pcDst = this.squares[sqDst];
                if (vls == null) {
                  if ((pcDst & pcSelfSide) == 0) {
                    mvs.push(this.utilObj.move(sqSrc, sqDst));
                  }
                } else if ((pcDst & pcOppSide) != 0) {
                  mvs.push(this.utilObj.move(sqSrc, sqDst));
                  vls.push(MVV_LVA(pcDst, 2));
                }
              }
            }
          }
          break;
        }
      }
    }
    return mvs;
  }

  // 判断步骤是否合法。是则返回true，否则返回false
  public legalMove(mv) {
    var sqSrc = SRC(mv); // 获取走法的起点位置
    var pcSrc = this.squares[sqSrc]; // 获取起点位置的棋子
    var pcSelfSide = SIDE_TAG(this.sdPlayer); // 红黑标记(红子是8，黑子是16)

    if ((pcSrc & pcSelfSide) == 0) {
      // 起点位置的棋子，不是本方棋子。（是对方棋子，或者根本没有棋子）
      return false;
    }

    var sqDst = DST(mv); // 获取走法的终点位置
    var pcDst = this.squares[sqDst]; // 获取终点位置的棋子

    if ((pcDst & pcSelfSide) != 0) {
      // 终点位置有棋子，而且是本方棋子
      return false;
    }

    switch (pcSrc - pcSelfSide) {
      case PIECE_KING: // 起点棋子是将（帅），校验走法
        return IN_FORT(sqDst) && KING_SPAN(sqSrc, sqDst);
      case PIECE_ADVISOR: // 起点棋子是仕（仕），校验走法
        return IN_FORT(sqDst) && ADVISOR_SPAN(sqSrc, sqDst);
      case PIECE_BISHOP: // 起点棋子是象（相），校验走法
        return SAME_HALF(sqSrc, sqDst) && BISHOP_SPAN(sqSrc, sqDst) && this.squares[BISHOP_PIN(sqSrc, sqDst)] == 0;
      case PIECE_KNIGHT: // 起点棋子是马，校验走法
        var sqPin = KNIGHT_PIN(sqSrc, sqDst);
        return sqPin != sqSrc && this.squares[sqPin] == 0;
      case PIECE_ROOK: // 起点棋子是车，校验走法
      case PIECE_CANNON: // 起点棋子是炮，校验走法
        var delta; // 标识沿哪个方向走棋
        if (SAME_RANK(sqSrc, sqDst)) {
          // 起点和终点位于同一行。再根据起点和终点的大小关系，判断具体是沿哪个方向走棋。
          delta = sqDst < sqSrc ? -1 : 1;
        } else if (SAME_FILE(sqSrc, sqDst)) {
          // 起点和终点位于同一列。再根据起点和终点的大小关系，判断具体是沿哪个方向走棋。
          delta = sqDst < sqSrc ? -16 : 16;
        } else {
          // 起点和终点不在同一行，也不在同一列。走法是非法的。
          return false;
        }
        var sqPin = sqSrc + delta; // 沿着方向delta走一步棋
        while (sqPin != sqDst && this.squares[sqPin] == 0) {
          // 沿方向delta一步步向前走，直到遇到棋子，或者sqPin走到了终点的位置上
          sqPin += delta;
        }
        if (sqPin == sqDst) {
          // 如果终点没有棋子，不管是车还是炮，这步棋都是合法的。如果是车，不管终点有没有棋子（对方棋子），这步棋都合法。
          return pcDst == 0 || pcSrc - pcSelfSide == PIECE_ROOK;
        }
        // 此时已经翻山，终点必须有棋子，并且行棋的是炮，否则这步棋不合法
        if (pcDst == 0 || pcSrc - pcSelfSide != PIECE_CANNON) {
          return false;
        }
        sqPin += delta;
        while (sqPin != sqDst && this.squares[sqPin] == 0) {
          sqPin += delta;
        }
        return sqPin == sqDst;
      case PIECE_PAWN:
        // 兵已过河，并且是左右两个方向走的
        if (AWAY_HALF(sqDst, this.sdPlayer) && (sqDst == sqSrc - 1 || sqDst == sqSrc + 1)) {
          return true;
        }
        // 判断兵是不是在向前走
        return sqDst == SQUARE_FORWARD(sqSrc, this.sdPlayer);
      default:
        return false;
    }
  }

  /**
   * 判断将（帅）是否被对方攻击。
   * @return boolean true-被攻击 false-没有被攻击
   */
  public checked(): boolean {
    var pcSelfSide = this.utilObj.sideTag(this.sdPlayer); // 己方红黑标记
    var pcOppSide = this.utilObj.oppSideTag(this.sdPlayer); // 对方红黑标记

    for (var sqSrc = 0; sqSrc < 256; sqSrc++) {
      // 遍历棋局数组，直到遇见己方的将（帅）
      if (this.squares[sqSrc] !== pcSelfSide + PIECE_KING) {
        continue;
      }

      // 判断对方进兵，是否会攻击到己方老将
      if (this.squares[this.utilObj.forwardCoordinate(sqSrc, this.sdPlayer)] === pcOppSide + PIECE_PAWN) {
        return true;
      }
      // 判断对方平兵（前提是并已过河），是否会攻击到己方老将
      for (var delta = -1; delta <= 1; delta += 2) {
        if (this.squares[sqSrc + delta] === pcOppSide + PIECE_PAWN) {
          return true;
        }
      }

      // 判断对方马是否攻击到己方老将
      for (var i = 0; i < 4; i++) {
        if (this.squares[sqSrc + advisorDelta[i]] !== 0) {
          // 马蹄有子，不用害怕哦
          continue;
        }
        for (var j = 0; j < 2; j++) {
          var pcDst = this.squares[sqSrc + knightCheckDelta[i][j]];
          if (pcDst == pcOppSide + PIECE_KNIGHT) {
            return true;
          }
        }
      }

      // 判断对方的车、炮是攻击到了己方老将，以及将帅是否对脸
      for (var i = 0; i < 4; i++) {
        var delta = kingDelta[i];
        var sqDst = sqSrc + delta;
        while (this.utilObj.inBoard(sqDst)) {
          var pcDst = this.squares[sqDst];
          if (pcDst > 0) {
            if (pcDst === pcOppSide + PIECE_ROOK || pcDst === pcOppSide + PIECE_KING) {
              // 对方车能攻击己方老将，或者将帅对脸。
              return true;
            }
            break;
          }
          sqDst += delta;
        }
        sqDst += delta;
        while (this.utilObj.inBoard(sqDst)) {
          var pcDst = this.squares[sqDst];
          if (pcDst > 0) {
            if (pcDst === pcOppSide + PIECE_CANNON) {
              return true;
            }
            break;
          }
          sqDst += delta;
        }
      }
      return false;
    }
    return false;
  }

  // 被将死？ 无棋可走的话，返回true，否则返回false
  public isMate(): boolean {
    var mvs = this.generateMoves(null);
    for (var i = 0; i < mvs.length; i++) {
      if (this.makeMove(mvs[i])) {
        this.undoMakeMove();
        return false;
      }
    }
    return true;
  }

  // 结合搜索深度的输棋分值
  public mateValue(): number {
    return this.distance - MATE_VALUE;
  }

  // 结合搜索深度的长将判负分值
  public banValue() {
    return this.distance - BAN_VALUE;
  }

  // 和棋分值
  public drawValue() {
    return (this.distance & 1) == 0 ? -DRAW_VALUE : DRAW_VALUE;
  }

  // 某步走过的棋是否被将军
  public inCheck(): boolean {
    return this.chkList[this.chkList.length - 1];
  }

  // 某步走过的棋，是否是吃子走法
  public captured(): boolean {
    return this.pcList[this.pcList.length - 1] > 0;
  }

  // 出现重复局面时，返回的分值
  public repValue(vlRep): number {
    var vlReturn = ((vlRep & 2) === 0 ? 0 : this.banValue()) + ((vlRep & 4) === 0 ? 0 : -this.banValue());
    return vlReturn == 0 ? this.drawValue() : vlReturn;
  }

  // 判断是否出现重复局面
  public repStatus(recur_: number): number {
    var recur = recur_;
    var selfSide = false;
    var perpCheck = true;
    var oppPerpCheck = true;
    var index = this.mvList.length - 1;

    while (this.mvList[index] > 0 && this.pcList[index] === 0) {
      if (selfSide) {
        perpCheck = perpCheck && this.chkList[index];
        if (this.keyList[index] === this.zobristKey) {
          recur--;
          if (recur === 0) {
            return 1 + (perpCheck ? 2 : 0) + (oppPerpCheck ? 4 : 0);
          }
        }
      } else {
        oppPerpCheck = oppPerpCheck && this.chkList[index];
      }

      selfSide = !selfSide;
      index--;
    }
    return 0;
  }

  // 切换走棋方
  public changeSide() {
    this.sdPlayer = 1 - this.sdPlayer;
    this.zobristKey ^= PreGen_zobristKeyPlayer;
    this.zobristLock ^= PreGen_zobristLockPlayer;
  }

  // 走一步棋
  public makeMove(mv) {
    var zobristKey = this.zobristKey;
    this.movePiece(mv); // 移动棋子

    // 检查走棋是否被将军。如果是，说明这是在送死，撤销走棋并返回false。
    if (this.checked()) {
      this.undoMovePiece(mv);
      return false;
    }
    this.keyList.push(zobristKey); // 存储局面的zobristKey校验码
    this.changeSide(); // 切换走棋方
    this.chkList.push(this.checked()); // 存储走完棋后，对方是否处于被将军的状态
    this.distance++; // 搜索深度+1
    return true;
  }

  // 取消上一步的走棋
  public undoMakeMove() {
    this.distance--; // 搜索深度减1
    this.chkList.pop();
    this.changeSide(); // 切换走棋方
    this.keyList.pop();
    this.undoMovePiece(); // 取消上一步的走棋
  }

  // 空步搜索
  public nullMove() {
    this.mvList.push(0);
    this.pcList.push(0);
    this.keyList.push(this.zobristKey);
    this.changeSide();
    this.chkList.push(false);
    this.distance++;
  }

  // 撤销上一步的空步搜索
  public undoNullMove() {
    this.distance--;
    this.chkList.pop();
    this.changeSide();
    this.keyList.pop();
    this.pcList.pop();
    this.mvList.pop();
  }

  // 根据走法移动棋子，删除终点位置的棋子，将起点位置的棋子放置在终点的位置。
  public movePiece(mv) {
    var sqSrc = this.utilObj.Source(mv);
    var sqDst = this.utilObj.Target(mv);
    var pc = this.squares[sqDst];
    this.pcList.push(pc);
    if (pc > 0) {
      // 如果终点有棋子，则要删除该棋子
      this.addPiece(sqDst, pc, DEL_PIECE);
    }
    pc = this.squares[sqSrc];
    this.addPiece(sqSrc, pc, DEL_PIECE); // 删除起点棋子
    this.addPiece(sqDst, pc, ADD_PIECE); // 将原来起点的棋子添加到终点
    this.mvList.push(mv);
  }

  // 取消上一步对棋子的移动
  public undoMovePiece() {
    var mv = this.mvList.pop();
    var sqSrc = this.utilObj.Source(mv);
    var sqDst = this.utilObj.Target(mv);
    let pc = this.squares[sqDst];
    this.addPiece(sqDst, pc, DEL_PIECE); // 删除终点棋子
    this.addPiece(sqSrc, pc, ADD_PIECE); // 将终点位置的棋子添加到起点
    pc = this.pcList.pop();
    if (pc > 0) {
      // 这步棋发生了吃子，需要把吃掉的棋子放回终点位置
      this.addPiece(sqDst, pc, ADD_PIECE);
    }
  }

  // 如果bDel为false，则将棋子pc添加进棋局中的sp位置；如果bDel为true，则删除sp位置的棋子。
  public addPiece(sq, pc, bDel) {
    var pcAdjust;
    // 添加或删除棋子
    this.squares[sq] = bDel ? 0 : pc;

    // 更新红黑双方子粒分值
    if (pc < 16) {
      pcAdjust = pc - 8;
      this.vlWhite += bDel ? -1 * pieceValue[pcAdjust][sq] : pieceValue[pcAdjust][sq];
    } else {
      pcAdjust = pc - 16;
      this.vlBlack += bDel
        ? -1 * pieceValue[pcAdjust][this.utilObj.flipSquare(sq)]
        : pieceValue[pcAdjust][this.utilObj.flipSquare(sq)];
      pcAdjust += 7;
    }

    // 更新局面的zobristKey校验码和zobristLock校验码
    this.zobristKey ^= this.PreGen_zobristKeyTable[pcAdjust][sq];
    this.zobristLock ^= this.PreGen_zobristLockTable[pcAdjust][sq];
  }

  // 局面评估函数，返回当前走棋方的优势
  public evaluate() {
    let vl = (this.sdPlayer == 0 ? this.vlWhite - this.vlBlack : this.vlBlack - this.vlWhite) + ADVANCED_VALUE;
    return vl;
  }

  // 当前局面的优势是否足以进行空步搜索
  public nullOkay() {
    return (this.sdPlayer == 0 ? this.vlWhite : this.vlBlack) > NULL_OKAY_MARGIN;
  }

  // 空步搜索得到的分值是否有效
  public nullSafe() {
    return (this.sdPlayer == 0 ? this.vlWhite : this.vlBlack) > NULL_SAFE_MARGIN;
  }

  // 获取历史表的指标
  public historyIndex(mv: number) {
    return ((this.squares[this.utilObj.Source(mv)] - 8) << 8) + this.utilObj.Target(mv);
  }
}

// Move mode
export enum ChineseChessPlayMode {
  PlayerFirst = 0,
  AIFirst = 1,
  NoAI = 2,
}

// Handicap
export enum ChineseChessHandicap {
  None = 0,
  LeftKnight = 1,
  TwoKnights = 2,
  Nine = 3,
}

// Level of AI
export enum ChineseChessAILevel {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export class ChineseChessBoard {
  private ailevel: ChineseChessAILevel = ChineseChessAILevel.Easy;
  private playMode: ChineseChessPlayMode = ChineseChessPlayMode.PlayerFirst;
  private handicapMode: ChineseChessHandicap = ChineseChessHandicap.None;

  get AILevel(): ChineseChessAILevel {
    return this.ailevel;
  }
  set AILevel(lvl: ChineseChessAILevel) {
    this.ailevel = lvl;
  }
  get PlayMode(): ChineseChessPlayMode {
    return this.playMode;
  }
  set PlayMode(mode: ChineseChessPlayMode) {
    this.playMode = mode;
  }
  get HandicapMode(): ChineseChessHandicap {
    return this.handicapMode;
  }
  set HandicapMode(hm: ChineseChessHandicap) {
    this.handicapMode = hm;
  }

  public setLayout(lay: string) {}
}
