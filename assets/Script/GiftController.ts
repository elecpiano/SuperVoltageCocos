import * as Enums from "./Enums";
import * as Global from "./Global";
import CellController from "./CellController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GiftController extends cc.Component {

    //#region Properties

    @property(cc.Sprite)
    GiftBody: cc.Sprite = null;

    @property(cc.Sprite)
    LongpressHint: cc.Sprite = null;

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
            this.LongpressHint.spriteFrame = this.Lightning_1;
        }
        else if (type == Enums.GiftType.Bomb) {
            this.GiftBody.spriteFrame = this.Bomb;
            this.LongpressHint.spriteFrame = this.Bomb;
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
        if (this.GiftType == Enums.GiftType.Bomb)
        {
            this.TriggerAsBomb();
            return;
        }

        if (this.GiftType == Enums.GiftType.Lightning) {
            this.discard();
        }
        
        // var distance_x = (double)(Global.BOARD_COLUMN_COUNT - 1)/2 - this.AttachedToCell.Board_X;
        // var distance_y = this.AttachedToCell.Board_Y + 1;
        // var distance = Math.Sqrt(distance_x * distance_x + distance_y * distance_y);
        // TimeSpan movementDuration = TimeSpan.FromMilliseconds( Global.GIFT_MOVEMENT_DURATION.TotalMilliseconds*distance/3);

        // _Twinkle = PickUpATwinkle();

        // CoreLogic.Gifts.Remove(this);

        // MoveTo(CoreLogic.TopBar.Battery.Position, movementDuration,
        //     (sender) =>
        //     {
        //         AttachedToCell = null;
        //         ReturnATwinkle(_Twinkle);
        //         _Twinkle = null;
        //         this.GamePage.Components.Remove(this);

        //         //Charge
        //         CoreLogic.TopBar.Battery.Charge(this.ElectricQuantity);
        //     });

        // PlayGiftCollectionSoundeEffect();
    }

    //#endregion

    //#region flicker

    flicker_fadeout: boolean = true;
    flicker(){
        let action: cc.Action = this.flicker_fadeout ? 
                                cc.fadeTo(Global.GIFT_FLICKER_INTERVAL,64) : 
                                cc.fadeTo(Global.GIFT_FLICKER_INTERVAL,255);
        this.node.runAction(action);
        this.scheduleOnce(
            ()=>{
                this.flicker();
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

    GIFT_MOVE_DURATION = 1;

    GetReadyForShow(){
        this.node.setPosition(this.attachedCell.Board_X * this.attachedCell.node.width + Global.BOARD_OFFSET_X, 
                              this.attachedCell.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
    }

    Award(selector: Function){
        if (selector == null) {
            this.node.runAction(cc.moveTo(this.GIFT_MOVE_DURATION, this.WhereItShouldBe));
        }
        else{
            this.node.runAction(
                cc.sequence(
                    cc.moveTo(this.GIFT_MOVE_DURATION, this.WhereItShouldBe),
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
            cc.scaleTo(Global.GIFT_MOVEMENT_DURATION, 0.5)
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

    //#endregion Long Press

    longpressHintAction: cc.Action = null;
    longpressHintShown:boolean = false;
    ShowLongPressHint(){
        if (this.longpressHintAction == null) {
            this.longpressHintAction = 
            cc.sequence(
                cc.callFunc(()=>{
                    this.LongpressHint.node.setScale(1);
                    this.LongpressHint.node.opacity = 255;
                }),
                cc.spawn(
                    cc.fadeOut(Global.GIFT_LONGPRESS_HINT_INTERVAL),
                    cc.scaleTo(Global.GIFT_LONGPRESS_HINT_INTERVAL, 3)
                ),
                cc.callFunc(()=>{
                    this.LongpressHint.node.setScale(1);
                    this.LongpressHint.node.opacity = 255;
                }),
                cc.spawn(
                    cc.fadeOut(Global.GIFT_LONGPRESS_HINT_INTERVAL),
                    cc.scaleTo(Global.GIFT_LONGPRESS_HINT_INTERVAL, 3)
                )
            )
        }

        this.LongpressHint.node.runAction(this.longpressHintAction);
        this.longpressHintShown = true;
    }

    StopLongPressHint(){
        if (this.longpressHintShown) {
            this.LongpressHint.node.stopAction(this.longpressHintAction);            
        }
        this.LongpressHint.node.setScale(1);
        this.LongpressHint.node.opacity = 255;
    }

    LongPressFire(){
        if (this.GiftType == Enums.GiftType.Lightning) {
            this.attachedCell.gameBoard.BurnWithLightning(this.attachedCell);            
        }
        else if (this.GiftType == Enums.GiftType.Bomb) {
            this.BombTriggered = true;
            this.attachedCell.gameBoard.BombExplode(this);
        }
    }

    //#endregion
}
