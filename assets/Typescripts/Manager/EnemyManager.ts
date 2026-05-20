import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    //用数组存放敌人预制体
    @property([Prefab])
    public enemyPrefab: Prefab[] = [];

    //敌人存放在parent下
    @property([Node])
    public enemyParent: Node[] = [];

    //敌人生成位置
    @property(Node)
    public enemySpawnPosition: Node | null = null;

    //单例
    private static _inst: EnemyManager;
    public static get inst(): EnemyManager {
        if (this._inst == null) {
            this._inst = new EnemyManager();
        }
        return this._inst
    }

    protected onLoad(): void {
        EnemyManager._inst = this;
    }

}


