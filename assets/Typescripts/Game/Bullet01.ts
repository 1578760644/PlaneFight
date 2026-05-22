import { _decorator, Component, Node, Vec3, view } from 'cc';
import { BulletManager, ILauncher } from '../Manager/BulletManager';
const { ccclass, property } = _decorator;


@ccclass('Bullet01')
export class Bullet01 extends Component implements ILauncher {

    //子弹发射速度
    @property
    private _speed: number = 800;

    //子弹默认移动方向
    private _direction: Vec3 = new Vec3(0, 1, 0);

    update(deltaTime: number) {
        const pos = this.node.getPosition();
        //#region
        //scaleAndAdd(out: Vec3, a: Vec3, b: Vec3, scale: number): Vec3;
        //这个方法执行的是一个组合操作：out = b + a * scale
        //数学公式表达：
        //假设 a = (ax, ay, az), b = (bx, by, bz), scale = s
        //那么结果 out = (bx + ax * s, by + ay * s, bz + az * s)
        //#endregion
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime)
        this.node.setPosition(pos);

        //超出屏幕时回收（调用 BulletManager 回收）
        if (pos.y > view.getVisibleSize().height + 10) {
            BulletManager.inst.recycleBullet(this.node);
        }
    }

    // 实现接口供外部调用，设置方向
    public init(direction: Vec3) {
        //克隆当前向量
        this._direction = direction.clone();
    }
}


