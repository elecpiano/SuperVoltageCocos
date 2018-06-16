import * as Enums from "./Enums";
import * as Global from "./Global";
import CellController from "./CellController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CongratulationController extends cc.Component {

    //#region Properties

    @property(cc.Sprite)
    Panel: cc.Sprite = null;
    @property(cc.Label)
    Label: cc.Label = null;
    @property(cc.SpriteFrame)
    ComboTexture: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    ChainTexture: cc.SpriteFrame = null;

    //#endregion

    ShowAward(container: cc.Node, type: Enums.CongratulationType, count?: number){
        if (type == Enums.CongratulationType.Combo) {
            this.Panel.spriteFrame = this.ComboTexture;
        }
        else if (type == Enums.CongratulationType.Chain) {
            this.Panel.spriteFrame = this.ChainTexture;
        }

        if (count!=null) {
            this.Label.string = "X" + count.toString();            
        }
        else{
            this.Label.string = "";
        }

        container.addChild(this.node);
        this.node.scale = 0;

        this.node.runAction(
            cc.sequence(
                cc.scaleTo(Global.CONGRATULATE_DURATION, 1.2),
                cc.spawn(
                    cc.scaleTo(Global.CONGRATULATE_DURATION, 1),
                    cc.fadeTo(Global.CONGRATULATE_DURATION, 128)
                ),
                cc.callFunc(()=>container.removeChild(this.node))
            )
        );

    }

}
