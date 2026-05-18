import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet02')
export class Bullet02 extends Component {
    @property
    speed: number = 300;

    start() {

    }

    update(deltaTime: number) {
        const position = this.node.position;
        this.node.setPosition(position.x, position.y + this.speed * deltaTime)
    }
}


