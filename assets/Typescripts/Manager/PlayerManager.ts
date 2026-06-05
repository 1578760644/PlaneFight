import { _decorator, clamp, Component, EventMouse, EventTouch, Input, input, instantiate, Node, Prefab, tween, UITransform, Vec2, Vec3, view } from 'cc';
import { BulletManager } from '../Manager/BulletManager';
import { GameManager } from './GameManager';
import { AudioManager } from './AudioManager';
import { RewardManager } from './RewardManager';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

enum ShootType {
    OneShoot,
    TwoShoot
}

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    private static _inst: PlayerManager;
    public static get inst(): PlayerManager {
        return this._inst;
    }

    @property(Node)
    public player: Node | null = null;
    @property(Node)
    public muzzle1: Node | null = null;
    @property(Node)
    public muzzle2: Node | null = null;

    //限制飞行边界
    private minX: number = 0;
    private maxX: number = 0;
    private minY: number = 0;
    private maxY: number = 0;

    //获取当前视图大小
    private visibleSize = view.getVisibleSize();
    //设置飞机出生位置，默认生成位置是0,0。屏幕下方也就是当前屏幕高度/4
    private spawnY: number = -this.visibleSize.height / 4;

    //发射子弹的方法
    private shootTimer: number = 0;
    private dualShootTimer: number = 0;            // 双发专用计时器

    @property
    private shootInterval: number = 0.3;            //单发间隔
    @property({ displayName: '双发间隔', tooltip: '双发子弹的发射间隔，值越小射速越快' })
    private dualShootInterval: number = 0.15;      // 双发间隔，可以设得更小（例如0.1）


    //用于切换子弹
    @property
    shootType: ShootType = ShootType.OneShoot;

    //统一计时器映射
    private shootTimers: Map<ShootType, number> = new Map();

    //全屏炸弹相关逻辑
    private _lastClickTime: number = 0;
    private _clickCount: number = 0;
    private readonly doubleClickThreshold: number = 0.5; // 双击时间阈值（秒）


    private _isPlayerAlive: boolean = true;

    protected onLoad(): void {
        //将自己设为单例
        PlayerManager._inst = this;

        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)

        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);   // 监听鼠标抬起
    }

    start() {
        this._isPlayerAlive = true;

        //计算边界
        this.calculateBoundary();

        //设置飞机生成位置
        this.setPlayerSpawnPositon();

        // 初始化计时器
        this.shootTimers.set(ShootType.OneShoot, 0);
        this.shootTimers.set(ShootType.TwoShoot, 0);
    }

    update(deltaTime: number) {
        if (GameManager.inst.isPaused || !this._isPlayerAlive) return; //死亡后结束射击

        //统一的射击更新
        this.shoot(deltaTime);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    // 计算边界（飞机中心不超出屏幕）
    public calculateBoundary() {
        const halfW = this.visibleSize.width / 2;
        const halfH = this.visibleSize.height / 2;
        this.minX = -halfW;
        this.maxX = halfW;
        this.minY = -halfH;
        this.maxY = halfH;
    }

    //控制player移动
    onTouchMove(event: EventTouch) {
        if (GameManager.inst.isPaused) return;
        //先检查玩家是否存活
        if (!this._isPlayerAlive || !this.player) return;

        //获取player节点位置
        let playerPos = this.player.getPosition();

        //通过EventTouch参数里的getDelta方法来改变x轴和y轴，从而实现飞机移动的效果
        playerPos.x += event.getDeltaX()
        playerPos.y += event.getDeltaY()

        //通过内置clamp函数来钳制飞行范围
        playerPos.x = clamp(playerPos.x, this.minX, this.maxX)
        playerPos.y = clamp(playerPos.y, this.minY, this.maxY)

        this.player.setPosition(playerPos)
    }

    //监听鼠标抬起
    private onMouseUp(event: EventMouse) {
        if (event.getButton() !== EventMouse.BUTTON_LEFT) return; //只响应左键 是数字比较BUTTON_LEFT是0，只有当0 ！== 0 相等的时候 才会取反执行false，从而不return
        if (GameManager.inst.isPaused) return;
        if (!this._isPlayerAlive) return;

        //获取当前时间的“秒级数值”
        const nowSecond = Date.now() / 1000;
        //计算与上一次点击的时间间隔（秒）
        const delta = nowSecond - this._lastClickTime;

        // 如果间隔超过0.5阈值，重置计数
        if (delta > this.doubleClickThreshold) {
            this._clickCount = 0;
        }

        // 无论间隔多长，本次点击都要计入（计数值+1）
        this._clickCount++;

        //记录本次点击的时间，供下一次比较用
        this._lastClickTime = nowSecond;

        //如果已经连续点击了2次（且间隔都在阈值内），触发炸弹
        if (this._clickCount >= 2) {
            this._clickCount = 0;   // 重置，防止连续触发
            this.useBomb();         // 使用炸弹
        }
    }

    setPlayerSpawnPositon() {
        //设置飞机出生位置
        this.player.setPosition(0, this.spawnY)
    }

    //统一射击逻辑
    private shoot(deltaTime: number) {
        const config = this.getShootConfig(this.shootType);
        if (!config || !config.muzzle) return;

        let timer = this.shootTimers.get(this.shootType)! + deltaTime;
        if (timer >= config.interval) {
            timer = 0;
            const worldPos = config.muzzle.getWorldPosition();
            AudioManager.inst.playBullet();
            BulletManager.inst.fire(config.bulletType, worldPos); //不添加参数，子弹按照默认方向移动
        }
        this.shootTimers.set(this.shootType, timer);
    }

    //射击配置映射
    private getShootConfig(type: ShootType) {
        const map = {
            [ShootType.OneShoot]: {
                muzzle: this.muzzle1,
                bulletType: 'Bullet01',
                direction: new Vec3(0, 1, 0),
                interval: this.shootInterval
            },
            [ShootType.TwoShoot]: {
                muzzle: this.muzzle2,
                bulletType: 'Bullet02',
                direction: new Vec3(0.5, 1, 0), // 保留斜向,作为添加可选参数的测试
                interval: this.dualShootInterval
            }
        };
        return map[type];
    }

    //由player调用的死亡回调
    public onPlayerDied() {
        if (!this._isPlayerAlive) return;
        this._isPlayerAlive = false;
        //停止触摸监听移动
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    //临时切换到双发模式，持续duration秒
    public activateTwoShootTemporart(duration: number) {
        //如果已经处于双发，取消之前的恢复任务，重新计时
        this.unschedule(this.restoreOneShoot);

        this.shootType = ShootType.TwoShoot;

        //切换时重置计时器，避免连发卡顿
        this.shootTimers.set(this.shootType, 0);
        this.scheduleOnce(this.restoreOneShoot, duration);
    }

    private restoreOneShoot() {
        AudioManager.inst.outPropBullet02Clip();
        this.shootType = ShootType.OneShoot;
        //恢复时也可重置计时器
        this.shootTimers.set(this.shootType, 0);
    }

    private useBomb() {
        if (RewardManager.inst.bombCount <= 0) return; //没有炸弹

        AudioManager.inst.usePropBomb();
        this.scheduleOnce(() => {
            RewardManager.inst.useBomb();

            AudioManager.inst.usePropBombClip();

            //清屏
            EnemyManager.inst.clearAllEnemies();
        }, 0.3)
    }

}


