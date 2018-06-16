import ElectricFlow from "./ElectricFlow";
import ElectricNode from "./ElectricNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ElectricEffect extends cc.Component {

    //#region Properties

    @property(cc.SpriteFrame)
    Texture: cc.SpriteFrame = null;

    electricFlows: Array<ElectricFlow> = new Array<ElectricFlow>();

    //#endregion

    // onLoad () {}

    // start () {}

    update (dt) {
        for (let eflow of this.electricFlows)
        {
            eflow.doUpdate(dt);
        }
    }

    AddFlow(fromElectricNode: ElectricNode = null): ElectricFlow {
        let eFlow = new ElectricFlow();
        eFlow.Init(this.Texture, this.node);
        if (fromElectricNode!=null) {
            eFlow.AddExistingElectricNode(fromElectricNode);
        }
        this.electricFlows.push(eFlow);
        return eFlow;
    }

    ClearFlows(){
        for (let eflow of this.electricFlows) {
            eflow.Clear();
        }

        this.electricFlows.splice(0, this.electricFlows.length);
    }

}
