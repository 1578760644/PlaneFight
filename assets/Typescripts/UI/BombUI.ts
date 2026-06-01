import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { RewardManager } from '../Manager/RewardManager';
const { ccclass, property } = _decorator;

@ccclass('BombUI')
export class BombUI extends Component {
    @property(Label)
    public bombLabel: Label = null;

    //数字跳动动画的缓动系数
    @property({ displayName: '跳动缩放比例', tooltip: '数字变化时的瞬时放大倍数' })
    public bumpScale: number = 1.3;

    //先前计数
    private _previousCount: number = -1;

    update(deltaTime: number) {
        const currentCount = RewardManager.inst.bombCount;
        if (currentCount !== this._previousCount) {
            this._previousCount = currentCount;
            this.refreshDisplay();
        }
    }

    private refreshDisplay() {
        if (!this.bombLabel) return;
        this.bombLabel.string = `x ${this._previousCount}`;

        // 弹跳动画：先放大再缩回
        if (this._previousCount !== 0) {
            tween(this.node)
                .to(0.1, { scale: new Vec3(this.bumpScale, this.bumpScale, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }
}


