import { _decorator, Component, director, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Start')
export class Start extends Component {

    onStartButtonClick() {
        director.loadScene("Game")
    }
}


