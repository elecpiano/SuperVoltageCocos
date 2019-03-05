(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/MonsterController.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '8df846M9l5E7ItczCWy0MaS', 'MonsterController', __filename);
// Script/MonsterController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameBoardController_1 = require("./GameBoardController");
var Enums = require("./Enums");
var Global = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MonsterController = /** @class */ (function (_super) {
    __extends(MonsterController, _super);
    function MonsterController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.MonsterBody = null;
        _this.MonsterEye = null;
        _this.m_eye_open = null;
        _this.m_eye_closed = null;
        _this.m_1_noraml = null;
        _this.m_1_angry = null;
        _this.m_1_shock_1 = null;
        _this.m_1_shock_2 = null;
        _this.m_2_noraml = null;
        _this.m_2_angry = null;
        _this.m_2_shock_1 = null;
        _this.m_2_shock_2 = null;
        _this.m_3_noraml = null;
        _this.m_3_angry = null;
        _this.m_3_shock_1 = null;
        _this.m_3_shock_2 = null;
        _this.m_4_noraml = null;
        _this.m_4_angry = null;
        _this.m_4_shock_1 = null;
        _this.m_4_shock_2 = null;
        _this.m_5_noraml = null;
        _this.m_5_angry = null;
        _this.m_5_shock_1 = null;
        _this.m_5_shock_2 = null;
        _this.m_6_noraml = null;
        _this.m_6_angry = null;
        _this.m_6_shock_1 = null;
        _this.m_6_shock_2 = null;
        _this.m_7_noraml = null;
        _this.m_7_angry = null;
        _this.m_7_shock_1 = null;
        _this.m_7_shock_2 = null;
        _this.m_8_noraml = null;
        _this.m_8_angry = null;
        _this.m_8_shock_1 = null;
        _this.m_8_shock_2 = null;
        _this.AudioBark = null;
        _this.sf_body_normal = null;
        _this.sf_body_shock_1 = null;
        _this.sf_body_shock_2 = null;
        _this.sf_body_angry = null;
        _this.gameBoard = null;
        _this.Health = 1;
        _this._MonsterType = Enums.MonsterType.Small;
        //#endregion
        //#region Cell Attachment
        _this.attachedCell = null;
        _this._WhereItShouldBe = new cc.Vec2(0, 0);
        //#endregion
        //#region Move Around
        _this.ShouldMoveAround = true;
        /* DO NOT directly attach the monster to target cell here,
        because it may cause redundant MoveAround() call on the same monster
        by processMonster() method in the GameBoardController.
        So let's defer the attaching job to later method, which will be executed
        after all the monsters have been correctly prepared for movement
        */
        _this.AlreadyMovedAround = false;
        //#endregion
        //#region Emotion
        _this.eyesOpen = true;
        _this.MONSTER_EYE_BASE_POS_X = -3;
        _this.MONSTER_EYE_BASE_POS_Y = 5;
        _this.IsAngry = false;
        _this.MONSTER_SCALE_DURATION = 0.15;
        _this.MONSTER_SCALE_NORMAL = 1.2;
        _this.MONSTER_SCALE_ANGRY = 1.8;
        _this.MONSTER_ANGRY_DURATION = 1;
        _this.MONSTER_thrill_count_MAX = 10;
        _this.MONSTER_thrill_INTERVAL = 0.07;
        _this.thrill_count = 0;
        //#endregion
        //#region Burn
        _this.shock_count = 0;
        _this.MONSTER_SHOCK_INTERVAL = 0.06;
        _this.MONSTER_shock_count_MAX = 13;
        _this.escaped = false;
        return _this;
        //#endregion
    }
    Object.defineProperty(MonsterController.prototype, "MonsterType", {
        get: function () {
            return this._MonsterType;
        },
        set: function (type) {
            this._MonsterType = type;
            switch (this._MonsterType) {
                case Enums.MonsterType.Small:
                    this.sf_body_normal = this.m_1_noraml;
                    this.sf_body_shock_1 = this.m_1_shock_1;
                    this.sf_body_shock_2 = this.m_1_shock_2;
                    this.sf_body_angry = this.m_1_angry;
                    this.Health = 1;
                    break;
                case Enums.MonsterType.Drunk:
                    this.sf_body_normal = this.m_2_noraml;
                    this.sf_body_shock_1 = this.m_2_shock_1;
                    this.sf_body_shock_2 = this.m_2_shock_2;
                    this.sf_body_angry = this.m_2_angry;
                    this.Health = 1;
                    break;
                case Enums.MonsterType.Fast:
                    this.sf_body_normal = this.m_5_noraml;
                    this.sf_body_shock_1 = this.m_5_shock_1;
                    this.sf_body_shock_2 = this.m_5_shock_2;
                    this.sf_body_angry = this.m_5_angry;
                    break;
                case Enums.MonsterType.Large_1:
                    this.sf_body_normal = this.m_4_noraml;
                    this.sf_body_shock_1 = this.m_4_shock_1;
                    this.sf_body_shock_2 = this.m_4_shock_2;
                    this.sf_body_angry = this.m_4_angry;
                    this.Health = 1;
                    break;
                case Enums.MonsterType.Large_2:
                    this.sf_body_normal = this.m_3_noraml;
                    this.sf_body_shock_1 = this.m_3_shock_1;
                    this.sf_body_shock_2 = this.m_3_shock_2;
                    this.sf_body_angry = this.m_3_angry;
                    this.Health = 2;
                    break;
                case Enums.MonsterType.Queen:
                    this.sf_body_normal = this.m_8_noraml;
                    this.sf_body_shock_1 = this.m_8_shock_1;
                    this.sf_body_shock_2 = this.m_8_shock_2;
                    this.sf_body_angry = this.m_8_angry;
                    this.Health = 2; /* if the health is 1, she will die */
                    break;
                case Enums.MonsterType.King_1:
                    this.sf_body_normal = this.m_7_noraml;
                    this.sf_body_shock_1 = this.m_7_shock_1;
                    this.sf_body_shock_2 = this.m_7_shock_2;
                    this.sf_body_angry = this.m_7_angry;
                    this.Health = 1;
                    break;
                case Enums.MonsterType.King_2:
                    this.sf_body_normal = this.m_6_noraml;
                    this.sf_body_shock_1 = this.m_6_shock_1;
                    this.sf_body_shock_2 = this.m_6_shock_2;
                    this.sf_body_angry = this.m_6_angry;
                    this.Health = 2;
                    break;
                default:
                    break;
            }
            this.MonsterBody.spriteFrame = this.sf_body_normal;
            this.MonsterEye.spriteFrame = this.m_eye_open;
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Lifecycle
    MonsterController.prototype.start = function () {
        this.eyeBlink();
        this.eyeMove();
    };
    MonsterController.prototype.onLoad = function () {
        this.gameBoard = cc.find("Canvas").getComponent(GameBoardController_1.default);
    };
    //#endregion
    //#region Initialization
    MonsterController.prototype.InitMonster = function (monsterType) {
        this.MonsterType = monsterType;
    };
    Object.defineProperty(MonsterController.prototype, "WhereItShouldBe", {
        get: function () {
            if (this.attachedCell != null) {
                return this.attachedCell.WhereItShouldBe;
            }
            return this._WhereItShouldBe;
        },
        enumerable: true,
        configurable: true
    });
    MonsterController.prototype.AttachToCell = function (cell) {
        //detach first
        this.detachFromCell();
        //attach
        this.attachedCell = cell;
        cell.AttachedMonster = this;
    };
    MonsterController.prototype.detachFromCell = function () {
        if (this.attachedCell != null && this.attachedCell.AttachedMonster == this) {
            this.attachedCell.AttachedMonster = null;
            this.attachedCell = null;
        }
    };
    MonsterController.prototype.GetReadyForShow = function () {
        this.node.setPosition(this.attachedCell.Board_X * this.attachedCell.node.width + Global.BOARD_OFFSET_X, this.attachedCell.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
    };
    MonsterController.prototype.MoveToWhereItShoudBe = function (selector) {
        this.node.runAction(cc.sequence(cc.moveTo(Global.MONSTER_MOVE_DURATION, this.WhereItShouldBe), cc.callFunc(selector, this)));
    };
    MonsterController.prototype.MoveAround = function () {
        if (this.ShouldMoveAround == false) {
            return false;
        }
        if (this.AlreadyMovedAround) {
            return false;
        }
        var movingTarget = null;
        if (this.MonsterType == Enums.MonsterType.Small) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else {
                var priority = [[[-1, +0]],
                    [[+0, +1], [+0, -1]]];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Drunk) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else {
                var priority = [[[-1, +1], [-1, -1]],
                    [[-1, +0]],
                    [[+0, +1], [+0, -1]]];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Fast) {
            if (this.attachedCell.Board_Y <= 1) {
                this.Escape();
            }
            else {
                var priority = [[[-2, +0]],
                    [[-1, +0]]];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Large_1 || this.MonsterType == Enums.MonsterType.Large_2) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else {
                var priority = [[[-1, +0]],
                    [[+0, +1], [+0, -1]]];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Queen) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else {
                var priority = [[[-1, +1], [-1, -1]],
                    [[-1, +0]],
                    [[+0, +1], [+0, -1]]];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.King_1 || this.MonsterType == Enums.MonsterType.King_2) {
            if (this.attachedCell.Board_Y <= 1) {
                this.Escape();
            }
            else {
                var priority = [[[-2, +1], [-2, -1]],
                    [[-2, +0]],
                    [[-1, +1], [-1, -1]],
                    [[-1, +0]],
                    [[+0, +1], [+0, -1]]];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        if (movingTarget != null) {
            this.AttachToCell(movingTarget);
            this.AlreadyMovedAround = true;
        }
        return this.escaped;
    };
    /* the type of 'priority' parameter is two-dimensional array of Tuple, whose structure is [number, number],
    this tuple is used to hold offset values for target Row and Column */
    MonsterController.prototype.tryGetAvailableCell = function (priority) {
        var resultCell = null;
        while (priority.length > 0) {
            var options = priority.shift();
            var choice = options[Math.floor(Math.random() * options.length)];
            var targetRow = this.attachedCell.Board_Y + choice[0];
            var targetCol = this.attachedCell.Board_X + choice[1];
            if (targetCol < 0 || targetCol >= Global.BOARD_COLUMN_COUNT) {
                continue;
            }
            var cell = this.gameBoard.cellMatrix[targetRow][targetCol];
            if (cell.AttachedMonster == null) {
                resultCell = cell;
                // console.log("xxx - move from (" 
                //         + this.attachedCell.Board_Y.toString()
                //         + ","
                //         + this.attachedCell.Board_X.toString()
                //         + ") to ("
                //         + targetRow.toString()
                //         + ","
                //         + targetCol.toString()
                //         + ")");
                break;
            }
            else {
                continue;
            }
        }
        return resultCell;
    };
    MonsterController.prototype.eyeBlink = function () {
        var _this = this;
        if (this.eyesOpen) {
            this.MonsterEye.spriteFrame = this.m_eye_open;
        }
        else {
            this.MonsterEye.spriteFrame = this.m_eye_closed;
        }
        var interval = Math.random() * (this.eyesOpen ? 3 : 0.3) + (this.eyesOpen ? 0.5 : 0.1);
        this.eyesOpen = !this.eyesOpen;
        this.scheduleOnce(function () {
            _this.eyeBlink();
        }, interval);
    };
    MonsterController.prototype.eyeMove = function () {
        var _this = this;
        this.MonsterEye.node.position = new cc.Vec2(cc.randomMinus1To1() * 3 + this.MONSTER_EYE_BASE_POS_X, cc.randomMinus1To1() * 3 + this.MONSTER_EYE_BASE_POS_Y);
        var interval = Math.random() * 2;
        this.scheduleOnce(function () {
            _this.eyeMove();
        }, interval);
    };
    MonsterController.prototype.setEyeVisibility = function (visible) {
        this.MonsterEye.enabled = visible;
    };
    MonsterController.prototype.GetAngry = function () {
        var _this = this;
        if (this.IsAngry) {
            return;
        }
        this.IsAngry = true;
        this.setEyeVisibility(false);
        this.MonsterBody.spriteFrame = this.sf_body_angry;
        this.node.runAction(cc.scaleTo(this.MONSTER_SCALE_DURATION, this.MONSTER_SCALE_ANGRY, this.MONSTER_SCALE_ANGRY));
        this.scheduleOnce(function () {
            _this.MonsterBody.spriteFrame = _this.sf_body_normal;
            _this.node.runAction(cc.scaleTo(_this.MONSTER_SCALE_DURATION, _this.MONSTER_SCALE_NORMAL, _this.MONSTER_SCALE_NORMAL));
            _this.setEyeVisibility(true);
            _this.IsAngry = false;
        }, this.MONSTER_ANGRY_DURATION);
        this.thrill();
        //audio
        this.AudioBark.play();
        // var sei = SE_Bark.CreateInstance();
        // sei.Volume = App.SoundEffectVolume;
        // sei.Play();
    };
    MonsterController.prototype.thrill_old = function () {
        var _this = this;
        if (this.thrill_count < this.MONSTER_thrill_count_MAX) {
            var delta = (this.thrill_count % 2) == 0 ? 0.1 : -0.1;
            this.MonsterBody.node.runAction(cc.sequence(cc.scaleBy(this.MONSTER_thrill_INTERVAL, delta), cc.callFunc(function () { return _this.thrill(); }, this)));
            this.thrill_count++;
        }
        else {
            this.thrill_count = 0;
            this.MonsterBody.node.scale = 1;
        }
    };
    MonsterController.prototype.thrill = function () {
        var _this = this;
        if (this.thrill_count < this.MONSTER_thrill_count_MAX) {
            var delta = (this.thrill_count % 2) == 0 ? 5 : -5;
            this.node.runAction(cc.sequence(cc.rotateTo(this.MONSTER_thrill_INTERVAL, delta), cc.callFunc(function () { return _this.thrill(); }, this)));
            this.thrill_count++;
        }
        else {
            this.thrill_count = 0;
            this.node.rotation = 0;
        }
    };
    MonsterController.prototype.Shock = function () {
        this.setEyeVisibility(false);
        this.shock_count = 0;
        this.shockUpdate();
        // /* queen prepare for transform */
        // if (this.MonsterType == Enums.MonsterType.Queen) {
        //     this.node.runAction(cc.scaleTo(Global.BURN_DURATION * 0.5, 0.5));
        // }
    };
    MonsterController.prototype.shockUpdate = function () {
        var _this = this;
        if (this.shock_count < this.MONSTER_shock_count_MAX) {
            this.shock_count++;
            this.MonsterBody.spriteFrame = (this.shock_count % 2) == 0 ? this.sf_body_shock_1 : this.sf_body_shock_2;
            this.scheduleOnce(function () {
                _this.shockUpdate();
            }, this.MONSTER_SHOCK_INTERVAL);
        }
        else {
            this.shock_count = 0;
        }
    };
    //#endregion
    //#region Wound, Die, Escape
    MonsterController.prototype.Wound = function () {
        var dead = false;
        this.Health--;
        if (this.Health > 0) {
            if (this.MonsterType == Enums.MonsterType.Large_2) {
                this.MonsterType = Enums.MonsterType.Large_1;
            }
            else if (this.MonsterType == Enums.MonsterType.King_2) {
                this.MonsterType = Enums.MonsterType.King_1;
            }
            else if (this.MonsterType == Enums.MonsterType.Queen) {
                this.queenTransform();
                this.ShouldMoveAround = false;
            }
            this.setEyeVisibility(true);
        }
        else {
            this.Die();
            dead = true;
        }
        return dead;
    };
    MonsterController.prototype.queenTransform = function () {
        var _this = this;
        var options = [Enums.MonsterType.Small,
            Enums.MonsterType.Drunk,
            Enums.MonsterType.Fast];
        var newMonsterType = options[Math.floor(Math.random() * options.length)];
        this.node.runAction(cc.sequence(cc.scaleTo(Global.CELL_DROP_DURATION * 0.3, 0.3), cc.callFunc(function () { return _this.MonsterType = newMonsterType; }), cc.scaleTo(Global.CELL_DROP_DURATION * 0.6, 1)));
    };
    MonsterController.prototype.Die = function () {
        var _this = this;
        this.detachFromCell();
        this.MonsterBody.spriteFrame = this.sf_body_shock_2;
        this.node.runAction(cc.fadeOut(Global.MONSTER_MOVE_DURATION));
        this.node.runAction(cc.sequence(cc.moveBy(Global.MONSTER_MOVE_DURATION, cc.p(0, this.node.height)), cc.callFunc(function () {
            _this.gameBoard.RemoveMonsterFromBoard(_this);
            _this.node.parent.removeChild(_this.node);
            // this.node.destroy();
        })));
        if (!this.gameBoard.WeaponUsed) {
            this.gameBoard.CountMonsterKill();
        }
    };
    MonsterController.prototype.Escape = function () {
        var _this = this;
        this.escaped = true;
        this.gameBoard.WarnEscape();
        this.detachFromCell();
        this.node.runAction(cc.sequence(cc.moveBy(Global.MONSTER_MOVE_DURATION, cc.p(0, -this.node.height)), cc.callFunc(function () {
            _this.gameBoard.RemoveMonsterFromBoard(_this);
            _this.node.parent.removeChild(_this.node);
            // this.node.destroy();
        })));
        // if (CoreLogic.CurrentGameLevel.Tolerance >= 1)
        // {
        //     CoreLogic.CurrentGameLevel.Tolerance--;
        //     CoreLogic.TopBar.UpdateTolerance();
        // }
    };
    //#endregion
    //#region Gift
    MonsterController.prototype.CheckGiftCollision = function () {
        var collisionHappened = false;
        if (this.attachedCell.AttachedGift != null) {
            // this.attachedCell.AttachedGift.MonsterCollide();
            collisionHappened = true;
        }
        return collisionHappened;
    };
    __decorate([
        property(cc.Sprite)
    ], MonsterController.prototype, "MonsterBody", void 0);
    __decorate([
        property(cc.Sprite)
    ], MonsterController.prototype, "MonsterEye", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_eye_open", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_eye_closed", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_1_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_1_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_1_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_1_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_2_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_2_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_2_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_2_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_3_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_3_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_3_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_3_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_4_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_4_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_4_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_4_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_5_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_5_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_5_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_5_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_6_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_6_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_6_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_6_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_7_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_7_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_7_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_7_shock_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_8_noraml", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_8_angry", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_8_shock_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], MonsterController.prototype, "m_8_shock_2", void 0);
    __decorate([
        property(cc.AudioSource)
    ], MonsterController.prototype, "AudioBark", void 0);
    MonsterController = __decorate([
        ccclass
    ], MonsterController);
    return MonsterController;
}(cc.Component));
exports.default = MonsterController;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=MonsterController.js.map
        