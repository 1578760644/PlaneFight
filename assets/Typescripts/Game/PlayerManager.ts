import { _decorator, clamp, Component, EventTouch, Input, input, instantiate, Node, Prefab, Vec2, Vec3 } from 'cc';
import { SceneManager } from '../Manager/SceneManager';
import { BulletManager } from '../Manager/BulletManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    @property(Node)
    public player: Node | null = null;
    @property(Node)
    public muzzle: Node | null = null;

    //限制飞行边界
    private minX: number = 0;
    private maxX: number = 0;
    private minY: number = 0;
    private maxY: number = 0;

    //获取当前视图大小,可以直接通过view.getVisibleSize方法来获取，后续需要全部改写
    private visibleSize = SceneManager.inst.VisibleSize();
    //设置飞机出生位置，默认生成位置是0,0。屏幕下方也就是当前屏幕高度/4
    private spawnY: number = -this.visibleSize.height / 4;

    //发射子弹的方法
    private fireTimer: number = 0;
    private fireInterval: number = 0.3;

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    start() {
        // 计算边界（飞机中心不超出屏幕）
        const halfW = this.visibleSize.width / 2;
        const halfH = this.visibleSize.height / 2;
        this.minX = -halfW;
        this.maxX = halfW;
        this.minY = -halfH;
        this.maxY = halfH;

        //设置飞机生成位置
        this.setPlayerSpawnPositon();
    }

    update(deltaTime: number) {
        this.fireTimer += deltaTime;
        if (this.fireTimer >= this.fireInterval) {
            this.fireTimer = 0;
            this.shoot();
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    //控制player移动
    onTouchMove(event: EventTouch) {
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

    //发射方法
    private shoot() {
        if (!this.muzzle) return;
        const worldPos = this.muzzle.getWorldPosition();
        const direction = new Vec3(0, 1, 0);
        BulletManager.inst.fire01(worldPos,direction)
    }
}


