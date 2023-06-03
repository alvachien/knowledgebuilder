/* eslint-disable prettier/prettier */
//
// Constants
//

import { BOOK_DATA as BOOK_DAT } from './chinese-chess-book';
//const MATE_VALUE = 10000;
//const BAN_VALUE = MATE_VALUE - 100;
//const WIN_VALUE = MATE_VALUE - 200;
//const NULL_SAFE_MARGIN = 400;
//const NULL_OKAY_MARGIN = 200;
//const DRAW_VALUE = 20;
//const ADVANCED_VALUE = 3;

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

const MAX_MOVE_NUM = 256;
const MAX_GEN_MOVES = 128;
const MAX_BOOK_SIZE = 16384;

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

const _IN_BOARD: number[] =
[
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const _IN_FORT: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const _LEGAL_SPAN: number[] = [
             0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0,
];

const _KNIGHT_PIN: number[] = [
                0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,-16,  0,-16,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0, -1,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0, -1,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0, 16,  0, 16,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0
];

const KING_DELTA: number[] = [-16, -1, 1, 16];
const ADVISOR_DELTA: number[] = [-17, -15, 15, 17];
const KNIGHT_DELTA: number[][] = [
  [-33, -31],
  [-18, 14],
  [-14, 18],
  [31, 33],
];
const KNIGHT_CHECK_DELTA: number[][] = [
  [-33, -18],
  [-31, -14],
  [14, 31],
  [18, 33],
];
const MVV_VALUE: number[] = [50, 10, 10, 30, 40, 30, 20, 0];

const PIECE_VALUE: number[][] = [
  [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  9,  9,  9, 11, 13, 11,  9,  9,  9,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 34, 42, 44, 42, 34, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 32, 37, 37, 37, 32, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 23, 27, 29, 30, 29, 27, 23, 19,  0,  0,  0,  0,
    0,  0,  0, 14, 18, 20, 27, 29, 27, 20, 18, 14,  0,  0,  0,  0,
    0,  0,  0,  7,  0, 13,  0, 16,  0, 13,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  7,  0,  7,  0, 15,  0,  7,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0, 11, 15, 11,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ], [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20,  0,  0,  0, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0, 18,  0,  0, 20, 23, 20,  0,  0, 18,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0, 23,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20, 20,  0, 20, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ], [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20,  0,  0,  0, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0, 18,  0,  0, 20, 23, 20,  0,  0, 18,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0, 23,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20, 20,  0, 20, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ], [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0, 90, 90, 90, 96, 90, 96, 90, 90, 90,  0,  0,  0,  0,
    0,  0,  0, 90, 96,103, 97, 94, 97,103, 96, 90,  0,  0,  0,  0,
    0,  0,  0, 92, 98, 99,103, 99,103, 99, 98, 92,  0,  0,  0,  0,
    0,  0,  0, 93,108,100,107,100,107,100,108, 93,  0,  0,  0,  0,
    0,  0,  0, 90,100, 99,103,104,103, 99,100, 90,  0,  0,  0,  0,
    0,  0,  0, 90, 98,101,102,103,102,101, 98, 90,  0,  0,  0,  0,
    0,  0,  0, 92, 94, 98, 95, 98, 95, 98, 94, 92,  0,  0,  0,  0,
    0,  0,  0, 93, 92, 94, 95, 92, 95, 94, 92, 93,  0,  0,  0,  0,
    0,  0,  0, 85, 90, 92, 93, 78, 93, 92, 90, 85,  0,  0,  0,  0,
    0,  0,  0, 88, 85, 90, 88, 90, 88, 90, 85, 88,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ], [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,206,208,207,213,214,213,207,208,206,  0,  0,  0,  0,
    0,  0,  0,206,212,209,216,233,216,209,212,206,  0,  0,  0,  0,
    0,  0,  0,206,208,207,214,216,214,207,208,206,  0,  0,  0,  0,
    0,  0,  0,206,213,213,216,216,216,213,213,206,  0,  0,  0,  0,
    0,  0,  0,208,211,211,214,215,214,211,211,208,  0,  0,  0,  0,
    0,  0,  0,208,212,212,214,215,214,212,212,208,  0,  0,  0,  0,
    0,  0,  0,204,209,204,212,214,212,204,209,204,  0,  0,  0,  0,
    0,  0,  0,198,208,204,212,212,212,204,208,198,  0,  0,  0,  0,
    0,  0,  0,200,208,206,212,200,212,206,208,200,  0,  0,  0,  0,
    0,  0,  0,194,206,204,212,200,212,204,206,194,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ], [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,100,100, 96, 91, 90, 91, 96,100,100,  0,  0,  0,  0,
    0,  0,  0, 98, 98, 96, 92, 89, 92, 96, 98, 98,  0,  0,  0,  0,
    0,  0,  0, 97, 97, 96, 91, 92, 91, 96, 97, 97,  0,  0,  0,  0,
    0,  0,  0, 96, 99, 99, 98,100, 98, 99, 99, 96,  0,  0,  0,  0,
    0,  0,  0, 96, 96, 96, 96,100, 96, 96, 96, 96,  0,  0,  0,  0,
    0,  0,  0, 95, 96, 99, 96,100, 96, 99, 96, 95,  0,  0,  0,  0,
    0,  0,  0, 96, 96, 96, 96, 96, 96, 96, 96, 96,  0,  0,  0,  0,
    0,  0,  0, 97, 96,100, 99,101, 99,100, 96, 97,  0,  0,  0,  0,
    0,  0,  0, 96, 97, 98, 98, 98, 98, 98, 97, 96,  0,  0,  0,  0,
    0,  0,  0, 96, 96, 97, 99, 99, 99, 97, 96, 96,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ], [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  9,  9,  9, 11, 13, 11,  9,  9,  9,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 34, 42, 44, 42, 34, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 32, 37, 37, 37, 32, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 23, 27, 29, 30, 29, 27, 23, 19,  0,  0,  0,  0,
    0,  0,  0, 14, 18, 20, 27, 29, 27, 20, 18, 14,  0,  0,  0,  0,
    0,  0,  0,  7,  0, 13,  0, 16,  0, 13,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  7,  0,  7,  0, 15,  0,  7,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0, 11, 15, 11,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
  ],
];

export const STARTUP_FEN: string[] = [
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w - - 0 1",
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w - - 0 1",
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w - - 0 1",
];

const FEN_PIECE = "        KABNRCP kabnrcp ";

const pieceImageName = [
  'oo', null, null, null, null, null, null, null,
  'rk', 'ra', 'rb', 'rn', 'rr', 'rc', 'rp', null,
  'bk', 'ba', 'bb', 'bn', 'br', 'bc', 'bp', null,
];


export enum ChineseChessPieceEnum {
  King      = 0, // 将
  Advisor   = 1, // 士
  Bishop    = 2, // 象
  Knight    = 3, // 马
  Rook      = 4, // 俥
  Cannon    = 5, // 炮
  Pawn      = 6, // 卒
}


const ADD_PIECE = false;
const DEL_PIECE = true;

const BOARD_WIDTH = 521;
const BOARD_HEIGHT = 577;
const SQUARE_SIZE = 57;
const SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 9) >> 1;
const SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 10) >> 1;
const THINKING_SIZE = 32;
const THINKING_LEFT = (BOARD_WIDTH - THINKING_SIZE) >> 1;
const THINKING_TOP = (BOARD_HEIGHT - THINKING_SIZE) >> 1;
const MAX_STEP = 8;

// Utility
export class ChineseChessUtil {
	private _POP_COUNT_16: number[] = [];

	public constructor() {
		for (let i = 0; i < 65536; i ++) {
			let n = ((i >> 1) & 0x5555) + (i & 0x5555);
			n = ((n >> 2) & 0x3333) + (n & 0x3333);
			n = ((n >> 4) & 0x0f0f) + (n & 0x0f0f);
			this._POP_COUNT_16[i] = ((n >> 8) + (n & 0x00ff));
		}
	}

	public POP_COUNT_16(data: number): number {
		return this._POP_COUNT_16[data];
	}

	public IN_BOARD(sq: number): boolean {
		return _IN_BOARD[sq] !== 0;
	}

