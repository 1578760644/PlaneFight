import { _decorator, clamp, Component, EventMouse, EventTouch, Input, input, instantiate, Node, Prefab, UITransform, Vec2, Vec3, view } from 'cc';
import { BulletManager } from '../Manager/BulletManager';
const { ccclass, property } = _decorator;

//通过接口和数组来灵活调用子弹，暂时没有用到
interface MuzzleConfig {
    node: Node;         // 发射口节点
    bulletType: string; // 子弹类型，对应poolMap里的键
    direction: Vec3;    // 发射方向
}

enum ShootType {
    OneShoot,
    TwoShoot
}

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    @property(Node)
    public player: Node | null = null;
    @property(Node)
    public muzzle1: Node | null = null;
    @property(Node)
    public muzzle2: Node | null = null;

    //发射口配置数组
    private muzzleConfigs: MuzzleConfig[] = [];

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

    @property
    private shootInterval: number = 0.3;

    //暂时用一下切换子弹
    @property
    shootType: ShootType = ShootType.OneShoot;

    private _isPlayerAlive: boolean = true;

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    start() {
        this._isPlayerAlive = true;

        //计算边界
        this.calculateBoundary();

        //设置飞机生成位置
        this.setPlayerSpawnPositon();

        //初始化发射口配置
        this.initMuzzleConfigs();
    }

    update(deltaTime: number) {
        if (!this._isPlayerAlive) return; //死亡后结束射击

        switch (this.shootType) {
            case ShootType.OneShoot:
                this.oneShoot(deltaTime);
                break;
            case ShootType.TwoShoot:
                this.twoShoot(deltaTime);
                break;
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
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

    setPlayerSpawnPositon() {
        //设置飞机出生位置
        this.player.setPosition(0, this.spawnY)
    }

    //还可以有更动态的方式
    private initMuzzleConfigs() {
        this.muzzleConfigs = [
            {
                node: this.muzzle1,
                bulletType: 'Bullet01',
                direction: new Vec3(0, 1, 0),
            },
            {
                node: this.muzzle2,
                bulletType: 'Bullet02',
                direction: new Vec3(0.5, 1, 0), //斜着射
            },
        ]
    }

    // //发射方法，暂时弃用
    // private shoot() {
    //     for (const config of this.muzzleConfigs) {
    //         if (!config) continue //节点没挂载就跳过
    //         const worldPos = config.node.getWorldPosition();
    //         BulletManager.inst.fire(config.bulletType, worldPos, config.direction)
    //     }
    // }

    //发射方法
    private oneShoot(deltaTime: number) {
        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            if (!this.muzzle1) return;
            const worldPos = this.muzzle1.getWorldPosition();
            const direction = new Vec3(0, 1, 0);
            BulletManager.inst.fire('Bullet01', worldPos, direction)
        }
    }

    private twoShoot(deltaTime: number) {
        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            if (!this.muzzle2) return;
            const worldPos = this.muzzle2.getWorldPosition();
            const direction = new Vec3(0, 1, 0);
            BulletManager.inst.fire('Bullet02', worldPos, direction)
        }
    }

    //由player调用的死亡回调
    public onPlayerDied() {
        if (!this._isPlayerAlive) return;
        this._isPlayerAlive = false;
        //停止触摸监听移动
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

}


