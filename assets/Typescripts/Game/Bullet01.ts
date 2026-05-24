import { _decorator, Animation, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Vec3, view } from 'cc';
import { BulletManager, ILauncher } from '../Manager/BulletManager';
import { Enemy0 } from './Enemy0';
import { EnemyManager } from '../Manager/EnemyManager';
const { ccclass, property } = _decorator;


@ccclass('Bullet01')
export class Bullet01 extends Component implements ILauncher {

    //子弹发射速度
    private _speed: number = 1000;

    //子弹默认移动方向
    private _direction: Vec3 = new Vec3(0, 1, 0);

    //添加回收标记
    private _shouldRecycle: boolean = false;

    protected onLoad(): void {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    // ---------- 新增：池化接口 ----------
    public onSpawn() {
        this._shouldRecycle = false;
        this.node.active = true;                 // 确保节点可见
        const collider = this.getComponent(Collider2D);
        if (collider) collider.enabled = true;
    }

    public onRecycle() {
        this._shouldRecycle = false;
        // 停止所有动画，如果有的话
        const anim = this.getComponent(Animation);
        if (anim) anim.stop();
    }
    // ------------------------------------


    update(deltaTime: number) {
        //在update中执行回收，不再碰撞回调中直接recycle
        if (this._shouldRecycle) {
            // 注意：不再在这里设置 active=false，回收时会处理
            BulletManager.inst.recycleBullet(this.node);
            this._shouldRecycle = false;
            return;
        }

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
        if (pos.y > view.getVisibleSize().height + 1) {
            this._shouldRecycle = true; //标记回收
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const enemy0 = otherCollider.node.getComponent(Enemy0);
        //只标记回收，不修改 active
        if (enemy0 && !enemy0._isDead && !this._shouldRecycle) {
            this._shouldRecycle = true;           // 标记下帧回收（不再有 active = false）
            enemy0.onHitByBullet();
        }
    }

    // 实现接口供外部调用，设置方向
    public init(direction: Vec3) {
        //克隆当前向量
        this._direction = direction.clone();
    }
}


