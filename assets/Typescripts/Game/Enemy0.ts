import { _decorator, Animation, Component, Sprite, SpriteFrame, Vec3, view } from 'cc';
import { EnemyManager, IEnemy } from '../Manager/EnemyManager';
import { GameManager } from '../Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('Enemy0')
export class Enemy0 extends Component implements IEnemy {
    //敌人移动速度
    private _speed: number = 700;

    //敌人默认移动方向
    private _direction: Vec3 = new Vec3(0, -1, 0)

    public _isDead: boolean = false;
    private _shouldRecycle: boolean = false; // 待回收标记 碰撞回调中只记录“待回收”状态，在 update 中安全地执行回收。

    //编辑器拖入敌人正常外观的帧（独立保存，不受动画影响）
    @property({ type: SpriteFrame, displayName: '默认外观' })
    public defaultSpriteFrame: SpriteFrame | null = null;
    //手动爆炸动画相关
    @property([SpriteFrame]) //在编辑器拖入爆炸序列帧
    public explosionFrames: SpriteFrame[] = [];
    private _frameIndex: number = 0;
    private _frameTimer: number = 0;

    @property({ displayName: '爆炸帧间隔(秒)' })
    public frameInterval: number = 0.05; //每帧持续时间(秒)
    private _isExploding: boolean = false;

    //编辑器直接拖入敌人身上的 Sprite 组件
    @property({ type: Sprite, displayName: 'Sprite 组件' })
    public spriteComp: Sprite | null = null;

    //缓存Sprite引用
    private _sprite: Sprite | null = null;

    protected start(): void {
        // 优先使用拖入的组件，否则自动查找
        if (this.spriteComp) {
            this._sprite = this.spriteComp;
        } else {
            this._sprite = this.getComponentInChildren(Sprite);
        }
        if (!this.defaultSpriteFrame && this._sprite) {
            this.defaultSpriteFrame = this._sprite.spriteFrame;
        }
    }

    update(deltaTime: number) {
        if (GameManager.inst.isPaused) return;
        // 如果标记待回收，则执行回收（此时已经离开碰撞回调）
        if (this._shouldRecycle) {
            this._shouldRecycle = false; //防止重复
            EnemyManager.inst.recycleEnemy(this.node);
            return;
        }

        //爆炸动画播放中
        if (this._isExploding) {
            this._frameTimer += deltaTime;
            if (this._frameTimer >= this.frameInterval) {
                this._frameTimer -= this.frameInterval; //减法保留溢出，保证长期平均间隔准确
                this._frameIndex++; //帧索引加 1，准备显示下一帧。
                //如果帧索引还没超过数组长度，就把 Sprite 的帧设置为 explosionFrames 中对应索引的帧。
                // 如果已经播放完所有帧，就结束爆炸状态，并标记回收。
                if (this._frameIndex < this.explosionFrames.length) {
                    if (this._sprite) {
                        this._sprite.spriteFrame = this.explosionFrames[this._frameIndex];
                    }
                } else {
                    //爆炸结束。标记回收
                    this._isExploding = false;
                    this._shouldRecycle = true;
                    return; // 本帧已经标记回收，不再移动
                }
            }
        }

        //仅当死亡且没有播放爆炸时才阻止移动
        if (this._isDead && !this._isExploding) return;

        //正常移动（爆炸时也会执行到这里）
        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        //超出屏幕下方标记回收
        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            this._shouldRecycle = true;
        }
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

        // 清除可能已存在的屏幕回收标记（关键修复！）
        this._shouldRecycle = false;

        // 最后兜底：如果 _sprite 仍为空，尝试再次获取
        if (!this._sprite) {
            if (this.spriteComp) {
                this._sprite = this.spriteComp;
            } else {
                this._sprite = this.getComponentInChildren(Sprite);
            }
            if (!this._sprite) {
                console.error('[Enemy0] Sprite 组件丢失，无法播放动画');
                this.scheduleOnce(() => { this._shouldRecycle = true; }, 0.3);
                return;
            }
        }

        this._isExploding = true;
        this._frameIndex = 0;
        this._frameTimer = 0;

        //如果爆炸序列帧非空，显示第一帧
        if (this._sprite && this.explosionFrames.length > 0) {
            this._sprite.spriteFrame = this.explosionFrames[0];
        } else {
            // 没有爆炸帧，延迟回收，避免瞬间消失
            this._isExploding = false;
            this._shouldRecycle = true;
        }
    }

    //池化激活回调
    public onSpawn() {
        this._isDead = false;
        this._shouldRecycle = false;
        this._isExploding = false;
        this._frameIndex = 0;
        this._frameTimer = 0;

        // 重新绑定 Sprite 引用（优先用拖入的）
        if (this.spriteComp) {
            this._sprite = this.spriteComp;
        } else {
            this._sprite = this.getComponentInChildren(Sprite);
        }

        //强制恢复默认外观
        if (this._sprite && this.defaultSpriteFrame) {
            this._sprite.spriteFrame = this.defaultSpriteFrame;
        } else if (this._sprite && !this.defaultSpriteFrame) {
            //若defaultSpriteFrame为空，则用当前spriteFrame 作为默认（首次）
            this.defaultSpriteFrame = this._sprite.spriteFrame;
        }
    }

    //回收回调
    public onRecycle(): void {
        //重置死亡标记和回收标记
        this._isDead = false;
        this._shouldRecycle = false;
        this._isExploding = false;
        this._frameIndex = 0;
        this._frameTimer = 0;


        //同样恢复默认外观
        if (this._sprite && this.defaultSpriteFrame) {
            this._sprite.spriteFrame = this.defaultSpriteFrame;
        }
    }

}


