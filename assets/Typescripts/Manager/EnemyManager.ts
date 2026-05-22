import { _decorator, Component, instantiate, Node, NodePool, Pool, Prefab, Vec3, view, View } from 'cc';
const { ccclass, property } = _decorator;

// 敌人接口（可选，建议实现）
export interface IEnemy {
    init(data?: any): void;        // 初始化属性（速度、生命值等）
    onRecycle?(): void;            // 回收时重置状态（可选）
}


@ccclass('EnemyManager')
export class EnemyManager extends Component {
    //用数组存放敌人预制体
    @property([Prefab])
    public enemyPrefabs: Prefab[] = [];

    //敌人存放在parent下
    @property([Node])
    public enemyParents: Node[] = [];

    //敌人生成位置
    @property(Node)
    public spawnPoint: Node | null = null;

    //通过map管理对象池，完整的对象池需要有初始化池 → 预加载 → 获取 → 生成 → 回收
    private poolMap: Map<string, {
        pool: NodePool;
        prefab: Prefab;
        parent: Node;
        compName?: string
    }> = new Map();

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
        //实例化对象池
        this.initPools();
    }

    //初始化池
    private initPools() {
        //预制体、父节点数组长度需一致（或按索引对应）
        for (let i = 0; i < this.enemyPrefabs.length; i++) {
            const prefab = this.enemyPrefabs[i];
            const parent = this.enemyParents[i] || this.node; //没有父节点就挂在EnemyManger下面
            //取到每个预制体的名字
            const type = prefab.name;
            const compName = prefab.name;
            //通过每个预制体的名字进行标识
            this.poolMap.set(type, {
                //每一个预制体都实例化为对象池类型
                pool: new NodePool(),
                prefab: prefab,
                parent: parent,
                compName: compName, //组件名跟预制体名一样就可以避免转换
            });
        }

    }


    //预加载单个敌人
    public preloadEnemy(type: string, count: number) {
        const info = this.poolMap.get(type);
        if (!info) {
            console.log(`EnemyManager没有找到敌人类型:${type}`);
            return;
        }
        for (let i = 0; i < count; i++) {
            const enemy = instantiate(info.prefab);
            enemy[`enemyType`] = type;
            info.pool.put(enemy);
        }
    }

    //预加载全部敌人
    public preloadAll(count: number) {
        this.poolMap.forEach((info, type) => {
            for (let i = 0; i < count; i++) {
                const enemy = instantiate(info.prefab);
                enemy[`enemyType`] = type;
                info.pool.put(enemy);
            }
        });
    }

    //获取(从对应池)
    private getEnemy(type: string): Node {
        //通过type标签取出对应的预制体
        const info = this.poolMap.get(type);
        if (!info) return null;
        //如果对象池中的可用数量大于0就通过get方法取出来，没有就实例化新的节点
        return info.pool.size() > 0 ? info.pool.get() : instantiate(info.prefab);
    }


    //生成
    public spawn(type: string, wordPos: Vec3, direction: Vec3) {
        //从poolMap里取出对应表,如果不存在就return
        const info = this.poolMap.get(type);
        if (!info) return;

        //获取敌人
        const enemy = this.getEnemy(type);
        //绑定敌人到父节点
        enemy.setParent(info.parent);
        //设置敌人生成位置和坐标,可以通过默认的位置或者定义的方法
        enemy.setWorldPosition(wordPos || this.getRandomSpawnPos());
        //标记类型回收
        enemy[`enemyType`] = type;

        //调用敌人自己的初始化方法
        // const comp = enemy.getComponent(info.compName) as IEnemy;
        // if (comp?.init) {
        //     comp.init(/* 可以传入配置数据，如血量、速度等 */);
        // }
    }

    // 获取随机生成位置（屏幕外，X 随机）
    public getRandomSpawnPos() {
        const visibleSize = view.getVisibleSize();
        const spawnPos = this.spawnPoint.getWorldPosition();
        // X 轴随机偏移,附加偏移量后面可以通过获取到预制体的宽度来动态实现
        //(Math.random() - 0.5) * visibleSize.width 等价于正负 - + visibleSize.width / 2
        //两边个各预留80px
        const randomX = (Math.random() - 0.5) * (visibleSize.width - 180)
        // Y 轴保持生成点高度（屏幕上方外）
        return new Vec3(spawnPos.x + randomX, spawnPos.y, 0);
    }
}


