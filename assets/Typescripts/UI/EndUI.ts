import { _decorator, Component, Label, Node } from 'cc';
import { GameData } from '../Manager/GameData';
const { ccclass, property } = _decorator;

@ccclass('EndUI')
export class EndUI extends Component {
    @property(Label)
    public currentScoreLabel: Label = null!;

    @property(Label)
    public highScoreLabel: Label = null!;


    start() {
        // 读取并显示当前得分
        if (this.currentScoreLabel) {
            this.currentScoreLabel.string = `${GameData.inst.currentScore}`;
        }

        // 读取并显示历史最高分
        if (this.highScoreLabel) {
            this.highScoreLabel.string = `${GameData.inst.highScore}`;
        }
    }


}


