import { _decorator, Component, Node, Vec3, view } from 'cc';
import { IReword, RewardManager } from '../Manager/RewardManager';
import { GameManager } from '../Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('PropBullet02')
export class PropBullet02 extends Component implements IReword {
    //奖励移动速度
    private _speed: number = 500;

    //默认移动方向，默认向下
    private _direction: Vec3 = new Vec3(0, -1, 0)

    //通过正弦波来控制左右摇摆的幅度
    @property({ displayName: '摆动角度' })
    public swingAngle: number = 20;
    @property({ displayName: '摆动速度' })
    public swingSpeed: number = 8;

    private _swingTime: number = 0;

    start() {

    }

    update(deltaTime: number) {
        if (GameManager.inst.isPaused) return;

        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        //摆动
        this._swingTime += deltaTime * this.swingSpeed;
        const angle = Math.sin(this._swingTime) * this.swingAngle;
        this.node.angle = angle;

        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            this.node.destroy();
        }
    }

    // 实现 IReword 接口
    public init(direction: Vec3) {
        this._direction = direction.clone();
    }

    public onRecycle() {
        this._swingTime = 0;  // 重置摆动时间
        // 如果有其他需要重置的状态可以加在这里
    }

    public onSpawn() {
        // 从对象池取出时重置状态（如速度、角度等）
        this._swingTime = 0;
        // 设置默认方向，或者保持外部传入的方向
        this._direction.set(0, -1, 0);  // 或根据 init 传入，这里先重置
    }

    // 自定义：被玩家拾取时调用
    public onPickUp() {
        RewardManager.inst.recycleReword(this.node);
    }
}


