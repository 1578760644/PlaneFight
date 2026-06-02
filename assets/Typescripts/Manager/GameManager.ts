import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    //通过单例来管理暂停状态
    private static _inst: GameManager;
    public static get inst(): GameManager {
        return this._inst;
    }

    private _isPaused: boolean = false;
    public get isPaused(): boolean {
        return this._isPaused;
    }

    protected onLoad(): void {
        GameManager._inst = this;
    }

    //每一次都取反，就可以切换true和false
    public togglePasue() {
        this._isPaused = !this._isPaused;
    }
}


