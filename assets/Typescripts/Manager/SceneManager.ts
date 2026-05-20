import { _decorator, Component, Node, view } from 'cc';


//后续修改为GameConfig 用来存放全局配置，VisibleSize方法可以删了
export class SceneManager {
    //用于管理场景的单例
    private static _inst: SceneManager;
    public static get inst(): SceneManager {
        if (this._inst == null) {
            this._inst = new SceneManager();
        }
        return this._inst
    }

    //背景滚动速度
    public BgScrollSpeed: number = 400;
}