	public IN_FORT(sq: number): boolean {
		return _IN_FORT[sq] !== 0;
	}

	public RANK_Y(sq: number): number {
		return sq >> 4;
	}

	public FILE_X(sq: number): number {
		return sq & 15;
	}

	public COORD_XY(x: number, y: number): number {
		return x + (y << 4);
	}

	public SQUARE_FLIP(sq: number): number {
		return 254 - sq;
	}

	public FILE_FLIP(x: number): number {
		return 14 - x;
	}

	public RANK_FLIP(y: number): number {
		return 15 - y;
	}

	public MIRROR_SQUARE(sq: number): number {
		return this.COORD_XY(this.FILE_FLIP(this.FILE_X(sq)), this.RANK_Y(sq));
	}

	public SQUARE_FORWARD(sq: number, sd: number): number {
		return sq - 16 + (sd << 5);
	}

	public KING_SPAN(sqSrc: number, sqDst: number): boolean {
		return _LEGAL_SPAN[sqDst - sqSrc + 256] === 1;
	}

	public ADVISOR_SPAN(sqSrc: number, sqDst: number): boolean {
		return _LEGAL_SPAN[sqDst - sqSrc + 256] === 2;
	}

	public BISHOP_SPAN(sqSrc: number, sqDst: number): boolean {
		return _LEGAL_SPAN[sqDst - sqSrc + 256] === 3;
	}

	public BISHOP_PIN(sqSrc: number, sqDst: number): number {
		return (sqSrc + sqDst) >> 1;
	}

	public KNIGHT_PIN(sqSrc: number, sqDst: number): number {
		return sqSrc + _KNIGHT_PIN[sqDst - sqSrc + 256];
	}

	public HOME_HALF(sq: number, sd: number): boolean {
		return (sq & 0x80) !== (sd << 7);
	}

	public AWAY_HALF(sq: number, sd: number): boolean {
		return (sq & 0x80) === (sd << 7);
	}

	public SAME_HALF(sqSrc: number, sqDst: number): boolean {
		return ((sqSrc ^ sqDst) & 0x80) === 0;
	}

	public SAME_RANK(sqSrc: number, sqDst: number): boolean {
		return ((sqSrc ^ sqDst) & 0xf0) === 0;
	}

	public SAME_FILE(sqSrc: number, sqDst: number): boolean {
		return ((sqSrc ^ sqDst) & 0x0f) === 0;
	}

	public SIDE_TAG(sd: number): number {
		return 8 + (sd << 3);
	}

	public OPP_SIDE_TAG(sd: number): number {
		return 16 - (sd << 3);
	}

	public SRC(mv: number): number {
		return mv & 255;
	}

	public DST(mv: number): number {
		return mv >> 8;
	}

	public MOVE(sqSrc: number, sqDst: number): number {
		return sqSrc + (sqDst << 8);
	}

	public MIRROR_MOVE(mv: number): number {
		return this.MOVE(this.MIRROR_SQUARE(this.SRC(mv)), this.MIRROR_SQUARE(this.DST(mv)));
	}

	public MVV_LVA(pc: number, lva: number): number {
		return MVV_VALUE[pc & 7] - lva;
	}

