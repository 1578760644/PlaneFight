import { _decorator, Component, instantiate, Node, NodePool, Prefab, UITransform, Vec3, view } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

export interface IReword {
    //初始化奖励方向
    init(direction: Vec3): void;
    onRecycle(): void;
}

@ccclass('RewardManager')
export class RewardManager extends Component {
    //数组存放奖励
    @property([Prefab])
    public rewordPrefabs: Prefab[] = [];

    //奖励parent
    @property(Node)
    public rewordParent: Node | null = null;

    //奖励生成位置
    @property(Node)
    public SpawnPoint: Node | null = null;

    //通过map管理poolmap
    private poolMap: Map<string, {
        pool: NodePool,
        prefab: Prefab;
        parent: Node,
        compName: string
    }> = new Map();

    //活跃奖励列表，供player遍历调用
    private activeRewards: Node[] = [];

    //炸弹数量
    private _bombCount: number = 0;

    //单例
    private static _inst: RewardManager;
    public static get inst(): RewardManager {
        if (this._inst == null) {
            this._inst = new RewardManager();
        }
        return this._inst;
    }

    public get bombCount(): number {
        return this._bombCount;
    }

    protected onLoad(): void {

        RewardManager._inst = this;

        this.initPools();
    }

    //初始化池
    private initPools() {
        for (const prefab of this.rewordPrefabs) {
            const type = prefab.name;
            const parent = this.rewordParent || this.node;
            this.poolMap.set(type, {
                pool: new NodePool(),
                prefab: prefab,
                parent: parent,
                compName: prefab.name,
            });
        }
    }

    //预载入，全部奖励
    public preloadAll(count: number) {
        this.poolMap.forEach((info, type) => {
            for (let i = 0; i < count; i++) {
                const reward = instantiate(info.prefab);
                reward[`rewardType`] = type;
                info.pool.put(reward);
            }
        });
    }

    //获取
    private getReward(type: string): Node {
        const info = this.poolMap.get(type);
        if (!info) return null;
        return info.pool.size() > 0 ? info.pool.get() : instantiate(info.prefab);
    }

    //随机生成位置
    public getRandomSpawnPos(rewordNode?: Node) {
        const visibleSize = view.getVisibleSize();
        const spawnPos = this.SpawnPoint.getWorldPosition();
        let margin = 80;
        if (rewordNode) {
            const ui = rewordNode.getComponent(UITransform);
            if (ui) {
                margin = ui.width / 2;
            }
        }
        const randomX = (Math.random() - 0.5) * (visibleSize.width - 2 * margin);
        const randomY = Math.random() * 10
        return new Vec3(spawnPos.x + randomX, spawnPos.y + randomY, 0)
    }

    //生成
    public rewordSpawn(type: string, worldPos?: Vec3, direction?: Vec3) {
        const info = this.poolMap.get(type);
        if (!info) return;

        const reword = this.getReward(type);
        reword.setParent(this.rewordParent);
        if (worldPos) {
            reword.setWorldPosition(worldPos);
        } else {
            const randomPos = this.getRandomSpawnPos(reword);
            reword.setWorldPosition(randomPos);
        }

        reword[`rewordType`] = type;

        //调用奖励的onSpawn来重置状态
        const rewordComp = reword.getComponent(info.compName) as any;
        if (rewordComp?.onSpawn) rewordComp.onSpawn();

        //取预制体下自定义组件名
        const comp = reword.getComponent(info.compName) as unknown as IReword | null;

        //当direction存在的时候，通过调用comp里的init方法来clone出新的方向，覆盖掉默认方向；
        if (comp?.init && direction) {
            comp.init(direction);
        }

        this.activeRewards.push(reword);
    }

    //回收
    public recycleReword(node: Node) {
        const type = node[`rewordType`];
        if (!type) return;
        const info = this.poolMap.get(type);

        const comp = node.getComponent(info.compName) as unknown as IReword | null;
        if (comp?.onRecycle) comp.onRecycle();

        info.pool.put(node);

        //从活跃列表移出
        const idx = this.activeRewards.indexOf(node);
        if (idx !== -1) this.activeRewards.splice(idx, 1);
    }

    public getActiveRewards() {
        return this.activeRewards;
    }

    public addBomb() {
        this._bombCount++;
    }
}


