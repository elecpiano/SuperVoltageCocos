"use strict";
cc._RF.push(module, '2f3a8xv3ZhOY6eNRlOGwgKV', 'Enums');
// Script/Enums.ts

Object.defineProperty(exports, "__esModule", { value: true });
// declare enum CellState{
var CellState;
(function (CellState) {
    CellState[CellState["Normal"] = 0] = "Normal";
    CellState[CellState["LeftBorderConnected"] = 1] = "LeftBorderConnected";
    CellState[CellState["RightBorderConnected"] = 2] = "RightBorderConnected";
    CellState[CellState["Hint"] = 3] = "Hint";
    CellState[CellState["Burnt"] = 4] = "Burnt";
})(CellState = exports.CellState || (exports.CellState = {}));
var GameState;
(function (GameState) {
    GameState["Idle"] = "Idle";
    GameState["Hint"] = "Hint";
    GameState["Burning"] = "Burning";
    GameState["Bombing"] = "Bombing";
    GameState["Dropping"] = "Dropping";
    GameState["Filling"] = "Filling";
    GameState["Chain"] = "Chain";
    GameState["MonsterMoving"] = "MonsterMoving";
    GameState["Gifting"] = "Gifting";
})(GameState = exports.GameState || (exports.GameState = {}));
var CellType;
(function (CellType) {
    CellType["Half"] = "H";
    CellType["I"] = "i";
    CellType["L"] = "L";
    CellType["T"] = "T";
    CellType["Cross"] = "X";
    // Unknown = 5
})(CellType = exports.CellType || (exports.CellType = {}));
var Direction;
(function (Direction) {
    Direction[Direction["Top"] = 0] = "Top";
    Direction[Direction["Left"] = 1] = "Left";
    Direction[Direction["Bottom"] = 2] = "Bottom";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction = exports.Direction || (exports.Direction = {}));
var GiftType;
(function (GiftType) {
    GiftType[GiftType["Lightning"] = 0] = "Lightning";
    GiftType[GiftType["Bomb"] = 1] = "Bomb";
})(GiftType = exports.GiftType || (exports.GiftType = {}));
var CongratulationType;
(function (CongratulationType) {
    CongratulationType[CongratulationType["Combo"] = 0] = "Combo";
    CongratulationType[CongratulationType["Chain"] = 1] = "Chain";
})(CongratulationType = exports.CongratulationType || (exports.CongratulationType = {}));
var MonsterType;
(function (MonsterType) {
    MonsterType["Small"] = "S";
    MonsterType["Drunk"] = "D";
    MonsterType["Fast"] = "F";
    MonsterType["Large_2"] = "L2";
    MonsterType["Large_1"] = "L1";
    MonsterType["Queen"] = "Q";
    MonsterType["King_2"] = "K2";
    MonsterType["King_1"] = "K1"; /* each time moves two steps vertically, and one step horizontally */
})(MonsterType = exports.MonsterType || (exports.MonsterType = {}));

cc._RF.pop();