import { _decorator, Component, Node, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PropBomb')
export class PropBomb extends Component {
    //奖励移动速度
    private _speed: number = 1000;

    //默认移动方向，默认向下
    private _direction: Vec3 = new Vec3(0, -1, 0)

    start() {

    }

    update(deltaTime: number) {

        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        this.checkCollision();

        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            this.node.destroy();
        }
    }

    private checkCollision() {

    }
}


