import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, view } from 'cc';
import { EnemyManager, IEnemy } from '../Manager/EnemyManager';
import { GameManager } from '../Manager/GameManager';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Enemy2')
export class Enemy2 extends Component implements IEnemy {
    //敌人移动速度
    private _speed: number = 200;

    //最大血量和当前血量
    public maxHp: number = 10;
    public currentHp: number = 10;

    //敌人默认移动方向
    private _direction: Vec3 = new Vec3(0, -1, 0)
    private _isDead: boolean = false;
    private _shouldRecycle: boolean = false;

    @property({ type: SpriteFrame, displayName: '默认外观' })
    public defaultSpriteFrame: SpriteFrame | null = null;
    @property([SpriteFrame])
    public explosionFrames: SpriteFrame[] = [];
    private _frameIndex: number = 0;
    private _frameTimer: number = 0;
    @property({ displayName: '爆炸帧间隔（秒）' })
    public frameInterval: number = 0.1;
    private _isExploding: boolean = false;

    // 受击动画相关
    @property([SpriteFrame])
    public hurtFrames: SpriteFrame[] = [];   // 在编辑器拖入受击帧（两张）
    @property({ displayName: '受击帧间隔(秒)' })
    public hurtFrameInterval: number = 0.08; // 受击帧切换间隔
    private _isHurting: boolean = false;
    private _hurtFrameIndex: number = 0;      // 当前受击帧索引
    private _hurtFrameTimer: number = 0;      // 受击计时器

    @property({ type: Sprite, displayName: 'Sprite组件' })
    public spriteComp: Sprite | null = null;
    private _sprite: Sprite = null!;

    protected start(): void {
        //初始化血量
        this.currentHp = this.maxHp;

        this._sprite = this.spriteComp || this.getComponentInChildren(Sprite)!;
        if (!this.defaultSpriteFrame) {
            this.defaultSpriteFrame = this._sprite.spriteFrame;
        }
    }

    // 在 update 中添加受击动画播放逻辑（放在爆炸动画判断之前）
    update(deltaTime: number) {
        if (GameManager.inst.isPaused) return;
        if (this._shouldRecycle) {
            this._shouldRecycle = false;
            EnemyManager.inst.recycleEnemy(this.node);
            return;
        }

        // 受击动画播放
        if (this._isHurting) {
            this._hurtFrameTimer += deltaTime;
            if (this._hurtFrameTimer >= this.hurtFrameInterval) {
                this._hurtFrameTimer -= this.hurtFrameInterval;
                this._hurtFrameIndex++;
                if (this._hurtFrameIndex < this.hurtFrames.length) {
                    this._sprite.spriteFrame = this.hurtFrames[this._hurtFrameIndex];
                } else {
                    // 受击帧播放完毕，恢复默认外观
                    this._isHurting = false;
                    this._hurtFrameIndex = 0;
                    this._hurtFrameTimer = 0;
                    if (!this._isDead && !this._isExploding) {
                        this._sprite.spriteFrame = this.defaultSpriteFrame!;
                    }
                }
            }
        }

        //爆炸动画
        if (this._isExploding) {
            this._frameTimer += deltaTime;
            if (this._frameTimer >= this.frameInterval) {
                this._frameTimer -= this.frameInterval;
                this._frameIndex++
                if (this._frameIndex < this.explosionFrames.length) {
                    this._sprite.spriteFrame = this.explosionFrames[this._frameIndex];
                } else {
                    this._isExploding = false;
                    this._shouldRecycle = true;
                    return;
                }
            }
        }

        //敌人死亡，并且没有在爆炸和受伤的状态，就退出update
        if (this._isDead && !this._isExploding && !this._isHurting) return;

        //正常移动（受击和爆炸时也移动）
        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            this._shouldRecycle = true;
        }
    }

    // 实现接口供外部调用，设置方向。用来改变update里的方向
    public init(direction: Vec3) {
        this._direction = direction.clone();
    }

    public onHitByBullet(damage: number = 1): void {
        if (this._isDead) return;
        this.currentHp -= damage;

        if (this.currentHp <= 0) {
            GameManager.inst.addScore(5);
            AudioManager.inst.enemy2Explosion();

            //死亡爆炸
            this._isDead = true;
            this._shouldRecycle = false;

            this._isExploding = true;
            this._frameIndex = 0;
            this._frameTimer = 0;
            this._sprite.spriteFrame = this.explosionFrames[0]; // 假定至少有一帧爆炸图
        } else {
            //受击闪烁
            this.playHurtEffect();
        }
    }

    //受击闪烁
    private playHurtEffect() {
        if (this._isHurting || this.hurtFrames.length === 0) return; // 没有受击帧则无效果

        this._isHurting = true;
        this._hurtFrameIndex = 0;
        this._hurtFrameTimer = 0;

        // 立即显示第一帧受击
        this._sprite.spriteFrame = this.hurtFrames[0];
    }

    //对象池重置
    public onSpawn() {
        this._isDead = false;
        this._shouldRecycle = false;
        this._isExploding = false;
        this._isHurting = false;
        this._frameIndex = 0;
        this._frameTimer = 0;
        this.currentHp = this.maxHp;
        //受击状态重置
        this._hurtFrameIndex = 0;
        this._hurtFrameTimer = 0;

        this._sprite = this.spriteComp || this.getComponentInChildren(Sprite)!;
        this._sprite.spriteFrame = this.defaultSpriteFrame!;
    }

    public onRecycle(): void {
        this._isDead = false;
        this._shouldRecycle = false;
        this._isExploding = false;
        this._isHurting = false;
        this._frameIndex = 0;
        this._frameTimer = 0;
        this.currentHp = this.maxHp;
        //受击状态重置
        this._hurtFrameIndex = 0;
        this._hurtFrameTimer = 0;

        this._sprite.spriteFrame = this.defaultSpriteFrame!;
    }
}


