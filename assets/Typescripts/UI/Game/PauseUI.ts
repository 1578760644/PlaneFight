import { _decorator, Component, Node } from 'cc';
import { GameManager } from 'db://assets/Typescripts/Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('PauseUI')
export class PauseUI extends Component {

    @property([Node])
    public pauseButtons: Node[] = [];

    start() {
        // 初始时显示初始状态按钮，隐藏暂停状态按钮
        this.updateButtonState();
    }

    onClickButton() {
        //切换暂停
        GameManager.inst.togglePasue();
        //更新视觉按钮
        this.updateButtonState();
    }

    private updateButtonState() {
        if (this.pauseButtons.length < 2) return;

        //根据是否暂停显示对应按钮
        const isPaused = GameManager.inst.isPaused;
        this.pauseButtons[0].active = !isPaused; // 初始状态：非暂停时显示
        this.pauseButtons[1].active = isPaused;  // 按下状态：暂停时显示
    }
}


