import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RestartButton')
export class RestartButton extends Component {

    onclick() {
      director.loadScene('Game');  
    }
}


