import { _decorator, Component, UITransform, Vec3, view } from 'cc';
import { BulletManager, ILauncher } from '../Manager/BulletManager';
import { Enemy0 } from './Enemy0';
import { EnemyManager } from '../Manager/EnemyManager';
import { Enemy1 } from './Enemy1';
import { Enemy2 } from './Enemy2';
const { ccclass, property } = _decorator;


@ccclass('Bullet01')
export class Bullet01 extends Component implements ILauncher {

    //子弹发射速度
    @property
    public _speed: number = 600;

    //子弹默认移动方向
    private _direction: Vec3 = new Vec3(0, 1, 0);

    //回收标记
    private _shouldRecycle: boolean = false;

    // 子弹自身的碰撞半径（通常很小，可以保持 0 或很小的值）
    @property({ displayName: '子弹碰撞半径' })
    public hitRadius: number = 5;

    //池化激活回调
    public onSpawn() {
        this._shouldRecycle = false;
        this.node.active = true;
    }

    //池化回收回调
    public onRecycle() {
        this._shouldRecycle = false;
    }

    update(deltaTime: number) {
        //执行回收
        if (this._shouldRecycle) {
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

        //距离碰撞检测
        this.checkCollision();

        //超出屏幕时回收（调用 BulletManager 回收）
        if (pos.y > view.getVisibleSize().height + 10) {
            BulletManager.inst.recycleBullet(this.node);
        }
    }


    //距离碰撞检测
    private checkCollision() {
        const bulletPos = this.node.getWorldPosition();
        const activeEnemies = EnemyManager.inst.getActiveEnemies();
        for (const enemyNode of activeEnemies) {
            if (!enemyNode || !enemyNode.active) continue;

            //尝试获取任意一种敌人组件
            let enemyComp: any = enemyNode.getComponent(Enemy0);
            if (!enemyComp) enemyComp = enemyNode.getComponent(Enemy1);
            if (!enemyComp) enemyComp = enemyNode.getComponent(Enemy2);


            if (enemyComp && !enemyComp._isDead) {
                //从UITransform自动计算敌人碰撞半径
                const ui = enemyNode.getComponent(UITransform);
                //取宽和高其中的最大值的一半作为圆形碰撞半径，如果没有就取默认值40
                const enemyRadius = ui ? Math.max(ui.width, ui.height) / 2 : 40
                //碰撞总距离 = 子弹半径+敌人半径
                const totalRadius = this.hitRadius + enemyRadius;
                //Vec3.distance 计算子弹与敌人锚点之间的直线距离,圆形碰撞检测：两个圆心之间的距离小于半径之和，则相交
                const dist = Vec3.distance(bulletPos, enemyNode.getWorldPosition())
                if (dist < totalRadius) {
                    this._shouldRecycle = true;  //标记子弹回收
                    enemyComp.onHitByBullet();  //通知被敌人击中
                    break;
                }
            }
        }
    }

    // 实现接口供外部调用，设置方向
    public init(direction: Vec3) {
        //克隆当前向量
        this._direction = direction.clone();
    }
}


