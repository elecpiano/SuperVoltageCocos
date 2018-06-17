import * as Enums from "./Enums";
import * as Global from "./Global";
import CellController from "./CellController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GiftController extends cc.Component {

    //#region Properties

    @property(cc.Sprite)
    GiftBody: cc.Sprite = null;

    // @property(cc.Sprite)
    // LongpressHint: cc.Sprite = null;

    @property(cc.SpriteFrame)
    Lightning_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    Lightning_2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    Bomb: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    BombStart: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    BombStripe: cc.SpriteFrame = null;
    
    _GiftType: Enums.GiftType = Enums.GiftType.Lightning;
    get GiftType() {
        return this._GiftType;
    }
    set GiftType(type: Enums.GiftType) {
        this._GiftType = type;
        if (type == Enums.GiftType.Lightning) {
            this.GiftBody.spriteFrame = this.Lightning_1;
            // this.LongpressHint.spriteFrame = this.Lightning_1;
        }
        else if (type == Enums.GiftType.Bomb) {
            this.GiftBody.spriteFrame = this.Bomb;
            // this.LongpressHint.spriteFrame = this.Bomb;
        }
    }

    //#endregion

    //#region Lifecycle

    // onLoad () {}

    // start () {}

    // update (dt) {}

    //#endregion

    //#region GameBoard Activity

    Init(giftType: Enums.GiftType, cellToAttach: CellController){
        this.GiftType = giftType;
        this.AttachToCell(cellToAttach);
    }

    Burn(){
        if (this.GiftType == Enums.GiftType.Bomb) {
            this.TriggerAsBomb();
        }else if (this.GiftType == Enums.GiftType.Lightning) {
            this.discard();
        }
    }

    MonsterCollide(){
        if (this.GiftType == Enums.GiftType.Bomb) {
            this.attachedCell.gameBoard.ManuallyExplode(this);   
            // this.TriggerAsBomb();         
        }else if (this.GiftType == Enums.GiftType.Lightning) {
            this.attachedCell.gameBoard.ManuallyBurn([this.attachedCell]);
        }
    }

    //#endregion

    //#region flicker

    flicker_fadeout: boolean = true;
    flicker_stopped: boolean = false;
    flicker(){
        let action: cc.Action = this.flicker_fadeout ? 
                                cc.fadeTo(Global.GIFT_FLICKER_INTERVAL,64) : 
                                cc.fadeTo(Global.GIFT_FLICKER_INTERVAL,255);
        this.GiftBody.node.runAction(action);
        this.scheduleOnce(
            ()=>{
                if (!this.flicker_stopped) {
                    this.flicker();                    
                }
            },Global.GIFT_FLICKER_INTERVAL);
        this.flicker_fadeout = !this.flicker_fadeout;
    }

    //#endregion

    //#region Cell Attachment

    attachedCell: CellController = null;

    _WhereItShouldBe: cc.Vec2 = new cc.Vec2(0,0);
    get WhereItShouldBe() {
        if (this.attachedCell != null) {
            return this.attachedCell.WhereItShouldBe;
        }
        return this._WhereItShouldBe;
    }

    AttachToCell(cell:CellController){
        this.attachedCell = cell;
        cell.AttachedGift = this;
    }

    detachFromCell(){
        if (this.attachedCell != null && this.attachedCell.AttachedGift == this) {
            this.attachedCell.AttachedGift = null;
            this.attachedCell = null;
        }
    }

    Remove(){
        this.unschedule(this.flicker);
        this.detachFromCell();
        this.node.parent.removeChild(this.node);
    }

    //#endregion

    //#region Move

    GetReadyForShow(){
        this.node.setPosition(this.attachedCell.Board_X * this.attachedCell.node.width + Global.BOARD_OFFSET_X, 
                              this.attachedCell.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
    }

    Award(selector: Function){
        if (selector == null) {
            this.node.runAction(cc.moveTo(Global.GIFT_MOVE_DURATION, this.WhereItShouldBe));
        }
        else{
            this.node.runAction(
                cc.sequence(
                    cc.moveTo(Global.GIFT_MOVE_DURATION, this.WhereItShouldBe),
                    cc.callFunc(selector, this)
                )
            );
        }
        this.flicker();
    }

    //#endregion

    //#region Bomb

    BombTriggered: boolean = false;
    TriggerAsBomb(){
        if (this.BombTriggered) {
            return;
        }
        this.BombTriggered = true;
        this.GiftBody.spriteFrame = this.BombStart;
        this.GiftBody.node.runAction(
            cc.sequence(
                cc.scaleTo(Global.BURN_DURATION * 0.3, 1.3),
                cc.scaleTo(Global.BURN_DURATION * 0.6, 0.5),
                cc.callFunc(()=>this.node.opacity=0)
            )
        );
        this.attachedCell.gameBoard.QueueTriggeredBomb(this);
    }

    //#endregion
    
    //#region Lightning

    discard(){
        this.node.runAction(
            cc.sequence(
                cc.scaleTo(Global.GIFT_MOVEMENT_DURATION, 0),
                cc.callFunc(()=>this.Remove())
            )
        );
    }

    //#endregion

    //#region Long Press

    longpressHintAction: cc.Action = null;
    longpressHintShown:boolean = false;
    longpressFired:boolean = false;

    ShowLongPressHint(){
        this.attachedCell.gameBoard.ShowChargeEffect(this.GiftType, this.node.position);
        // this.GiftBody.node.setScale(3);
    }

    StopLongPressHint(){
        this.attachedCell.gameBoard.HideChargeEffect(this.GiftType);
        // this.GiftBody.node.setScale(1);
    }

    LongPressFire(){
        this.StopLongPressHint();
        if (this.GiftType == Enums.GiftType.Lightning) {
            this.attachedCell.gameBoard.ManuallyBurn([this.attachedCell]);
        }
        else if (this.GiftType == Enums.GiftType.Bomb) {
            this.BombTriggered = true;
            this.flicker_stopped = true;
            this.node.opacity = 0;
            this.attachedCell.gameBoard.ManuallyExplode(this);
        }
        this.longpressFired = true;
    }

    //#endregion
}
