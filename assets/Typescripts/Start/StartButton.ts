import { _decorator, Component, director, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Start')
export class Start extends Component {

    protected start(): void {
        input.on(Input.EventType.TOUCH_START, this.onStartButtonClick, this)
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onStartButtonClick, this)
    }

    onStartButtonClick() {
        director.loadScene("Game")
    }
}


