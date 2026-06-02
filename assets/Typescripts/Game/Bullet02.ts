import { _decorator, Component, Node, Vec3, view } from 'cc';
import { BulletManager, ILauncher } from '../Manager/BulletManager';
import { SubBullet } from './SubBullet';
import { GameManager } from '../Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('Bullet02')
export class Bullet02 extends Component implements ILauncher {
    //子弹发射速度
    public _speed: number = 1000;

    //子弹默认移动方向
    private _direction: Vec3 = new Vec3(0, 1, 0);

    //回收标记
    private _shouldRecycle: boolean = false;

    //用于存放各个子弹下面的自定义组件
    private _subBullets: SubBullet[] = [];

    //池化激活
    public onSpawn() {
        this._shouldRecycle = false;
        this.node.active = true;
        if (this._subBullets.length === 0) {
            this._subBullets = this.node.getComponentsInChildren(SubBullet);
        }
    }

    //池化回收
    public onRecycle() {
        this._shouldRecycle = false;
        //子子弹不需要额外的重置，因为没有独立的对象池
    }


    update(deltaTime: number) {
        if (GameManager.inst.isPaused) return;
        if (this._shouldRecycle) {
            BulletManager.inst.recycleBullet(this.node);
            this._shouldRecycle = false;
            return;
        }


        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime)
        this.node.setPosition(pos);

        //每个子弹独立碰撞检测
        for (const sub of this._subBullets) {
            if (sub.checkCollision()) {
                this._shouldRecycle = true;     // 任意一颗命中，整组回收
                break;
            }
        }

        //超出屏幕时回收（调用 BulletManager 回收）
        if (pos.y > view.getVisibleSize().height + 10) {
            BulletManager.inst.recycleBullet(this.node);
        }
    }

    // 供外部调用，设置方向
    public init(direction: Vec3) {
        //克隆当前向量
        this._direction = direction.clone();
    }
}


