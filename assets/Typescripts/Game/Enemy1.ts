import { _decorator, Component, Node, Vec3, view } from 'cc';
import { EnemyManager, IEnemy } from '../Manager/EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('Enemy1')
export class Enemy1 extends Component implements IEnemy {
    //敌人移动速度
    @property
    private _speed: number = 500;

    //敌人默认移动方向
    private _direction: Vec3 = new Vec3(0, -1, 0)

    update(deltaTime: number) {
        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            EnemyManager.inst.recycleEnemy(this.node);
        }
    }

    // 实现接口供外部调用，设置方向。用来改变update里的方向
    public init(direction: Vec3) {
        this._direction = direction.clone();
    }
}


