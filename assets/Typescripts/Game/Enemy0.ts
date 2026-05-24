import { _decorator, Animation, animation, AnimationState, Collider2D, Component, Node, RigidBody2D, Sprite, SpriteFrame, Vec3, view } from 'cc';
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

    // 新增：在编辑器里拖入敌人正常外观的 SpriteFrame
    @property({ type: SpriteFrame, displayName: '默认外观' })
    public defaultSpriteFrame: SpriteFrame | null = null;

    private _sprite: Sprite | null = null;
    private _anim: Animation | null = null;

    // ---------- 新增：缓存动画状态，避免重复获取 ----------
    private _downState: AnimationState | null = null;

    start() {
        this._sprite = this.getComponentInChildren(Sprite);
        this._anim = this.getComponent(Animation);
        // 如果没拖入默认帧，则用当前显示的帧作为默认
        if (!this.defaultSpriteFrame && this._sprite) {
            this.defaultSpriteFrame = this._sprite.spriteFrame;
        }
    }

    update(deltaTime: number) {
        // 如果标记待回收，则执行回收（此时已经离开碰撞回调）
        if (this._shouldRecycle) {
            this.doRecycle();
            return; // 回收后不再移动
        }

        if (this._isDead) return; //死亡后不再移动

        //正常移动
        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        //屏幕外也走统一回收流程
        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            this._shouldRecycle = true;
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
            // 如果还没有缓存动画状态，可以在这里获取
            if (!this._downState) {
                this._downState = anim.getState('Enemy0_Down');
            }
            anim.once(Animation.EventType.FINISHED, () => {
                this._shouldRecycle = true;
            });
            anim.play('Enemy0_Down');
        } else {
            this._shouldRecycle = true;
        }
    }

    public onRecycle(): void {
        //重置死亡标记和回收标记
        this._isDead = false;
        this._shouldRecycle = false;

        //重新启用碰撞体
        const collider = this.getComponent(Collider2D);
        if (collider) collider.enabled = true;

        // 刚体在 getEnemy 中启用，这里不需要再开

        // 停止并重置动画状态（避免残留动画事件或播放状态）
        const anim = this.getComponent(Animation);
        if (anim) {
            anim.stop();
            if (this._downState) {
                this._downState.time = 0;
            }
        }

        // 同样恢复默认外观
        if (this._sprite && this.defaultSpriteFrame) {
            this._sprite.spriteFrame = this.defaultSpriteFrame;
        }
    }

    // 新增：池化激活回调
    public onSpawn() {
        // 重置所有运行时标记（与 onRecycle 重复，但为了安全可以都写）
        this._isDead = false;
        this._shouldRecycle = false;

        const collider = this.getComponent(Collider2D);
        if (collider) collider.enabled = true;

        if (this._anim) {
            this._anim.stop();
            const state = this._anim.getState('Enemy0_Down');
            if (state) state.time = 0;
        }
        // 同样恢复默认外观
        if (this._sprite && this.defaultSpriteFrame) {
            this._sprite.spriteFrame = this.defaultSpriteFrame;
        }
    }

}