	public CHAR_TO_PIECE(c: string): number {
		switch (c) {
		case 'K':
			return PIECE_KING;
		case 'A':
			return PIECE_ADVISOR;
		case 'B':
		case 'E':
			return PIECE_BISHOP;
		case 'H':
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
	public CHR(n: number): string {
		return String.fromCharCode(n);
	}
	  
	public ASC(c: string): number {
		return c.charCodeAt(0);
	}
	  
	public MIN_MAX(min: number, mid: number, max: number): number {
		return mid < min ? min : mid > max ? max : mid;
	}

	private SHELL_STEP: number[] = [0, 1, 4, 13, 40, 121, 364, 1093];

	public shellSort(mvs: number[], vls: number[]) {
		let stepLevel = 1;
		while (this.SHELL_STEP[stepLevel] < mvs.length) {
			stepLevel ++;
		}
		stepLevel --;
		while (stepLevel > 0) {
			const step = this.SHELL_STEP[stepLevel];
			for (let i = step; i < mvs.length; i ++) {
				const mvBest = mvs[i];
				const vlBest = vls[i];
				let j = i - step;
				while (j >= 0 && vlBest > vls[j]) {
					mvs[j + step] = mvs[j];
					vls[j + step] = vls[j];
					j -= step;
				}
				mvs[j + step] = mvBest;
				vls[j + step] = vlBest;
			}
			stepLevel --;
		}
	}

	public binarySearch(vlss: any[], vl: number): number {
		let low = 0;
		let high = vlss.length - 1;

		while (low <= high) {
		  const mid = (low + high) >> 1;
		  if (vlss[mid][0] < vl) {
			low = mid + 1;
		  } else if (vlss[mid][0] > vl) {
			high = mid - 1;
		  } else {
			return mid;
		  }
		}
		return -1;
	}

	SQ_X(sq: number): number {
		return SQUARE_LEFT + (this.FILE_X(sq) - 3) * SQUARE_SIZE;
	}
	  
	SQ_Y(sq: number): number {
		return SQUARE_TOP + (this.RANK_Y(sq) - 3) * SQUARE_SIZE;
	}
	  
	MOVE_PX(src: number, dst: number, step: number) {
		return Math.floor((src * step + dst * (MAX_STEP - step)) / MAX_STEP + .5) + "px";
	}
}

// Piece
export class ChineseChessPiece {
  private pieceValue: ChineseChessPieceEnum;

  constructor(piece: ChineseChessPieceEnum) {
    this.pieceValue = piece;
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

  private swap(i: number, j: number) {
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

	public static FEN_PIECE = "        KABNRCP kabnrcp ";

	public static PreGen_zobristKeyPlayer: number;
	public static PreGen_zobristLockPlayer: number;
	public static PreGen_zobristKeyTable: number[][] = []; // new int[14][256];
	public static PreGen_zobristLockTable: number[][] = []; // new int[14][256];
	public static bookSize = 0;
	public static bookLock: number[] = []; // new int[MAX_BOOK_SIZE];
	public static bookMove: number[] = []; // new short[MAX_BOOK_SIZE];
	public static bookValue: number[] = []; // = new short[MAX_BOOK_SIZE];
	private static initialized = false;
	private static objRC4: ChineseChessRC4;

	public static init() {
		if (!this.objRC4) {			
			this.objRC4 = new ChineseChessRC4([0]);
			this.PreGen_zobristKeyPlayer = this.objRC4.nextLong();
			this.objRC4.nextLong();
			this.PreGen_zobristLockPlayer = this.objRC4.nextLong();
			for (let i = 0; i < 14; i ++) {
			  const keys = [];
			  const locks = [];
			  for (let j = 0; j < 256; j ++) {
				keys.push(this.objRC4.nextLong());
				this.objRC4.nextLong();
				locks.push(this.objRC4.nextLong());
			  }
			  this.PreGen_zobristKeyTable.push(keys);
			  this.PreGen_zobristLockTable.push(locks);
			}
		}
	}

	public sdPlayer = 0;
	public squares: number[] = []; // new byte[256];

	public zobristKey = 0;
	public zobristLock = 0;
	public vlWhite = 0;
	public vlBlack = 0;
	public moveNum = 0;
	public distance = 0;

	public mvList: number[] = []; // = new int[MAX_MOVE_NUM];
	public pcList: number[] = []; //  = new int[MAX_MOVE_NUM];
	public keyList: number[] = []; // = new int[MAX_MOVE_NUM];
	public chkList: boolean[] = []; //  = new boolean[MAX_MOVE_NUM];
	private objUtil: ChineseChessUtil = new ChineseChessUtil();

	constructor() {
		ChineseChessPosition.init();		
	}

	public clearBoard() {
		this.sdPlayer = 0;
		for (let sq = 0; sq < 256; sq ++) {
			this.squares[sq] = 0;
		}
		this.zobristKey = this.zobristLock = 0;
		this.vlWhite = this.vlBlack = 0;
	}

	public setIrrev() {
		this.mvList = [0];
		this.pcList = [0];
		this.keyList = [0];
		this.chkList = [this.checked()];
		this.distance = 0;
	}

	public addPiece(sq: number, pc: number, bDel = false) {
		let pcAdjust = 0;
		this.squares[sq] = bDel ? 0 : pc;
		if (pc < 16) {
		  pcAdjust = pc - 8;
		  this.vlWhite += bDel ? -PIECE_VALUE[pcAdjust][sq] :
			  PIECE_VALUE[pcAdjust][sq];
		} else {
		  pcAdjust = pc - 16;
		  this.vlBlack += bDel ? -PIECE_VALUE[pcAdjust][this.objUtil.SQUARE_FLIP(sq)] :
			  PIECE_VALUE[pcAdjust][this.objUtil.SQUARE_FLIP(sq)];
		  pcAdjust += 7;
		}
		this.zobristKey ^= ChineseChessPosition.PreGen_zobristKeyTable[pcAdjust][sq];
		this.zobristLock ^= ChineseChessPosition.PreGen_zobristLockTable[pcAdjust][sq];
    }

	public movePiece(mv: number) {
		const sqSrc = this.objUtil.SRC(mv);
		const sqDst = this.objUtil.DST(mv);
		let pc = this.squares[sqDst];
		this.pcList.push(pc);
		if (pc > 0) {
		  this.addPiece(sqDst, pc, DEL_PIECE);
		}
		pc = this.squares[sqSrc];
		this.addPiece(sqSrc, pc, DEL_PIECE);
		this.addPiece(sqDst, pc, ADD_PIECE);
		this.mvList.push(mv);
    }

	public undoMovePiece() {
		const mv = this.mvList.pop();
		const sqSrc = this.objUtil.SRC(mv!);
		const sqDst = this.objUtil.DST(mv!);
		let pc = this.squares[sqDst];
		this.addPiece(sqDst, pc, DEL_PIECE);
		this.addPiece(sqSrc, pc, ADD_PIECE);
		pc = this.pcList.pop()!;
		if (pc > 0) {
		  this.addPiece(sqDst, pc, ADD_PIECE);
		}
    }

	public changeSide() {
		this.sdPlayer = 1 - this.sdPlayer;
		this.zobristKey ^= ChineseChessPosition.PreGen_zobristKeyPlayer;
		this.zobristLock ^= ChineseChessPosition.PreGen_zobristLockPlayer;
    }

	public makeMove(mv: number): boolean {
		const zobristKey = this.zobristKey;
		this.movePiece(mv);
		if (this.checked()) {
		  this.undoMovePiece();
		  return false;
		}
		this.keyList.push(zobristKey);
		this.changeSide();
		this.chkList.push(this.checked());
		this.distance ++;
		return true;
    }

	public undoMakeMove() {
		this.distance --;
		this.chkList.pop();
		this.changeSide();
		this.keyList.pop();
		this.undoMovePiece();
    }

	public nullMove() {
		this.mvList.push(0);
		this.pcList.push(0);
		this.keyList.push(this.zobristKey);
		this.changeSide();
		this.chkList.push(false);
		this.distance ++;
    }

	public undoNullMove() {
		this.distance --;
		this.chkList.pop();
		this.changeSide();
		this.keyList.pop();
		this.pcList.pop();
		this.mvList.pop();
    }

	public fromFen(fen: string) {
		this.clearBoard();
		let y = RANK_TOP;
		let x = FILE_LEFT;
		let index = 0;
		if (index == fen.length) {
		  this.setIrrev();
		  return;
		}
		let c = fen.charAt(index);
		while (c != " ") {
		  if (c == "/") {
			x = FILE_LEFT;
			y ++;
			if (y > RANK_BOTTOM) {
			  break;
			}
		  } else if (c >= "1" && c <= "9") {
			x += (this.objUtil.ASC(c) - this.objUtil.ASC("0"));
		  } else if (c >= "A" && c <= "Z") {
			if (x <= FILE_RIGHT) {
			  const pt = this.objUtil.CHAR_TO_PIECE(c);
			  if (pt >= 0) {
				this.addPiece(this.objUtil.COORD_XY(x, y), pt + 8);
			  }
			  x ++;
			}
		  } else if (c >= "a" && c <= "z") {
			if (x <= FILE_RIGHT) {
			  const pt = this.objUtil.CHAR_TO_PIECE(this.objUtil.CHR(this.objUtil.ASC(c) + this.objUtil.ASC("A") - this.objUtil.ASC("a")));
			  if (pt >= 0) {
				this.addPiece(this.objUtil.COORD_XY(x, y), pt + 16);
			  }
			  x ++;
			}
		  }
		  index ++;
		  if (index == fen.length) {
			this.setIrrev();
			return;
		  }
		  c = fen.charAt(index);
		}
		index ++;
		if (index == fen.length) {
		  this.setIrrev();
		  return;
		}
		if (this.sdPlayer == (fen.charAt(index) == "b" ? 0 : 1)) {
		  this.changeSide();
		}
		this.setIrrev();
	}

	public toFen(): string {
		let fen = "";
		for (let y = RANK_TOP; y <= RANK_BOTTOM; y ++) {
		  let k = 0;
		  for (let x = FILE_LEFT; x <= FILE_RIGHT; x ++) {
			const pc = this.squares[this.objUtil.COORD_XY(x, y)];
			if (pc > 0) {
			  if (k > 0) {
				fen += this.objUtil.CHR(this.objUtil.ASC("0") + k);
				k = 0;
			  }
			  fen += FEN_PIECE.charAt(pc);
			} else {
			  k ++;
			}
		  }
		  if (k > 0) {
			fen += this.objUtil.CHR(this.objUtil.ASC("0") + k);
		  }
		  fen += "/";
		}
		return fen.substring(0, fen.length - 1) +
			(this.sdPlayer == 0 ? " w" : " b");
   }

	public generateMoves(vls: number[] | null): number[] {
		const mvs: number[] = [];
		const pcSelfSide = this.objUtil.SIDE_TAG(this.sdPlayer);
		const pcOppSide = this.objUtil.OPP_SIDE_TAG(this.sdPlayer);
		for (let sqSrc = 0; sqSrc < 256; sqSrc ++) {
		  const pcSrc = this.squares[sqSrc];
		  if ((pcSrc & pcSelfSide) == 0) {
			continue;
		  }
		  switch (pcSrc - pcSelfSide) {
		  case PIECE_KING:
			for (let i = 0; i < 4; i ++) {
			  const sqDst = sqSrc + KING_DELTA[i];
			  if (!this.objUtil.IN_FORT(sqDst)) {
				continue;
			  }
			  const pcDst = this.squares[sqDst];
			  if (vls === null) {
				if ((pcDst & pcSelfSide) == 0) {
				  mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				}
			  } else if ((pcDst & pcOppSide) != 0) {
				mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				vls.push(this.objUtil.MVV_LVA(pcDst, 5));
			  }
			}
			break;
		  case PIECE_ADVISOR:
			for (let i = 0; i < 4; i ++) {
			  const sqDst = sqSrc + ADVISOR_DELTA[i];
			  if (!this.objUtil.IN_FORT(sqDst)) {
				continue;
			  }
			  const pcDst = this.squares[sqDst];
			  if (vls === null) {
				if ((pcDst & pcSelfSide) == 0) {
				  mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				}
			  } else if ((pcDst & pcOppSide) != 0) {
				mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				vls.push(this.objUtil.MVV_LVA(pcDst, 1));
			  }
			}
			break;
		  case PIECE_BISHOP:
			for (let i = 0; i < 4; i ++) {
			  let sqDst = sqSrc + ADVISOR_DELTA[i];
			  if (!(this.objUtil.IN_BOARD(sqDst) && this.objUtil.HOME_HALF(sqDst, this.sdPlayer) &&
				  this.squares[sqDst] == 0)) {
				continue;
			  }
			  sqDst += ADVISOR_DELTA[i];
			  const pcDst = this.squares[sqDst];
			  if (vls === null) {
				if ((pcDst & pcSelfSide) == 0) {
				  mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				}
			  } else if ((pcDst & pcOppSide) != 0) {
				mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				vls.push(this.objUtil.MVV_LVA(pcDst, 1));
			  }
			}
			break;
		  case PIECE_KNIGHT:
			for (let i = 0; i < 4; i ++) {
			  let sqDst = sqSrc + KING_DELTA[i];
			  if (this.squares[sqDst] > 0) {
				continue;
			  }
			  for (let j = 0; j < 2; j ++) {
				sqDst = sqSrc + KNIGHT_DELTA[i][j];
				if (!this.objUtil.IN_BOARD(sqDst)) {
				  continue;
				}
				const pcDst = this.squares[sqDst];
				if (vls === null) {
				  if ((pcDst & pcSelfSide) == 0) {
					mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				  }
				} else if ((pcDst & pcOppSide) != 0) {
				  mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				  vls.push(this.objUtil.MVV_LVA(pcDst, 1));
				}
			  }
			}
			break;
		  case PIECE_ROOK:
			for (let i = 0; i < 4; i ++) {
			  const delta = KING_DELTA[i];
			  let sqDst = sqSrc + delta;
			  while (this.objUtil.IN_BOARD(sqDst)) {
				const pcDst = this.squares[sqDst];
				if (pcDst === 0) {
				  if (vls === null) {
					mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				  }
				} else {
				  if ((pcDst & pcOppSide) != 0) {
					mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
					if (vls !== null) {
					  vls.push(this.objUtil.MVV_LVA(pcDst, 4));
					}
				  }
				  break;
				}
				sqDst += delta;
			  }
			}
			break;
		  case PIECE_CANNON:
			for (let i = 0; i < 4; i ++) {
			  const delta = KING_DELTA[i];
			  let sqDst = sqSrc + delta;
			  while (this.objUtil.IN_BOARD(sqDst)) {
				const pcDst = this.squares[sqDst];
				if (pcDst === 0) {
				  if (vls == null) {
					mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				  }
				} else {
				  break;
				}
				sqDst += delta;
			  }
			  sqDst += delta;
			  while (this.objUtil.IN_BOARD(sqDst)) {
				const pcDst = this.squares[sqDst];
				if (pcDst > 0) {
				  if ((pcDst & pcOppSide) != 0) {
					mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
					if (vls != null) {
					  vls.push(this.objUtil.MVV_LVA(pcDst, 4));
					}
				  }
				  break;
				}
				sqDst += delta;
			  }
			}
			break;
		  case PIECE_PAWN:
			// eslint-disable-next-line no-case-declarations
			let sqDst = this.objUtil.SQUARE_FORWARD(sqSrc, this.sdPlayer);
			if (this.objUtil.IN_BOARD(sqDst)) {
			  const pcDst = this.squares[sqDst];
			  if (vls === null) {
				if ((pcDst & pcSelfSide) == 0) {
				  mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				}
			  } else if ((pcDst & pcOppSide) != 0) {
				mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
				vls.push(this.objUtil.MVV_LVA(pcDst, 2));
			  }
			}
			if (this.objUtil.AWAY_HALF(sqSrc, this.sdPlayer)) {
			  for (let delta = -1; delta <= 1; delta += 2) {
				sqDst = sqSrc + delta;
				if (this.objUtil.IN_BOARD(sqDst)) {
				  const pcDst = this.squares[sqDst];
				  if (vls == null) {
					if ((pcDst & pcSelfSide) == 0) {
					  mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
					}
				  } else if ((pcDst & pcOppSide) != 0) {
					mvs.push(this.objUtil.MOVE(sqSrc, sqDst));
					vls.push(this.objUtil.MVV_LVA(pcDst, 2));
				  }
				}
			  }
			}
			break;
		  }
		}
		return mvs;
    }

	public legalMove(mv: number): boolean {
		const sqSrc = this.objUtil.SRC(mv);
		const pcSrc = this.squares[sqSrc];
		const pcSelfSide = this.objUtil.SIDE_TAG(this.sdPlayer);
		if ((pcSrc & pcSelfSide) == 0) {
		  return false;
		}
	  
		const sqDst = this.objUtil.DST(mv);
		const pcDst = this.squares[sqDst];
		if ((pcDst & pcSelfSide) != 0) {
		  return false;
		}
	  
		switch (pcSrc - pcSelfSide) {
		case PIECE_KING:
		  return this.objUtil.IN_FORT(sqDst) && this.objUtil.KING_SPAN(sqSrc, sqDst);
		case PIECE_ADVISOR:
		  return this.objUtil.IN_FORT(sqDst) && this.objUtil.ADVISOR_SPAN(sqSrc, sqDst);
		case PIECE_BISHOP:
		  return this.objUtil.SAME_HALF(sqSrc, sqDst) && this.objUtil.BISHOP_SPAN(sqSrc, sqDst) &&
			  this.squares[this.objUtil.BISHOP_PIN(sqSrc, sqDst)] == 0;
		case PIECE_KNIGHT:
			{
				const sqPin = this.objUtil.KNIGHT_PIN(sqSrc, sqDst);
				return sqPin !== sqSrc && this.squares[sqPin] === 0;
			}

		case PIECE_ROOK:
		case PIECE_CANNON:
			{
				let delta;
				if (this.objUtil.SAME_RANK(sqSrc, sqDst)) {
					delta = (sqDst < sqSrc ? -1 : 1);
				} else if (this.objUtil.SAME_FILE(sqSrc, sqDst)) {
					delta = (sqDst < sqSrc ? -16 : 16);
				} else {
					return false;
				}
				let sqPin = sqSrc + delta;
				while (sqPin != sqDst && this.squares[sqPin] == 0) {
					sqPin += delta;
				}
				if (sqPin === sqDst) {
					return pcDst == 0 || pcSrc - pcSelfSide == PIECE_ROOK;
				}
				if (pcDst == 0 || pcSrc - pcSelfSide != PIECE_CANNON) {
					return false;
				}
				sqPin += delta;
				while (sqPin != sqDst && this.squares[sqPin] == 0) {
					sqPin += delta;
				}
				return sqPin === sqDst;
			}
		case PIECE_PAWN:
		  if (this.objUtil.AWAY_HALF(sqDst, this.sdPlayer) && (sqDst === sqSrc - 1 || sqDst === sqSrc + 1)) {
			return true;
		  }
		  return sqDst === this.objUtil.SQUARE_FORWARD(sqSrc, this.sdPlayer);
		default:
		  return false;
		}	  
	}

	public checked(): boolean {
		const pcSelfSide = this.objUtil.SIDE_TAG(this.sdPlayer);
		const pcOppSide = this.objUtil.OPP_SIDE_TAG(this.sdPlayer);
		for (let sqSrc = 0; sqSrc < 256; sqSrc ++) {
		  if (this.squares[sqSrc] !== pcSelfSide + PIECE_KING) {
			continue;
		  }
		  if (this.squares[this.objUtil.SQUARE_FORWARD(sqSrc, this.sdPlayer)] === pcOppSide + PIECE_PAWN) {
			return true;
		  }
		  for (let delta = -1; delta <= 1; delta += 2) {
			if (this.squares[sqSrc + delta] === pcOppSide + PIECE_PAWN) {
			  return true;
			}
		  }
		  for (let i = 0; i < 4; i ++) {
			if (this.squares[sqSrc + ADVISOR_DELTA[i]] != 0) {
			  continue;
			}
			for (let j = 0; j < 2; j ++) {
			  const pcDst = this.squares[sqSrc + KNIGHT_CHECK_DELTA[i][j]];
			  if (pcDst === pcOppSide + PIECE_KNIGHT) {
				return true;
			  }
			}
		  }
		  for (let i = 0; i < 4; i ++) {
			const delta = KING_DELTA[i];
			let sqDst = sqSrc + delta;
			while (this.objUtil.IN_BOARD(sqDst)) {
			  const pcDst = this.squares[sqDst];
			  if (pcDst > 0) {
				if (pcDst === pcOppSide + PIECE_ROOK || pcDst === pcOppSide + PIECE_KING) {
				  return true;
				}
				break;
			  }
			  sqDst += delta;
			}
			sqDst += delta;
			while (this.objUtil.IN_BOARD(sqDst)) {
			  const pcDst = this.squares[sqDst];
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

	public isMate(): boolean {
		const mvs = this.generateMoves(null);
		for (let i = 0; i < mvs.length; i ++) {
		  if (this.makeMove(mvs[i])) {
			this.undoMakeMove();
			return false;
		  }
		}
		return true;
    }

	public mateValue(): number {
		return this.distance - MATE_VALUE;
	}

	public banValue(): number {
		return this.distance - BAN_VALUE;
	}

	public drawValue(): number {
		return (this.distance & 1) == 0 ? -DRAW_VALUE : DRAW_VALUE;
	}

	public evaluate(): number {
		const vl = (this.sdPlayer == 0 ? this.vlWhite - this.vlBlack :
			this.vlBlack - this.vlWhite) + ADVANCED_VALUE;
		return vl === this.drawValue() ? vl - 1 : vl;
    }

	public nullOkay(): boolean {
		return (this.sdPlayer == 0 ? this.vlWhite : this.vlBlack) > NULL_OKAY_MARGIN;
	}

	public nullSafe(): boolean {
		return (this.sdPlayer == 0 ? this.vlWhite : this.vlBlack) > NULL_SAFE_MARGIN;
	}

	public inCheck(): boolean {
		return this.chkList[this.chkList.length - 1];
	}

	public captured(): boolean {
		return this.pcList[this.pcList.length - 1] > 0;
	}

	public repValue(vlRep: number): number {
		const vlReturn = ((vlRep & 2) === 0 ? 0 : this.banValue()) +
			((vlRep & 4) == 0 ? 0 : -this.banValue());
		return vlReturn === 0 ? this.drawValue() : vlReturn;
	}

	public repStatus(recur_: number): number {
		let recur = recur_;
		let selfSide = false;
		let perpCheck = true;
		let oppPerpCheck = true;
		let index = this.mvList.length - 1;
		while (this.mvList[index] > 0 && this.pcList[index] === 0) {
		  if (selfSide) {
			perpCheck = perpCheck && this.chkList[index];
			if (this.keyList[index] == this.zobristKey) {
			  recur --;
			  if (recur === 0) {
				return 1 + (perpCheck ? 2 : 0) + (oppPerpCheck ? 4 : 0);
			  }
			}
		  } else {
			oppPerpCheck = oppPerpCheck && this.chkList[index];
		  }
		  selfSide = !selfSide;
		  index --;
		}
		return 0;
    }

	public mirror(): ChineseChessPosition {
		const npos = new ChineseChessPosition();
		npos.clearBoard();
		for (let sq = 0; sq < 256; sq ++) {
			const pc = this.squares[sq];
			if (pc > 0) {
				npos.addPiece(this.objUtil.MIRROR_SQUARE(sq), pc);
			}
		}
		if (this.sdPlayer == 1) {
			npos.changeSide();
		}
		return npos;
	}

	public bookMove(): number {
		if (BOOK_DAT.length == 0) {
			return 0;
		} 
		
		let mirror = false;
		let lock = this.zobristLock >>> 1; // Convert into Unsigned
		let index =  this.objUtil.binarySearch(BOOK_DAT, lock);
        if (index < 0) {
			mirror = true;
			lock = this.mirror().zobristLock >>> 1; // Convert into Unsigned
			index = this.objUtil.binarySearch(BOOK_DAT, lock);
		}
		if (index < 0) {
			return 0;
		}
		index --;
		while (index >= 0 && BOOK_DAT[index][0] == lock) {
			index --;
		}

		const mvs = [];
		const vls = [];
		let value = 0;
		index ++;
		while (index < BOOK_DAT.length && BOOK_DAT[index][0] == lock) {
			let mv = BOOK_DAT[index][1];
			mv = (mirror ? this.objUtil.MIRROR_MOVE(mv) : mv);
			if (this.legalMove(mv)) {
			  mvs.push(mv);
			  const vl = BOOK_DAT[index][2];
			  vls.push(vl);
			  value += vl;
			}
			index ++;
		}
		if (value === 0) {
			return 0;
		}
		value = Math.floor(Math.random() * value);
		for (index = 0; index < mvs.length; index ++) {
			value -= vls[index];
			if (value < 0) {
			  break;
			}
		}
		return mvs[index];
	}

	public historyIndex(mv: number): number {
		return ((this.squares[this.objUtil.SRC(mv)] - 8) << 8) + this.objUtil.DST(mv);
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

export enum ChineseChessResult {
  Unknown = 0,
  Win = 1,
  Draw = 2,
  Loss = 3,
}

interface SearchHashItem {
	depth: number;
	flag: number;
	vl: number;
	mv: number;
	zobristLock: number;
}

// Search
const HASH_ALPHA = 1;
const HASH_BETA = 2;
const HASH_PV = 3;
const LIMIT_DEPTH = 64;
const NULL_DEPTH = 2;
const RANDOM_MASK = 7;
// const MAX_GEN_MOVES = Position.MAX_GEN_MOVES;
// const MATE_VALUE = Position.MATE_VALUE;
// const BAN_VALUE = Position.BAN_VALUE;
// const WIN_VALUE = Position.WIN_VALUE;
const PHASE_HASH = 0;
const PHASE_KILLER_1 = 1;
const PHASE_KILLER_2 = 2;
const PHASE_GEN_MOVES = 3;
const PHASE_REST = 4;
const RANDOMNESS = 8;

class ChineseChessSearchSortItem {
	private mvs: number[] = [];
	private vls: number[] = [];
	private mvHash = 0;
	private mvKiller1 = 0;
	private mvKiller2 = 0;
	private pos: ChineseChessPosition;
	private index = 0;
	//private moves: number;
	private phase = PHASE_HASH;;
	public singleReply = false;
	private objUtil: ChineseChessUtil;
	private historyTable: any[] = [];

	constructor(pos: ChineseChessPosition, mvHash: number, killerTable: any, historyTable: any) {
		this.pos = pos;
		this.objUtil = new ChineseChessUtil();
		this.historyTable = historyTable;

		if (pos.inCheck()) {
			this.phase = PHASE_REST;
			const mvsAll = pos.generateMoves(null);
			for (let i = 0; i < mvsAll.length; i ++) {
				const mv = mvsAll[i]
				if (!pos.makeMove(mv)) {
					continue;
				}
				pos.undoMakeMove();
				this.mvs.push(mv);
				this.vls.push(mv == mvHash ? 0x7fffffff :
					historyTable[pos.historyIndex(mv)]);
			}
			this.objUtil.shellSort(this.mvs, this.vls);
			this.singleReply = this.mvs.length == 1;
		} else {
			this.mvHash = mvHash;
			this.mvKiller1 = killerTable[pos.distance][0];
			this.mvKiller2 = killerTable[pos.distance][1];
		}
	}

	next(): number {
		if (this.phase === PHASE_HASH) {
			this.phase = PHASE_KILLER_1;

			if (this.mvHash > 0) {
				return this.mvHash;
			}
		}

		if (this.phase === PHASE_KILLER_1) {
			this.phase = PHASE_KILLER_2;
			if (this.mvKiller1 != this.mvHash && this.mvKiller1 > 0 &&
				this.pos.legalMove(this.mvKiller1)) {
			  return this.mvKiller1;
			}
		}

		if (this.phase === PHASE_KILLER_2) {
			this.phase = PHASE_GEN_MOVES;
			if (this.mvKiller2 != this.mvHash && this.mvKiller2 > 0 &&
				this.pos.legalMove(this.mvKiller2)) {
			  return this.mvKiller2;
			}
		}

		if (this.phase === PHASE_GEN_MOVES) {
			this.phase = PHASE_REST;
			this.mvs = this.pos.generateMoves(null);
			this.vls = [];
			for (let i = 0; i < this.mvs.length; i ++) {
			  this.vls.push(this.historyTable[this.pos.historyIndex(this.mvs[i])]);
			}
			this.objUtil.shellSort(this.mvs, this.vls);
			this.index = 0;
		}

		while (this.index < this.mvs.length) {
			const mv = this.mvs[this.index];
			this.index ++;
			if (mv !== this.mvHash && mv !== this.mvKiller1 && mv !== this.mvKiller2) {
			  return mv;
			}
		}

		// switch (this.phase) {
		// 	case PHASE_HASH:
		// 	  this.phase = PHASE_KILLER_1;
		// 	  if (this.mvHash > 0) {
		// 		return this.mvHash;
		// 	  }
		// 	  // No Break
		// 	// eslint-disable-next-line no-fallthrough
		// 	case PHASE_KILLER_1:
		// 	  this.phase = PHASE_KILLER_2;
		// 	  if (this.mvKiller1 != this.mvHash && this.mvKiller1 > 0 &&
		// 		  this.pos.legalMove(this.mvKiller1)) {
		// 		return this.mvKiller1;
		// 	  }
		// 	  // No Break
		// 	// eslint-disable-next-line no-fallthrough
		// 	case PHASE_KILLER_2:
		// 	  this.phase = PHASE_GEN_MOVES;
		// 	  if (this.mvKiller2 != this.mvHash && this.mvKiller2 > 0 &&
		// 		  this.pos.legalMove(this.mvKiller2)) {
		// 		return this.mvKiller2;
		// 	  }
		// 	  // No Break
		// 	// eslint-disable-next-line no-fallthrough
		// 	case PHASE_GEN_MOVES:
		// 	  this.phase = PHASE_REST;
		// 	  this.mvs = this.pos.generateMoves(null);
		// 	  this.vls = [];
		// 	  for (let i = 0; i < this.mvs.length; i ++) {
		// 		this.vls.push(this.historyTable[this.pos.historyIndex(this.mvs[i])]);
		// 	  }
		// 	  this.objUtil.shellSort(this.mvs, this.vls);
		// 	  this.index = 0;
		// 	  // No Break
		// 	// eslint-disable-next-line no-fallthrough
		// 	default:
		// 	  while (this.index < this.mvs.length) {
		// 		const mv = this.mvs[this.index];
		// 		this.index ++;
		// 		if (mv !== this.mvHash && mv !== this.mvKiller1 && mv !== this.mvKiller2) {
		// 		  return mv;
		// 		}
		// 	  }
		// }
		return 0;
	}
}

export class ChineseChessSearch {
	private hashMask: number;
	private mvResult = 0;
	private allNodes = 0;
	private allMillis = 0;
	private hashTable: SearchHashItem[] = [];
	private pos: ChineseChessPosition;
	private historyTable: number[] = []; // new int[4096];
	private killerTable: any[] = [];
	private mvKiller: number[][] = []; // new int[LIMIT_DEPTH][2];
	private objUtil: ChineseChessUtil = new ChineseChessUtil();

	constructor(pos: ChineseChessPosition, hashLevel: number) {
		this.pos = pos;
		this.hashMask = (1 << hashLevel) - 1;
	}

	private getHashItem(): SearchHashItem {
		return this.hashTable[this.pos.zobristKey & this.hashMask];
	}

	private probeHash(vlAlpha: number, vlBeta: number, depth: number, mv: number[]) {
		const hash = this.getHashItem();
		if (hash.zobristLock != this.pos.zobristLock) {
		  mv[0] = 0;
		  return -MATE_VALUE;
		}
		mv[0] = hash.mv;
		let mate = false;
		if (hash.vl > WIN_VALUE) {
		  if (hash.vl <= BAN_VALUE) {
			return -MATE_VALUE;
		  }
		  hash.vl -= this.pos.distance;
		  mate = true;
		} else if (hash.vl < -WIN_VALUE) {
		  if (hash.vl >= -BAN_VALUE) {
			return -MATE_VALUE;
		  }
		  hash.vl += this.pos.distance;
		  mate = true;
		} else if (hash.vl == this.pos.drawValue()) {
		  return -MATE_VALUE;
		}
		if (hash.depth < depth && !mate) {
		  return -MATE_VALUE;
		}
		if (hash.flag === HASH_BETA) {
		  return (hash.vl >= vlBeta ? hash.vl : -MATE_VALUE);
		}
		if (hash.flag === HASH_ALPHA) {
		  return (hash.vl <= vlAlpha ? hash.vl : -MATE_VALUE);
		}
		return hash.vl;
	}

	private recordHash(flag: number, vl: number, depth: number, mv: number) {
		const hash = this.getHashItem();
		if (hash.depth > depth) {
		  return;
		}
		hash.flag = flag;
		hash.depth = depth;
		if (vl > WIN_VALUE) {
		  if (mv === 0 && vl <= BAN_VALUE) {
			return;
		  }
		  hash.vl = vl + this.pos.distance;
		} else if (vl < -WIN_VALUE) {
		  if (mv === 0 && vl >= -BAN_VALUE) {
			return;
		  }
		  hash.vl = vl - this.pos.distance;
		} else if (vl === this.pos.drawValue() && mv == 0) {
		  return;
		} else {
		  hash.vl = vl;
		}
		hash.mv = mv;
		hash.zobristLock = this.pos.zobristLock;
	}

	private setBestMove(mv: number, depth: number) {
		this.historyTable[this.pos.historyIndex(mv)] += depth * depth;
		const mvsKiller = this.killerTable[this.pos.distance];
		if (mvsKiller[0] !== mv) {
		  mvsKiller[1] = mvsKiller[0];
		  mvsKiller[0] = mv;
		}
	 }

	private searchQuiesc(vlAlpha_: number, vlBeta: number): number {
		let vlAlpha = vlAlpha_;
		this.allNodes ++;
		let vl = this.pos.mateValue();
		if (vl >= vlBeta) {
		  return vl;
		}
		const vlRep = this.pos.repStatus(1);
		if (vlRep > 0) {
		  return this.pos.repValue(vlRep);
		}
		if (this.pos.distance == LIMIT_DEPTH) {
		  return this.pos.evaluate();
		}
		let vlBest = -MATE_VALUE;
		let mvs = [];
		const vls: any[] = [];
		if (this.pos.inCheck()) {
		  mvs = this.pos.generateMoves(null);
		  for (let i = 0; i < mvs.length; i ++) {
			vls.push(this.historyTable[this.pos.historyIndex(mvs[i])]);
		  }
		  this.objUtil.shellSort(mvs, vls);
		} else {
		  vl = this.pos.evaluate();
		  if (vl > vlBest) {
			if (vl >= vlBeta) {
			  return vl;
			}
			vlBest = vl;
			vlAlpha = Math.max(vl, vlAlpha);
		  }
		  mvs = this.pos.generateMoves(vls);
		  this.objUtil.shellSort(mvs, vls);
		  for (let i = 0; i < mvs.length; i ++) {
			if (vls[i] < 10 || (vls[i] < 20 && this.objUtil.HOME_HALF(this.objUtil.DST(mvs[i]), this.pos.sdPlayer))) {
			  mvs.length = i;
			  break;
			}
		  }
		}
		for (let i = 0; i < mvs.length; i ++) {
		  if (!this.pos.makeMove(mvs[i])) {
			continue;
		  }
		  vl = -this.searchQuiesc(-vlBeta, -vlAlpha);
		  this.pos.undoMakeMove();
		  if (vl > vlBest) {
			if (vl >= vlBeta) {
			  return vl;
			}
			vlBest = vl;
			vlAlpha = Math.max(vl, vlAlpha);
		  }
		}
		return vlBest == -MATE_VALUE ? this.pos.mateValue() : vlBest;
   }

	// private searchNoNull(int vlAlpha, int vlBeta, int depth): number {
	// 	return searchFull(vlAlpha, vlBeta, depth, true);
	// }

	// private int searchFull(int vlAlpha, int vlBeta, int depth) {
	// 	return searchFull(vlAlpha, vlBeta, depth, false);
	// }

	private searchFull(vlAlpha_: number, vlBeta: number, depth: number, noNull: boolean): number {
		let vlAlpha = vlAlpha_;
		if (depth <= 0) {
		  return this.searchQuiesc(vlAlpha, vlBeta);
		}
		this.allNodes ++;
		let vl = this.pos.mateValue();
		if (vl >= vlBeta) {
		  return vl;
		}
		const vlRep = this.pos.repStatus(1);
		if (vlRep > 0) {
		  return this.pos.repValue(vlRep);
		}
		const mvHash = [0];
		vl = this.probeHash(vlAlpha, vlBeta, depth, mvHash);
		if (vl > -MATE_VALUE) {
		  return vl;
		}
		if (this.pos.distance === LIMIT_DEPTH) {
		  return this.pos.evaluate();
		}
		if (!noNull && !this.pos.inCheck() && this.pos.nullOkay()) {
		  this.pos.nullMove();
		  vl = -this.searchFull(-vlBeta, 1 - vlBeta, depth - NULL_DEPTH - 1, true);
		  this.pos.undoNullMove();
		  if (vl >= vlBeta && (this.pos.nullSafe() ||
			  this.searchFull(vlAlpha, vlBeta, depth - NULL_DEPTH, true) >= vlBeta)) {
			return vl;
		  }
		}
		let hashFlag = HASH_ALPHA;
		let vlBest = -MATE_VALUE;
		let mvBest = 0;
		const sort = new ChineseChessSearchSortItem(this.pos, mvHash[0], this.killerTable, this.historyTable);
		let mv = 0;
		while ((mv = sort.next()) > 0) {
		  if (!this.pos.makeMove(mv)) {
			continue;
		  }
		  const newDepth = this.pos.inCheck() || sort.singleReply ? depth : depth - 1;
		  if (vlBest === -MATE_VALUE) {
			vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);
		  } else {
			vl = -this.searchFull(-vlAlpha - 1, -vlAlpha, newDepth, false);
			if (vl > vlAlpha && vl < vlBeta) {
			  vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);
			}
		  }
		  this.pos.undoMakeMove();
		  if (vl > vlBest) {
			vlBest = vl;
			if (vl >= vlBeta) {
			  hashFlag = HASH_BETA;
			  mvBest = mv;
			  break;
			}
			if (vl > vlAlpha) {
			  vlAlpha = vl;
			  hashFlag = HASH_PV;
			  mvBest = mv;
			}
		  }
		}
		if (vlBest == -MATE_VALUE) {
		  return this.pos.mateValue();
		}
		this.recordHash(hashFlag, vlBest, depth, mvBest);
		if (mvBest > 0) {
		  this.setBestMove(mvBest, depth);
		}
		return vlBest;
   }

	private searchRoot(depth: number): number {
		let vlBest = -MATE_VALUE;
		const sort = new ChineseChessSearchSortItem(this.pos, this.mvResult, this.killerTable, this.historyTable);
		let mv = 0;
		while ((mv = sort.next()) > 0) {
		  if (!this.pos.makeMove(mv)) {
			continue;
		  }
		  const newDepth = this.pos.inCheck() ? depth : depth - 1;
		  let vl = 0;
		  if (vlBest === -MATE_VALUE) {
			vl = -this.searchFull(-MATE_VALUE, MATE_VALUE, newDepth, true);
		  } else {
			vl = -this.searchFull(-vlBest - 1, -vlBest, newDepth, false);
			if (vl > vlBest) {
			  vl = -this.searchFull(-MATE_VALUE, -vlBest, newDepth, true);
			}
		  }
		  this.pos.undoMakeMove();
		  if (vl > vlBest) {
			vlBest = vl;
			this.mvResult = mv;
			if (vlBest > -WIN_VALUE && vlBest < WIN_VALUE) {
			  vlBest += Math.floor(Math.random() * RANDOMNESS) -
				  Math.floor(Math.random() * RANDOMNESS);
			  vlBest = (vlBest == this.pos.drawValue() ? vlBest - 1 : vlBest);
			}
		  }
		}
		this.setBestMove(this.mvResult, depth);
		return vlBest;
    }

	public searchUnique(vlBeta: number, depth: number): boolean {
		const sort = new ChineseChessSearchSortItem(this.pos, this.mvResult, this.killerTable, this.historyTable);
		sort.next();
		let mv = 0;
		while ((mv = sort.next()) > 0) {
		  if (!this.pos.makeMove(mv)) {
			continue;
		  }
		  const vl = -this.searchFull(-vlBeta, 1 - vlBeta,
			  this.pos.inCheck() ? depth : depth - 1, false);
		  this.pos.undoMakeMove();
		  if (vl >= vlBeta) {
			return false;
		  }
		}
		return true;
    }

	// public int searchMain(int millis) {
	// 	return searchMain(LIMIT_DEPTH, millis);
	// }

	public searchMain(depth: number, millis: number): number {
		this.mvResult = this.pos.bookMove();
		if (this.mvResult > 0) {
		  this.pos.makeMove(this.mvResult);
		  if (this.pos.repStatus(3) == 0) {
			this.pos.undoMakeMove();
			return this.mvResult;
		  }
		  this.pos.undoMakeMove();
		}
		this.hashTable = [];
		for (let i = 0; i <= this.hashMask; i ++) {
		  this.hashTable.push({depth: 0, flag: 0, vl: 0, mv: 0, zobristLock: 0});
		}
		this.killerTable = [];
		for (let i = 0; i < LIMIT_DEPTH; i ++) {
		  this.killerTable.push([0, 0]);
		}
		this.historyTable = [];
		for (let i = 0; i < 4096; i ++) {
		  this.historyTable.push(0);
		}
		this.mvResult = 0;
		this.allNodes = 0;
		this.pos.distance = 0;
		const t = new Date().getTime();
		for (let i = 1; i <= depth; i ++) {
		  const vl = this.searchRoot(i);
		  this.allMillis = new Date().getTime() - t;
		  if (this.allMillis > millis) {
			break;
		  }
		  if (vl > WIN_VALUE || vl < -WIN_VALUE) {
			break;
		  }
		  if (this.searchUnique(1 - WIN_VALUE, i)) {
			break;
		  }
		}
		return this.mvResult;
	}

	public getKNPS(): number {
		return this.allNodes / this.allMillis;
	}
}

export class ChineseChessBoard {
  private ailevel: ChineseChessAILevel = ChineseChessAILevel.Easy;
  private playMode: ChineseChessPlayMode = ChineseChessPlayMode.PlayerFirst;
  private handicapMode: ChineseChessHandicap = ChineseChessHandicap.None;
  private result: ChineseChessResult = ChineseChessResult.Unknown;
  private pos: ChineseChessPosition = new ChineseChessPosition();
  private objUtil: ChineseChessUtil = new ChineseChessUtil();
  private mvLast = 0;
  private imgSquares: any[] = [];
  private computer = -1;
  private animated = true;
  private sound = true;
  private search: ChineseChessSearch | null = null;
  private sqSelected = 0;
  private millis = 0;
  private busy = false;

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
  get Result(): ChineseChessResult {
    return this.result;
  }
  set Result(rst: ChineseChessResult) {
    this.result = rst;
  }

  public setLayout(lay: string) {
	// TBD.
  }

  constructor(container: any) {
	this.pos.fromFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");

    for (let sq = 0; sq < 256; sq ++) {
      if (!this.objUtil.IN_BOARD(sq)) {
        this.imgSquares.push(null);
        continue;
      }

      const img = document.createElement("img");
      const style = img.style;
      style.position = "absolute";
	  const sx = this.objUtil.SQ_X(sq);
	  const sy = this.objUtil.SQ_Y(sq);
      style.left = sx.toString() + 'px';
      style.top = sy.toString() + 'px';
      style.width = SQUARE_SIZE.toString();
      style.height = SQUARE_SIZE.toString();
      style.zIndex = '0';
      img.onmousedown = () => this.clickSquare(sq);
      container.appendChild(img);
      this.imgSquares.push(img);
    }

	this.flushBoard();
  }

  clickSquare(sq_: number) {
    if (this.busy || this.result !== ChineseChessResult.Unknown) {
      return;
    }
    let sq = this.flipped(sq_);
    let pc = this.pos.squares[sq];
    if ((pc & this.objUtil.SIDE_TAG(this.pos.sdPlayer)) !== 0) {
    //   this.playSound("click");
      if (this.mvLast != 0) {
        this.drawSquare(this.objUtil.SRC(this.mvLast), false);
        this.drawSquare(this.objUtil.DST(this.mvLast), false);
      }
      if (this.sqSelected) {
        this.drawSquare(this.sqSelected, false);
      }
      this.drawSquare(sq, true);
      this.sqSelected = sq;
    } else if (this.sqSelected > 0) {
      this.addMove(this.objUtil.MOVE(this.sqSelected, sq), false);
    }
  }

  addMove(mv: number, computerMove: boolean) {
	if (!this.pos.legalMove(mv)) {
		return;
	  }
	  if (!this.pos.makeMove(mv)) {
		// this.playSound("illegal");
		return;
	  }
	  this.busy = true;
	  if (!this.animated) {
		this.postAddMove(mv, computerMove);
		return;
	  }
	
	  let sqSrc = this.flipped(this.objUtil.SRC(mv));
	  let xSrc = this.objUtil.SQ_X(sqSrc);
	  let ySrc = this.objUtil.SQ_Y(sqSrc);
	  let sqDst = this.flipped(this.objUtil.DST(mv));
	  let xDst = this.objUtil.SQ_X(sqDst);
	  let yDst = this.objUtil.SQ_Y(sqDst);
	  let style = this.imgSquares[sqSrc].style;
	  style.zIndex = 256;
	  let step = MAX_STEP - 1;

	  let timer = setInterval(() => {
		if (step == 0) {
			clearInterval(timer);
			style.left = xSrc + "px";
			style.top = ySrc + "px";
			style.zIndex = 0;
			this.postAddMove(mv, computerMove);
		  } else {
			style.left = this.objUtil.MOVE_PX(xSrc, xDst, step);
			style.top = this.objUtil.MOVE_PX(ySrc, yDst, step);
			step --;
		}  
	  }, 16);
	//   var this_ = this;
	//   var timer = setInterval(function() {
	// 	if (step == 0) {
	// 	  clearInterval(timer);
	// 	  style.left = xSrc + "px";
	// 	  style.top = ySrc + "px";
	// 	  style.zIndex = 0;
	// 	  this_.postAddMove(mv, computerMove);
	// 	} else {
	// 	  style.left = this.objUtil.MOVE_PX(xSrc, xDst, step);
	// 	  style.top = this.objUtil.MOVE_PX(ySrc, yDst, step);
	// 	  step --;
	// 	}
	//   }, 16);	
  }

  postAddMove(mv: number, computerMove: boolean) {
	if (this.mvLast > 0) {
		this.drawSquare(this.objUtil.SRC(this.mvLast), false);
		this.drawSquare(this.objUtil.DST(this.mvLast), false);
	  }
	  this.drawSquare(this.objUtil.SRC(mv), true);
	  this.drawSquare(this.objUtil.DST(mv), true);
	  this.sqSelected = 0;
	  this.mvLast = mv;
	
	  if (this.pos.isMate()) {
		// this.playSound(computerMove ? "loss" : "win");
		this.result = computerMove ? ChineseChessResult.Loss :ChineseChessResult.Win;
	
		var pc = this.objUtil.SIDE_TAG(this.pos.sdPlayer) + PIECE_KING;
		var sqMate = 0;
		for (var sq = 0; sq < 256; sq ++) {
		  if (this.pos.squares[sq] == pc) {
			sqMate = sq;
			break;
		  }
		}
		if (!this.animated || sqMate == 0) {
		  this.postMate(computerMove);
		  return;
		}
	
		sqMate = this.flipped(sqMate);
		var style = this.imgSquares[sqMate].style;
		style.zIndex = 256;
		var xMate = this.objUtil.SQ_X(sqMate);
		var step = MAX_STEP;

		var timer = setInterval(() => {
		  if (step === 0) {
			clearInterval(timer);
			style.left = xMate + "px";
			style.zIndex = 0;
			this.imgSquares[sqMate].src = 'assets/image/chinesechess/' +
				(this.pos.sdPlayer == 0 ? "r" : "b") + "km.gif";
			this.postMate(computerMove);
		  } else {
			style.left = (xMate + ((step & 1) == 0 ? step : -step) * 2) + "px";
			step --;
		  }
		}, 50);

		return;
	  }
	
	  var vlRep = this.pos.repStatus(3);
	  if (vlRep > 0) {
		vlRep = this.pos.repValue(vlRep);
		if (vlRep > -WIN_VALUE && vlRep < WIN_VALUE) {
			// this.playSound("draw");
			this.result = ChineseChessResult.Draw; //  RESULT_DRAW;
			// alertDelay("双方不变作和，辛苦了！");
		  } else if (computerMove == (vlRep < 0)) {
			// this.playSound("loss");
			this.result = ChineseChessResult.Loss; //  RESULT_LOSS;
			// alertDelay("长打作负，请不要气馁！");
		  } else {
			// this.playSound("win");
			this.result = ChineseChessResult.Win; //  RESULT_WIN;
			// alertDelay("长打作负，祝贺你取得胜利！");
		}

        this.postAddMove2();
		this.busy = false;
		return;
	  }
	
	  if (this.pos.captured()) {
		var hasMaterial = false;
		for (var sq = 0; sq < 256; sq ++) {
		  if (this.objUtil.IN_BOARD(sq) && (this.pos.squares[sq] & 7) > 2) {
			hasMaterial = true;
			break;
		  }
		}
		if (!hasMaterial) {
		  // this.playSound("draw");
		  this.result = ChineseChessResult.Draw; // RESULT_DRAW;
	      // alertDelay("双方都没有进攻棋子了，辛苦了！");
		  this.postAddMove2();
		  this.busy = false;
		  return;
		}
	  } else if (this.pos.pcList.length > 100) {
		var captured = false;
		for (var i = 2; i <= 100; i ++) {
		  if (this.pos.pcList[this.pos.pcList.length - i] > 0) {
			captured = true;
			break;
		  }
		}
		if (!captured) {
		  // this.playSound("draw");
		  this.result = ChineseChessResult.Draw; //  RESULT_DRAW;
		  // alertDelay("超过自然限着作和，辛苦了！");
		  this.postAddMove2();
		  this.busy = false;
		  return;
		}
	  }
	
	  if (this.pos.inCheck()) {
		// this.playSound(computerMove ? "check2" : "check");
	  } else if (this.pos.captured()) {
		// this.playSound(computerMove ? "capture2" : "capture");
	  } else {
		// this.playSound(computerMove ? "move2" : "move");
	  }
	
	  this.postAddMove2();
	  this.response();	
  }

  postAddMove2() {
	// if (typeof this.onAddMove == "function") {
	//   this.onAddMove();
	// }
  }

  postMate(computerMove: boolean) {
	// alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
	this.postAddMove2();
	this.busy = false;
  }

  drawSquare(sq: number, selected?: boolean) {
    const img = this.imgSquares[this.flipped(sq)];
    img.src = 'assets/image/chinesechess/' + pieceImageName[this.pos.squares[sq]] + ".gif";
    img.style.backgroundImage = selected ? "url(" + 'assets/image/chinesechess/' + "oos.gif)" : "";
  }

  flushBoard() {
    this.mvLast = this.pos.mvList[this.pos.mvList.length - 1];
    for (let sq = 0; sq < 256; sq ++) {
      if (this.objUtil.IN_BOARD(sq)) {
        this.drawSquare(sq, sq === this.objUtil.SRC(this.mvLast) || sq === this.objUtil.DST(this.mvLast));
      }
    }
  }

  start(str: string) {
    // Reset result
    this.result = ChineseChessResult.Unknown;
    this.pos.fromFen(str);
    this.flushBoard();

	this.response();
  }

  flipped(sq: number) {
    return this.computer === 0 ? this.objUtil.SQUARE_FLIP(sq) : sq;
  }
  computerMove(): boolean {
	return this.pos.sdPlayer === this.computer;
  }

  setSearch(hashLevel: number) {
	this.search = hashLevel == 0 ? null : new ChineseChessSearch(this.pos, hashLevel);
  }

  response() {
	console.debug('Entering ChineseChessBoard.response');
	if (this.search === null || !this.computerMove()) {
		this.busy = false;
		return;
    }

	//   this.thinking.style.visibility = "visible";
	//   var this_ = this;
	this.busy = true;
	setTimeout(() => {
		this.addMove(this.search!.searchMain(LIMIT_DEPTH, this.millis), true);
		// this.thinking.style.visibility = "hidden";
	}, 250);
	//   setTimeout(function() {
	// 	this_.addMove(board.search.searchMain(LIMIT_DEPTH, board.millis), true);
	// 	this_.thinking.style.visibility = "hidden";
	// }, 250);	
  }
}
