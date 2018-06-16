import GameBoardController from "./GameBoardController";
import * as Enums from "./Enums";
import * as Global from "./Global";
import MonsterController from "./MonsterController";
import ElectricFlow from "./ElectricEffect/ElectricFlow";
import GiftController from "./GiftController";
import ElectricEffect from "./ElectricEffect/ElectricEffect";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CellController extends cc.Component {

    //#region Properties

    @property(cc.Sprite)
    CellColor: cc.Sprite = null;

    @property(cc.Sprite)
    CellBody: cc.Sprite = null;

    @property(cc.Sprite)
    CellHint: cc.Sprite = null;

    @property(cc.SpriteFrame)
    X_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    X_Hint_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    T_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    T_Hint_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    L_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    L_Hint_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    I_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    I_Hint_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    H_Texture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    H_Hint_Texture: cc.SpriteFrame = null;

    // @property({type: cc.Enum(Enums.CellState)})
    _CellState: Enums.CellState = Enums.CellState.Normal;
    get CellState() {
        return this._CellState;
    }
    set CellState(state: Enums.CellState) {
        this._CellState = state;
        this.setColor(state);
    }

    CellType: Enums.CellType = Enums.CellType.Cross;
    
    gameBoard: GameBoardController = null;

    isBusy = false;
    rotateMinScale = 0.35;
    // CELL_PRESSED_SCALE = 0.9;
    targetAngle = 0;
    backupAngle = 0;
    currentColor = 0;// state: 0-white, 1-blue, 2-yellow, 3-green, 4-black

    Board_X = 0;
    Board_Y = 0;

    RotationQuarterCount = 0;

    _WhereItShouldBe: cc.Vec2 = new cc.Vec2(0,0);
    get WhereItShouldBe() {
        this._WhereItShouldBe.x = this.Board_X * this.node.width + Global.BOARD_OFFSET_X;
        this._WhereItShouldBe.y = this.Board_Y * this.node.height + Global.BOARD_OFFSET_Y;
        return this._WhereItShouldBe;
    }

    //#endregion

    //#region Lifecycle

    onLoad () {
        this.registerTouchEvent();
        this.gameBoard = cc.find("Canvas").getComponent(GameBoardController);
    }

    update (dt) {
        if (this.longpressCounting) {
            this.longpressTimespan += dt;
            if (this.longpressTimespan >= Global.GIFT_LONGPRESS_DURATION
                && this.longpressLevel == 1) {
                this.longPressed(2);
            }
            else if(this.longpressTimespan >= Global.GIFT_LONGPRESS_THESHOLD
                    && this.longpressLevel == 0) {
                this.longPressed(1);                    
            }
        }
    }

    //#endregion

    //#region initialization

    initCell(cellType: Enums.CellType, rotation: number, board_x: number, board_y:number){

        this.CellType = cellType;

        this.Board_X = board_x;
        this.Board_Y = board_y;

        /* it is very important to reset the RotationQuarterCount to zero,
        because when the cell is reused, it may come with legacy value */
        this.RotationQuarterCount = 0;
        this.node.rotation = rotation * -90;
        this.RotateAntennas(rotation);

        /* these values may stay affected from previous touch which happened right before burn */
        this.node.scale = 1;
        this.CellHint.node.opacity = 0;
        if (this.gameBoard.CurrentlyTouchedCell == this) {
            this.gameBoard.CurrentlyTouchedCell = null;
        }

        switch (cellType) {
            case Enums.CellType.Cross:
                this.CellBody.spriteFrame = this.X_Texture;
                this.CellHint.spriteFrame = this.X_Hint_Texture;
                break;
            case Enums.CellType.T:
                this.CellBody.spriteFrame = this.T_Texture;
                this.CellHint.spriteFrame = this.T_Hint_Texture;                
                break;
            case Enums.CellType.L:
                this.CellBody.spriteFrame = this.L_Texture;
                this.CellHint.spriteFrame = this.L_Hint_Texture;
                break;
            case Enums.CellType.I:
                this.CellBody.spriteFrame = this.I_Texture;
                this.CellHint.spriteFrame = this.I_Hint_Texture;
                break;
            case Enums.CellType.Half:
                this.CellBody.spriteFrame = this.H_Texture;
                this.CellHint.spriteFrame = this.H_Hint_Texture;
                break;
            default:
                break;
        }
    }
    //#endregion

    //#region Touch Event
    
    registerTouchEvent(){

        this.node.on(cc.Node.EventType.TOUCH_START, 
            (e)=>{
                if ( (this.gameBoard.CurrentGameState == Enums.GameState.Hint && this.gameBoard.circuitTree.indexOf(this) >= 0 ) 
                    || this.gameBoard.CurrentGameState == Enums.GameState.Idle ) {
                    
                    if (this.gameBoard.CurrentlyTouchedCell != null) {
                        return;
                    }
    
                    if (this.isBusy) {
                        return;
                    }
    
                    this.gameBoard.CurrentlyTouchedCell = this;
                    
                    this.longPressStart();
                }
            }, this);
        
        this.node.on(cc.Node.EventType.TOUCH_END,
            (e)=>{
                if (this.gameBoard.CurrentGameState == Enums.GameState.Burning)
                {
                    return;
                }

                if (this.gameBoard.CurrentlyTouchedCell != this) {
                    return;
                }

                if (this.isBusy) {
                    return;
                }

                this.longPressCancel();
                /* longpressLevel greater than zero, meaning this round of touch 
                should be considered as a LongPress, rather than a Tap */
                if (this.longpressLevel > 0) {
                    this.gameBoard.CurrentlyTouchedCell = null; 
                    return;
                }
                
                if (this.AttachedMonster != null) {
                    this.AttachedMonster.GetAngry();
                    this.gameBoard.CurrentlyTouchedCell = null;
                }
                else{
                    this.Rotate();
                }

            }, this);
        
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, 
            (e)=>{
                if (this.gameBoard.CurrentlyTouchedCell != this) {
                    return;
                }

                if (this.isBusy) {
                    return;
                }

                this.longPressCancel();

                this.gameBoard.CurrentlyTouchedCell = null;
                this.isBusy = false;
            }, this);
    }

    //#endregion

    //#region Rotation

    Rotate(){
        this.isBusy = true;
        this.CellState = Enums.CellState.Normal;

        this.gameBoard.UpdateBoard(this);

        this.node.runAction(cc.rotateBy(Global.CELL_ROTATE_DURATION * 0.5, -90));
        this.node.runAction(cc.sequence(
            cc.scaleTo(Global.CELL_ROTATE_DURATION * 0.5, this.rotateMinScale, this.rotateMinScale),
            cc.scaleTo(Global.CELL_ROTATE_DURATION * 0.5, 1, 1),
            cc.callFunc(()=>{
                this.RotateAntennas();
                this.isBusy = false;
                this.gameBoard.CurrentlyTouchedCell = null;
                this.gameBoard.UpdateBoard();
                this.gameBoard.spark(this);
            },this)
        ));
    }

    RotateAntennas(quarters = 1)
    {
        this.RotationQuarterCount += quarters;
        this.RotationQuarterCount = this.RotationQuarterCount % 4;

        switch (this.CellType)
        {
            case Enums.CellType.I:
                if (this.RotationQuarterCount == 0 || this.RotationQuarterCount == 2)
                {
                    this.TopAntenna = this.BottomAntenna = true;
                    this.LeftAntenna = this.RightAntenna = false;
                }
                else if (this.RotationQuarterCount == 1 || this.RotationQuarterCount == 3)
                {
                    this.TopAntenna = this.BottomAntenna = false;
                    this.LeftAntenna = this.RightAntenna = true;
                }
                break;
            case Enums.CellType.L:
                if (this.RotationQuarterCount == 0)
                {
                    this.TopAntenna = this.RightAntenna = true;
                    this.BottomAntenna = this.LeftAntenna = false;
                }
                else if (this.RotationQuarterCount == 1)
                {
                    this.TopAntenna = this.LeftAntenna = true;
                    this.BottomAntenna = this.RightAntenna = false;
                }
                else if (this.RotationQuarterCount == 2)
                {
                    this.TopAntenna = this.RightAntenna = false;
                    this.BottomAntenna = this.LeftAntenna = true;
                }
                else if (this.RotationQuarterCount == 3)
                {
                    this.TopAntenna = this.LeftAntenna = false;
                    this.BottomAntenna = this.RightAntenna = true;
                }
                break;
            case Enums.CellType.T:
                if (this.RotationQuarterCount == 0)
                {
                    this.LeftAntenna = this.RightAntenna = this.BottomAntenna = true;
                    this.TopAntenna = false;
                }
                else if (this.RotationQuarterCount == 1)
                {
                    this.TopAntenna = this.RightAntenna = this.BottomAntenna = true;
                    this.LeftAntenna = false;
                }
                else if (this.RotationQuarterCount == 2)
                {
                    this.LeftAntenna = this.RightAntenna = this.TopAntenna = true;
                    this.BottomAntenna = false;
                }
                else if (this.RotationQuarterCount == 3)
                {
                    this.LeftAntenna = this.TopAntenna = this.BottomAntenna = true;
                    this.RightAntenna = false;
                }
                break;
            case Enums.CellType.Cross:
                this.LeftAntenna = this.RightAntenna = this.TopAntenna = this.BottomAntenna = true;
                break;
            case Enums.CellType.Half:
                if (this.RotationQuarterCount == 0)
                {
                    this.RightAntenna = this.TopAntenna = this.LeftAntenna = false;
                    this.BottomAntenna = true;
                }
                else if (this.RotationQuarterCount == 1)
                {
                    this.TopAntenna = this.LeftAntenna = this.BottomAntenna = false;
                    this.RightAntenna = true;
                }
                else if (this.RotationQuarterCount == 2)
                {
                    this.LeftAntenna = this.BottomAntenna = this.RightAntenna = false;
                    this.TopAntenna = true;
                }
                else if (this.RotationQuarterCount == 3)
                {
                    this.BottomAntenna = this.RightAntenna = this.TopAntenna = false;
                    this.LeftAntenna = true;
                }
                break;
            default:
                break;
        }
    }

    //#endregion

    //#region Movement

    GetReadyForShow(){
        this.node.setPosition(this.Board_X * this.node.width + Global.BOARD_OFFSET_X, 
                              this.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
        this.CellState = Enums.CellState.Normal;
    }

    MoveToWhereItShouldBe(selector: Function){
        this.node.runAction(
            cc.sequence(
                cc.moveTo(Global.CELL_DROP_DURATION, this.WhereItShouldBe),
                cc.callFunc(selector, this)
            )
        );

        if (this.AttachedMonster != null)
                {
                    /*tag bug's dropping status*/
                    this.AttachedMonster.ShouldMoveAround = false;
                    this.AttachedMonster.node.runAction(cc.moveTo(Global.CELL_DROP_DURATION, this.WhereItShouldBe));
                }

        if (this.AttachedGift != null)
        {
            this.AttachedGift.node.runAction(cc.moveTo(Global.CELL_DROP_DURATION, this.WhereItShouldBe));
        }

    }

    //#endregion

    //#region Connection

    TopAntenna = false;
    BottomAntenna = false;
    LeftAntenna = false;
    RightAntenna = false;

    TopConnectedCell: CellController = null;
    LeftConnectedCell: CellController = null;
    BottomConnectedCell: CellController = null;
    RightConnectedCell: CellController = null;

    GetConnections() : Array<CellController>
    {
        this.TopConnectedCell = null;
        this.LeftConnectedCell = null;
        this.BottomConnectedCell = null;
        this.RightConnectedCell = null;

        let connections = new Array<CellController>();
        if (this.TopAntenna && this.Board_Y < (Global.BOARD_ROW_COUNT - 1))
        {
            let topCell = this.gameBoard.cellMatrix[this.Board_Y + 1][this.Board_X];
            if (topCell != null && topCell.BottomAntenna) //|| topCell.CellType == Enums.CellType.Unknown))
            {
                connections.push(topCell);
                this.TopConnectedCell = topCell;
            }
        }

        if (this.LeftAntenna && this.Board_X > 0)
        {
            let leftCell = this.gameBoard.cellMatrix[this.Board_Y][this.Board_X - 1];
            if (leftCell != null && leftCell.RightAntenna) //|| leftCell.CellType == Enums.CellType.Unknown))
            {
                connections.push(leftCell);
                this.LeftConnectedCell = leftCell;
            }
        }

        if (this.BottomAntenna && this.Board_Y > 0)
        {
            let bottomCell = this.gameBoard.cellMatrix[this.Board_Y - 1][this.Board_X];
            if (bottomCell != null && bottomCell.TopAntenna) //|| bottomCell.CellType == Enums.CellType.Unknown))
            {
                connections.push(bottomCell);
                this.BottomConnectedCell = bottomCell;
            }
        }

        if (this.RightAntenna && this.Board_X < (Global.BOARD_COLUMN_COUNT - 1))
        {
            let rightCell = this.gameBoard.cellMatrix[this.Board_Y][this.Board_X + 1];
            if (rightCell != null && rightCell.LeftAntenna) //|| rightCell.CellType == Enums.CellType.Unknown))
            {
                connections.push(rightCell);
                this.RightConnectedCell = rightCell;
            }
        }

        return connections;
    }

    //#endregion

    //#region Cell State

    SetState(leftBorderDetected : boolean, rightBorderDetected : boolean){
        let state = Enums.CellState.Normal;
        if (!leftBorderDetected && !rightBorderDetected)
        {
            state = Enums.CellState.Normal;
        }
        else if (leftBorderDetected && !rightBorderDetected)
        {
            state = Enums.CellState.LeftBorderConnected;
        }
        else if (!leftBorderDetected && rightBorderDetected)
        {
            state = Enums.CellState.RightBorderConnected;
        }
        else if (leftBorderDetected && rightBorderDetected)
        {
            state = Enums.CellState.Hint;
        }

        this.CellState = state;
    }

    setColor(state: Enums.CellState){
        switch (state) {
            case Enums.CellState.Normal:
                this.CellColor.node.color = cc.color(204, 204, 204);
                break;
            case Enums.CellState.LeftBorderConnected:
                this.CellColor.node.color = cc.color(147, 205, 221);
                break;
            case Enums.CellState.RightBorderConnected:
                this.CellColor.node.color = cc.color(234, 200, 93);            
                break;
            case Enums.CellState.Hint:
                this.CellColor.node.color = cc.color(184, 203, 145); 
                break;
            case Enums.CellState.Burnt:
                this.CellColor.node.color = cc.color(64, 64, 64); 
                break;
            default:
                break;
        }
    }

    hintAction: cc.Action = null;
    ShowHint(){
        this.hintAction = this.CellHint.node.runAction(
            cc.sequence(
                cc.fadeIn(Global.CIRCUIT_HINT_DURATION * 0.3),
                cc.fadeOut(Global.CIRCUIT_HINT_DURATION * 0.7)
            )
        );
        // this.hintAction = this.CellHint.node.runAction(cc.fadeIn(Global.CIRCUIT_HINT_DURATION * 1));
        // this.CellHint.node.opacity = 255;
    }

    AbortHint(){
        if (this.hintAction != null) {
            this.CellHint.node.stopAction(this.hintAction);
            this.CellHint.node.opacity = 0;
        }
    }

    //#endregion

    //#region Monster

    AttachedMonster: MonsterController = null;

    //#endregion

    //#region Gift

    AttachedGift: GiftController = null;

    Bomb(){
        this.CellState = Enums.CellState.Burnt;

        //process attachments
        if (this.AttachedGift != null)
        {
            this.AttachedGift.Burn();
        }
        if (this.AttachedMonster != null)
        {
            this.AttachedMonster.Shock();
        }
    }

    GetBombed() : boolean {
        let toRemove = true;

        if (this.AttachedGift != null) {
            if (this.AttachedGift.BombTriggered) {
                if (this.AttachedGift == this.gameBoard.ExplodingBomb) {
                    this.AttachedGift.Remove();
                    this.gameBoard.ExplodingBomb = null;
                }
                else{
                    toRemove = false;
                }
            }
        }

        if (this.AttachedMonster != null)
        {
            /* no matter how strong the enemy is, kill it! */
            this.AttachedMonster.Die();
        }

        return toRemove;
    }

    //#endregion

    //#region Burn

    electricEffect: ElectricEffect = null;
    flowAtTop: ElectricFlow = null;
    flowAtBottom: ElectricFlow = null;
    flowAtLeft: ElectricFlow = null;
    flowAtRight: ElectricFlow = null;

    Burn(EE: ElectricEffect, burningFrom: Enums.Direction, sourceFlow: ElectricFlow)
    {
        if (this.CellState == Enums.CellState.Burnt) {
            return;
        }
        
        this.CellState = Enums.CellState.Burnt;
        this.flowAtTop = this.flowAtBottom = this.flowAtLeft = this.flowAtRight = null;
        this.electricEffect = EE;
        let neighbours = this.GetConnections();

        //process attachments
        if (this.AttachedGift != null)
        {
            this.AttachedGift.Burn();
        }
        if (this.AttachedMonster != null)
        {
            this.AttachedMonster.Shock();
        }

        //add electric effect
        if (sourceFlow == null)
        {
            sourceFlow = this.electricEffect.AddFlow();
            //flow starts from left by default
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x - this.node.width * 0.5, this.node.position.y), 0);
        }

        //add a node at center point 
        let centerENode = sourceFlow.AddElectricNode(this.node.position, Global.ELECTRIC_NODE_RADIUS);

        if (this.RightAntenna && burningFrom != Enums.Direction.Right)
        {
            let radius = this.Board_X == (Global.BOARD_COLUMN_COUNT - 1) ? 0 : Global.ELECTRIC_NODE_RADIUS;
            if (this.Board_X == Global.BOARD_COLUMN_COUNT - 1) {
                radius = 0;
            }
            else{
                radius = this.RightConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            }

            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x + this.node.width / 2, this.node.position.y), radius);
            this.flowAtRight = sourceFlow;
            sourceFlow = null;
        }

        if (this.TopAntenna && burningFrom != Enums.Direction.Top)
        {
            if (sourceFlow == null)
            {
                sourceFlow = this.electricEffect.AddFlow(centerENode);
                // sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y), Global.ELECTRIC_NODE_RADIUS);
            }
            let radius = this.TopConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y + this.node.height / 2), radius);
            this.flowAtTop = sourceFlow;
            sourceFlow = null;
        }

        if (this.BottomAntenna && burningFrom != Enums.Direction.Bottom)
        {
            if (sourceFlow == null)
            {
                sourceFlow = this.electricEffect.AddFlow(centerENode);
                // sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y), Global.ELECTRIC_NODE_RADIUS);
            }
            let radius = this.BottomConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y - this.node.height / 2), radius);
            this.flowAtBottom = sourceFlow;
            sourceFlow = null;
        }

        if (this.LeftAntenna && burningFrom != Enums.Direction.Left)
        {
            if (sourceFlow == null)
            {
                sourceFlow = this.electricEffect.AddFlow(centerENode);
                // sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y), Global.ELECTRIC_NODE_RADIUS);
            }
            let radius = this.LeftConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x - this.node.width / 2, this.node.position.y), radius);
            this.flowAtLeft = sourceFlow;
            sourceFlow = null;
        }

        // burn neighbours
        for (let cell of neighbours)
        {
            let passingInFlow = null;
            let fromWhichSide = Enums.Direction.Top;
            if (cell == this.TopConnectedCell && burningFrom != Enums.Direction.Top)
            {
                fromWhichSide = Enums.Direction.Bottom;
                passingInFlow = this.flowAtTop;
            }
            else if (cell == this.LeftConnectedCell && burningFrom != Enums.Direction.Left)
            {
                fromWhichSide = Enums.Direction.Right;
                passingInFlow = this.flowAtLeft;
            }
            else if (cell == this.BottomConnectedCell && burningFrom != Enums.Direction.Bottom)
            {
                fromWhichSide = Enums.Direction.Top;
                passingInFlow = this.flowAtBottom;
            }
            else if (cell == this.RightConnectedCell && burningFrom != Enums.Direction.Right)
            {
                fromWhichSide = Enums.Direction.Left;
                passingInFlow = this.flowAtRight;
            }

            cell.Burn(EE, fromWhichSide, passingInFlow);
        }
    }

    GetBurnt() : boolean {
        let toRemove = true;

        /* Let's delay this cell's removal to the bomb explosion. */
        if (this.AttachedGift!=null && this.AttachedGift.GiftType == Enums.GiftType.Bomb){
            toRemove = false;
            this.CellState = Enums.CellState.Burnt;
        }

        if (this.AttachedMonster != null)
        {
            let dead = this.AttachedMonster.Wound();
            if (dead == false) {
                toRemove = false;
                this.CellState = Enums.CellState.Normal;
            }
        }

        return toRemove;
    }

    //#endregion

    //#region Long Press

    longpressCounting:boolean = false;
    longpressTimespan:number = 0;
    longpressLevel = 0;
    longPressStart(){
        this.longpressLevel = 0;        
        this.longpressTimespan = 0;
        this.longpressCounting = true;
    }

    longPressed(level:number){
        this.longpressLevel = level;

        if (level == 1) {
            if (this.AttachedGift!=null) {
                this.AttachedGift.ShowLongPressHint();
            }
        }
        else if (level == 2) {
            if (this.AttachedGift != null) {
                this.AttachedGift.LongPressFire();            
            }
        }
    }

    longPressCancel(){
        this.longpressCounting = false;

        if (this.AttachedGift != null) {
            this.AttachedGift.StopLongPressHint();
        }
    }

    //#endregion
}


