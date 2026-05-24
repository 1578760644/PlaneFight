import { _decorator, Animation, animation, Collider2D, Component, Node, RigidBody2D, Vec3, view } from 'cc';
import { EnemyManager, IEnemy } from '../Manager/EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('Enemy0')
export class Enemy0 extends Component implements IEnemy {
    //敌人移动速度
    private _speed: number = 800;

    //敌人默认移动方向
    private _direction: Vec3 = new Vec3(0, -1, 0)

    public _isDead: boolean = false;
    private _shouldRecycle: boolean = false; // 待回收标记 碰撞回调中只记录“待回收”状态，在 update 中安全地执行回收。

    update(deltaTime: number) {
        // 如果标记待回收，则执行回收（此时已经离开碰撞回调）
        if (this._shouldRecycle) {
            this.doRecycle();
            return; // 回收后不再移动
        }

        //正常移动
        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            EnemyManager.inst.recycleEnemy(this.node);
        }
    }

    // 真正的回收动作，在 update 中调用，确保不在物理回调中
    private doRecycle() {
        this._shouldRecycle = false; //防止重复回收

        // 安全地禁用刚体（可选，防止回收时物理报错）
        const body = this.getComponent(RigidBody2D);
        if (body && body.enabled) {
            try { body.enabled = false; } catch (e) { }
        }
        
        EnemyManager.inst.recycleEnemy(this.node);
    }

    // 实现接口供外部调用，设置方向
    public init(direction: Vec3) {
        this._direction = direction.clone();
    }

    //被子弹击中
    public onHitByBullet() {
        //防止重复触发
        if (this._isDead) return;
        this._isDead = true;

        // 禁用碰撞体，避免重复碰撞（不涉及刚体，是安全的）
        const collider = this.getComponent(Collider2D);
        if (collider) collider.enabled = false;

        const anim = this.getComponent(Animation);
        if (anim) {
            anim.once(Animation.EventType.FINISHED, () => {
                // 延迟到下一帧回收
                this.scheduleOnce(() => {
                    EnemyManager.inst.recycleEnemy(this.node);
                }, 0);
            });
            anim.play('Enemy0_Down');
        } else {
            // 如果没有动画组件，直接回收
            EnemyManager.inst.recycleEnemy(this.node);
        }
    }

    public onRecycle(): void {
        //重置死亡标记
        this._isDead = false;

        this._shouldRecycle = false;

        //重新启用碰撞体
        const collider = this.getComponent(Collider2D);
        if (collider) collider.enabled = true;

        const body = this.getComponent(RigidBody2D);
        if (body) body.enabled = true;

        // 停止并重置动画状态（避免残留动画事件或播放状态）
        const anim = this.getComponent(Animation);
        if (anim) anim.stop();
    }

}


