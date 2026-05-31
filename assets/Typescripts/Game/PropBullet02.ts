import { _decorator, Component, Node, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PropBullet02')
export class PropBullet02 extends Component {
    //奖励移动速度
    private _speed: number = 500;

    //默认移动方向，默认向下
    private _direction: Vec3 = new Vec3(0, -1, 0)

    //通过正弦波来控制左右摇摆的幅度
    @property({ displayName: '摆动角度' })
    public swingAngle: number = 20;
    @property({ displayName: '摆动速度' })
    public swingSpeed: number = 8;

    private _swingTime: number = 0;

    start() {

    }

    update(deltaTime: number) {

        const pos = this.node.getPosition();
        Vec3.scaleAndAdd(pos, pos, this._direction, this._speed * deltaTime);
        this.node.setPosition(pos);

        //摆动
        this._swingTime += deltaTime * this.swingSpeed;
        const angle = Math.sin(this._swingTime) * this.swingAngle;
        this.node.angle = angle;

        this.checkCollision();

        if (pos.y < - view.getVisibleSize().height / 2 - 10) {
            this.node.destroy();
        }
    }

    private checkCollision() {
        const rewardPos = this.node.getWorldPosition();
    }
}


