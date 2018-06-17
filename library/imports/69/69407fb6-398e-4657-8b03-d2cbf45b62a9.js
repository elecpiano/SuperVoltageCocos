"use strict";
cc._RF.push(module, '69407+2OY5GV4sD0sv0W2Kp', 'GiftController');
// Script/GiftController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Enums = require("./Enums");
var Global = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GiftController = /** @class */ (function (_super) {
    __extends(GiftController, _super);
    function GiftController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.GiftBody = null;
        // @property(cc.Sprite)
        // LongpressHint: cc.Sprite = null;
        _this.Lightning_1 = null;
        _this.Lightning_2 = null;
        _this.Bomb = null;
        _this.BombStart = null;
        _this.BombStripe = null;
        _this._GiftType = Enums.GiftType.Lightning;
        //#endregion
        //#region flicker
        _this.flicker_fadeout = true;
        _this.flicker_stopped = false;
        //#endregion
        //#region Cell Attachment
        _this.attachedCell = null;
        _this._WhereItShouldBe = new cc.Vec2(0, 0);
        //#endregion
        //#region Bomb
        _this.BombTriggered = false;
        //#endregion
        //#region Long Press
        _this.longpressHintAction = null;
        _this.longpressHintShown = false;
        _this.longpressFired = false;
        return _this;
        //#endregion
    }
    Object.defineProperty(GiftController.prototype, "GiftType", {
        get: function () {
            return this._GiftType;
        },
        set: function (type) {
            this._GiftType = type;
            if (type == Enums.GiftType.Lightning) {
                this.GiftBody.spriteFrame = this.Lightning_1;
                // this.LongpressHint.spriteFrame = this.Lightning_1;
            }
            else if (type == Enums.GiftType.Bomb) {
                this.GiftBody.spriteFrame = this.Bomb;
                // this.LongpressHint.spriteFrame = this.Bomb;
            }
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Lifecycle
    // onLoad () {}
    // start () {}
    // update (dt) {}
    //#endregion
    //#region GameBoard Activity
    GiftController.prototype.Init = function (giftType, cellToAttach) {
        this.GiftType = giftType;
        this.AttachToCell(cellToAttach);
    };
    GiftController.prototype.Burn = function () {
        if (this.GiftType == Enums.GiftType.Bomb) {
            this.TriggerAsBomb();
        }
        else if (this.GiftType == Enums.GiftType.Lightning) {
            this.discard();
        }
    };
    GiftController.prototype.MonsterCollide = function () {
        if (this.GiftType == Enums.GiftType.Bomb) {
            // this.attachedCell.gameBoard.ManuallyExplode(this);   
            this.TriggerAsBomb();
        }
        else if (this.GiftType == Enums.GiftType.Lightning) {
            this.attachedCell.gameBoard.ManuallyBurn(this.attachedCell);
        }
    };
    GiftController.prototype.flicker = function () {
        var _this = this;
        var action = this.flicker_fadeout ?
            cc.fadeTo(Global.GIFT_FLICKER_INTERVAL, 64) :
            cc.fadeTo(Global.GIFT_FLICKER_INTERVAL, 255);
        this.GiftBody.node.runAction(action);
        this.scheduleOnce(function () {
            if (!_this.flicker_stopped) {
                _this.flicker();
            }
        }, Global.GIFT_FLICKER_INTERVAL);
        this.flicker_fadeout = !this.flicker_fadeout;
    };
    Object.defineProperty(GiftController.prototype, "WhereItShouldBe", {
        get: function () {
            if (this.attachedCell != null) {
                return this.attachedCell.WhereItShouldBe;
            }
            return this._WhereItShouldBe;
        },
        enumerable: true,
        configurable: true
    });
    GiftController.prototype.AttachToCell = function (cell) {
        this.attachedCell = cell;
        cell.AttachedGift = this;
    };
    GiftController.prototype.detachFromCell = function () {
        if (this.attachedCell != null && this.attachedCell.AttachedGift == this) {
            this.attachedCell.AttachedGift = null;
            this.attachedCell = null;
        }
    };
    GiftController.prototype.Remove = function () {
        this.unschedule(this.flicker);
        this.detachFromCell();
        this.node.parent.removeChild(this.node);
    };
    //#endregion
    //#region Move
    GiftController.prototype.GetReadyForShow = function () {
        this.node.setPosition(this.attachedCell.Board_X * this.attachedCell.node.width + Global.BOARD_OFFSET_X, this.attachedCell.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
    };
    GiftController.prototype.Award = function (selector) {
        if (selector == null) {
            this.node.runAction(cc.moveTo(Global.GIFT_MOVE_DURATION, this.WhereItShouldBe));
        }
        else {
            this.node.runAction(cc.sequence(cc.moveTo(Global.GIFT_MOVE_DURATION, this.WhereItShouldBe), cc.callFunc(selector, this)));
        }
        this.flicker();
    };
    GiftController.prototype.TriggerAsBomb = function () {
        var _this = this;
        if (this.BombTriggered) {
            return;
        }
        this.BombTriggered = true;
        this.GiftBody.spriteFrame = this.BombStart;
        this.GiftBody.node.runAction(cc.sequence(cc.scaleTo(Global.BURN_DURATION * 0.3, 1.3), cc.scaleTo(Global.BURN_DURATION * 0.6, 0.5), cc.callFunc(function () { return _this.node.opacity = 0; })));
        this.attachedCell.gameBoard.QueueTriggeredBomb(this);
    };
    //#endregion
    //#region Lightning
    GiftController.prototype.discard = function () {
        var _this = this;
        this.node.runAction(cc.sequence(cc.scaleTo(Global.GIFT_MOVEMENT_DURATION, 0), cc.callFunc(function () { return _this.Remove(); })));
    };
    GiftController.prototype.ShowLongPressHint = function () {
        this.attachedCell.gameBoard.ShowChargeEffect(this.GiftType, this.node.position);
        // this.GiftBody.node.setScale(3);
    };
    GiftController.prototype.StopLongPressHint = function () {
        this.attachedCell.gameBoard.HideChargeEffect(this.GiftType);
        // this.GiftBody.node.setScale(1);
    };
    GiftController.prototype.LongPressFire = function () {
        this.StopLongPressHint();
        if (this.GiftType == Enums.GiftType.Lightning) {
            this.attachedCell.gameBoard.ManuallyBurn(this.attachedCell);
        }
        else if (this.GiftType == Enums.GiftType.Bomb) {
            this.BombTriggered = true;
            this.flicker_stopped = true;
            this.node.opacity = 0;
            this.attachedCell.gameBoard.ManuallyExplode(this);
        }
        this.longpressFired = true;
    };
    __decorate([
        property(cc.Sprite)
    ], GiftController.prototype, "GiftBody", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "Lightning_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "Lightning_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "Bomb", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "BombStart", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "BombStripe", void 0);
    GiftController = __decorate([
        ccclass
    ], GiftController);
    return GiftController;
}(cc.Component));
exports.default = GiftController;

cc._RF.pop();