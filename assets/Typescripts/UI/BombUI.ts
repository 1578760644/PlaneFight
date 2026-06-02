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
            // 只有首次从 -1 变为 0 时不播放动画（游戏启动时）
            const animate = !(this._previousCount === -1 && currentCount === 0);
            this._previousCount = currentCount;
            this.refreshDisplay(animate);
        }
    }

    private refreshDisplay(animate: boolean) {
        if (!this.bombLabel) return;
        this.bombLabel.string = `x ${this._previousCount}`;

        // 弹跳动画：先放大再缩回
        if (animate) {
            tween(this.node)
                .to(0.1, { scale: new Vec3(this.bumpScale, this.bumpScale, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }
}


