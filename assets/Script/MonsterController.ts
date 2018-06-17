
import GameBoardController from "./GameBoardController";
import * as Enums from "./Enums";
import CellController from "./CellController";
import * as Global from "./Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MonsterController extends cc.Component {

    //#region Properties

    @property(cc.Sprite)
    MonsterBody: cc.Sprite = null;

    @property(cc.Sprite)
    MonsterEye: cc.Sprite = null;

    @property(cc.SpriteFrame)
    m_eye_open: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_eye_closed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_1_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_1_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_1_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_1_shock_2: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    m_2_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_2_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_2_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_2_shock_2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_3_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_3_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_3_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_3_shock_2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_4_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_4_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_4_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_4_shock_2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_5_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_5_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_5_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_5_shock_2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_6_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_6_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_6_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_6_shock_2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_7_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_7_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_7_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_7_shock_2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    m_8_noraml: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_8_angry: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_8_shock_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    m_8_shock_2: cc.SpriteFrame = null;

    @property(cc.AudioSource)
    AudioBark: cc.AudioSource = null;

    sf_body_normal: cc.SpriteFrame = null;
    sf_body_shock_1: cc.SpriteFrame = null;
    sf_body_shock_2: cc.SpriteFrame = null;
    sf_body_angry: cc.SpriteFrame = null;

    gameBoard: GameBoardController = null;

    Health = 1;

    _MonsterType: Enums.MonsterType = Enums.MonsterType.Small;
    get MonsterType() {
        return this._MonsterType;
    }
    set MonsterType(type: Enums.MonsterType) {
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
    }

    //#endregion

    //#region Lifecycle

    start () {
        this.eyeBlink();
        this.eyeMove();
    }

    onLoad () {
        this.gameBoard = cc.find("Canvas").getComponent(GameBoardController);
    }

    //#endregion

    //#region Initialization

    InitMonster(monsterType: Enums.MonsterType){
        this.MonsterType = monsterType;
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

        //detach first
        this.detachFromCell();

        //attach
        this.attachedCell = cell;
        cell.AttachedMonster = this;
    }

    detachFromCell(){
        if (this.attachedCell != null && this.attachedCell.AttachedMonster == this) {
            this.attachedCell.AttachedMonster = null;
            this.attachedCell = null;
        }
    }

    //#endregion

    //#region Move Around

    ShouldMoveAround = true;

    GetReadyForShow(){
        this.node.setPosition(this.attachedCell.Board_X * this.attachedCell.node.width + Global.BOARD_OFFSET_X, 
                              this.attachedCell.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
    }

    MoveToWhereItShoudBe(selector: Function){
        this.node.runAction(
            cc.sequence(
                cc.moveTo(Global.MONSTER_MOVE_DURATION, this.WhereItShouldBe),
                cc.callFunc(selector, this)
            )
        );
    }

    /* DO NOT directly attach the monster to target cell here, 
    because it may cause redundant MoveAround() call on the same monster 
    by processMonster() method in the GameBoardController.
    So let's defer the attaching job to later method, which will be executed 
    after all the monsters have been correctly prepared for movement 
    */
    AlreadyMovedAround: boolean = false;
    MoveAround() : boolean {
        if (this.ShouldMoveAround == false) {
            return false;
        }

        if (this.AlreadyMovedAround) {
            return false;
        }

        let movingTarget: CellController = null;
        if (this.MonsterType == Enums.MonsterType.Small) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else{
                let priority: [number, number][][] = [ [ [-1,+0]           ] 
                                                      ,[ [+0,+1] , [+0,-1] ] ];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Drunk) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else{
                let priority: [number, number][][] = [ [ [-1,+1] , [-1,-1] ] 
                                                      ,[ [-1,+0]           ]
                                                      ,[ [+0,+1] , [+0,-1] ] ];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Fast) {
            if (this.attachedCell.Board_Y <= 1) {
                this.Escape();
            }
            else{
                let priority: [number, number][][] = [ [ [-2,+0]           ] 
                                                        ,[ [-1,+0]           ] ];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Large_1 || this.MonsterType == Enums.MonsterType.Large_2) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else{
                let priority: [number, number][][] = [ [ [-1,+0]           ] 
                                                        ,[ [+0,+1] , [+0,-1] ] ];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.Queen) {
            if (this.attachedCell.Board_Y == 0) {
                this.Escape();
            }
            else{
                let priority: [number, number][][] = [ [ [-1,+1] , [-1,-1] ] 
                                                        ,[ [-1,+0]           ]
                                                        ,[ [+0,+1] , [+0,-1] ] ];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }
        else if (this.MonsterType == Enums.MonsterType.King_1 || this.MonsterType == Enums.MonsterType.King_2) {
            if (this.attachedCell.Board_Y <= 1) {
                this.Escape();
            }
            else{
                let priority: [number, number][][] = [ [ [-2,+1] , [-2,-1] ] 
                                                        ,[ [-2,+0]           ]
                                                        ,[ [-1,+1] , [-1,-1] ] 
                                                        ,[ [-1,+0]           ]
                                                        ,[ [+0,+1] , [+0,-1] ] ];
                movingTarget = this.tryGetAvailableCell(priority);
            }
        }

        if (movingTarget != null) {
            this.AttachToCell(movingTarget);
            this.AlreadyMovedAround = true;        
        }

        return this.escaped;
    }

    /* the type of 'priority' parameter is two-dimensional array of Tuple, whose structure is [number, number], 
    this tuple is used to hold offset values for target Row and Column */
    tryGetAvailableCell(priority: [number, number][][]) : CellController {
        let resultCell: CellController = null;
        while (priority.length > 0) {
            let options = priority.shift();
            let choice = options[Math.floor(Math.random() * options.length)];
            let targetRow = this.attachedCell.Board_Y + choice[0];
            let targetCol = this.attachedCell.Board_X + choice[1];
            
            if (targetCol < 0 || targetCol >= Global.BOARD_COLUMN_COUNT ) {
                continue;
            }

            let cell = this.gameBoard.cellMatrix[targetRow][targetCol];
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
            else{
                continue;
            }
        }

        return resultCell;
    }

    //#endregion

    //#region Emotion

    eyesOpen: boolean = true;
    MONSTER_EYE_BASE_POS_X = -3;
    MONSTER_EYE_BASE_POS_Y = 5;

    eyeBlink(){
        if (this.eyesOpen) {
            this.MonsterEye.spriteFrame = this.m_eye_open;
        }
        else
        {
            this.MonsterEye.spriteFrame = this.m_eye_closed;
        }

        let interval = Math.random() * (this.eyesOpen ? 3 : 0.3) + (this.eyesOpen ? 0.5 : 0.1);
        this.eyesOpen = !this.eyesOpen;
        this.scheduleOnce(
            ()=>{
                this.eyeBlink();
            },interval);
    }

    eyeMove(){
        this.MonsterEye.node.position = new cc.Vec2(
            cc.randomMinus1To1() * 3 + this.MONSTER_EYE_BASE_POS_X,
            cc.randomMinus1To1() * 3 + this.MONSTER_EYE_BASE_POS_Y);
        let interval = Math.random() * 2;

        this.scheduleOnce(
            ()=>{
                this.eyeMove();
            },interval);
    }

    setEyeVisibility(visible: boolean){
        this.MonsterEye.enabled = visible;
    }

    IsAngry = false;
    MONSTER_SCALE_DURATION = 0.15;
    MONSTER_SCALE_NORMAL = 1.2;
    MONSTER_SCALE_ANGRY = 1.8;
    MONSTER_ANGRY_DURATION = 1;

    GetAngry(){
        if (this.IsAngry)
        {
            return;
        }

        this.IsAngry = true;
        this.setEyeVisibility(false);
        this.MonsterBody.spriteFrame = this.sf_body_angry;
        this.node.runAction(cc.scaleTo(this.MONSTER_SCALE_DURATION, this.MONSTER_SCALE_ANGRY, this.MONSTER_SCALE_ANGRY));
        this.scheduleOnce(()=>{
            this.MonsterBody.spriteFrame = this.sf_body_normal;
            this.node.runAction(cc.scaleTo(this.MONSTER_SCALE_DURATION, this.MONSTER_SCALE_NORMAL, this.MONSTER_SCALE_NORMAL));
            this.setEyeVisibility(true);
            this.IsAngry = false;
        },this.MONSTER_ANGRY_DURATION);
        this.thrill();

        //audio
        this.AudioBark.play();
        // var sei = SE_Bark.CreateInstance();
        // sei.Volume = App.SoundEffectVolume;
        // sei.Play();
    }

    MONSTER_thrill_count_MAX = 10;
    MONSTER_thrill_INTERVAL = 0.07;
    thrill_count = 0;
    thrill_old(){
        if (this.thrill_count < this.MONSTER_thrill_count_MAX) {
            let delta = (this.thrill_count % 2) == 0 ? 0.1 : -0.1;
            this.MonsterBody.node.runAction(
                cc.sequence(
                    cc.scaleBy(this.MONSTER_thrill_INTERVAL, delta),
                    cc.callFunc(()=>this.thrill(),this)
                )
            );
            this.thrill_count++;
        }
        else{
            this.thrill_count = 0;
            this.MonsterBody.node.scale = 1;
        }
    }

    thrill(){
        if (this.thrill_count < this.MONSTER_thrill_count_MAX) {
            let delta = (this.thrill_count % 2) == 0 ? 5 : -5;
            this.node.runAction(
                cc.sequence(
                    cc.rotateTo(this.MONSTER_thrill_INTERVAL, delta),
                    cc.callFunc(()=>this.thrill(),this)
                )
            );
            this.thrill_count++;
        }
        else{
            this.thrill_count = 0;
            this.node.rotation = 0;
        }
    }

    //#endregion

    //#region Burn

    shock_count = 0;
    MONSTER_SHOCK_INTERVAL = 0.06;
    MONSTER_shock_count_MAX = 13;

    Shock(){
        this.setEyeVisibility(false);
        this.shock_count = 0;
        this.shockUpdate();

        // /* queen prepare for transform */
        // if (this.MonsterType == Enums.MonsterType.Queen) {
        //     this.node.runAction(cc.scaleTo(Global.BURN_DURATION * 0.5, 0.5));
        // }
    }

    shockUpdate(){
        if (this.shock_count < this.MONSTER_shock_count_MAX) {
            this.shock_count++;
            this.MonsterBody.spriteFrame = (this.shock_count % 2) == 0 ? this.sf_body_shock_1 : this.sf_body_shock_2;
            this.scheduleOnce(
                ()=>{
                    this.shockUpdate();
                },this.MONSTER_SHOCK_INTERVAL);
        }
        else{
            this.shock_count = 0;
        }
    }

    //#endregion

    //#region Wound, Die, Escape

    Wound() : boolean {
        let dead = false;
        this.Health--;
        if (this.Health > 0)
        {
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
        else
        {
            this.Die();
            dead = true;
        }

        return dead;
    }

    queenTransform(){
        let options = [Enums.MonsterType.Small,
                       Enums.MonsterType.Drunk,
                       Enums.MonsterType.Fast];
        let newMonsterType = options[ Math.floor(Math.random() * options.length) ];

        this.node.runAction(
            cc.sequence(
                cc.scaleTo(Global.CELL_DROP_DURATION * 0.3, 0.3),
                cc.callFunc(()=>this.MonsterType = newMonsterType),
                cc.scaleTo(Global.CELL_DROP_DURATION * 0.6, 1)
            )
        );
    }

    Die(){
        this.detachFromCell();

        this.MonsterBody.spriteFrame = this.sf_body_shock_2;
        this.node.runAction(cc.fadeOut(Global.MONSTER_MOVE_DURATION));
        this.node.runAction(
            cc.sequence(
                cc.moveBy(Global.MONSTER_MOVE_DURATION, cc.p(0,this.node.height)),
                cc.callFunc(()=>{
                    this.gameBoard.RemoveMonsterFromBoard(this);
                    this.node.parent.removeChild(this.node);
                    // this.node.destroy();
                }
            )
            ));
        
        if (!this.gameBoard.WeaponUsed)
        {
            this.gameBoard.CountMonsterKill();
        }
    }

    escaped: boolean = false;
    Escape(){
        this.escaped = true;
        this.gameBoard.WarnEscape();
        this.detachFromCell();
        this.node.runAction(
            cc.sequence(
                cc.moveBy(Global.MONSTER_MOVE_DURATION, cc.p(0, -this.node.height)),
                cc.callFunc(()=>{
                    this.gameBoard.RemoveMonsterFromBoard(this);
                    this.node.parent.removeChild(this.node);
                    // this.node.destroy();
                })
            )
        );

        // if (CoreLogic.CurrentGameLevel.Tolerance >= 1)
        // {
        //     CoreLogic.CurrentGameLevel.Tolerance--;
        //     CoreLogic.TopBar.UpdateTolerance();
        // }
    }

    //#endregion

    //#region Gift

    CheckGiftCollision() : boolean {
        let collisionHappened:boolean = false;
        if (this.attachedCell.AttachedGift != null) {
            // this.attachedCell.AttachedGift.MonsterCollide();
            collisionHappened = true;
        }
        return collisionHappened;
    }

    //#endregion
}
