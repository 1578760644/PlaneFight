import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { GameManager } from 'db://assets/Typescripts/Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('ScoreUI')
export class ScoreUI extends Component {
    @property(Label)
    public scoreLabel: Label = null!;

    @property({ displayName: '跳动缩放比例' })
    public bumpScale: number = 1.3;

    private _previousScore: number = -1;

    update(deltaTime: number) {
        if (!GameManager.inst) return;
        const currentScore = GameManager.inst.score;
        if (currentScore !== this._previousScore) {
            this._previousScore = currentScore;
            this.refreshDisplay();
        }
    }

    private refreshDisplay() {
        if (!this.scoreLabel) return;
        this.scoreLabel.string = `${this._previousScore}`;

        // 弹跳动画（可选）
        tween(this.node)
            .to(0.1, { scale: new Vec3(this.bumpScale, this.bumpScale, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }
}


