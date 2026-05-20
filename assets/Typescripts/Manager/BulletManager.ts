import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { Bullet01 } from './Bullet01';
const { ccclass, property } = _decorator;

//让bullet调用接口
export interface ILauncher {
    //初始化了子弹的方向
    init(direction: Vec3): void;
}

@ccclass('BulletManager')
export class BulletManager extends Component {
    //用数组存放bullet预制体
    @property([Prefab])
    bulletPrefabs: Prefab[] = [];

    //子弹存放在bulletParent下
    @property(Node)
    public bulletParent: Node | null = null;

    //#region
    //对象池NodePool为cocos内置的方法
    //private bulletPool: NodePool = new NodePool();

    //对象池完整的生命周期需要有 初始化池（实例化） → 预加载（可选） → 获取 → 发射（需要先从对应池取到） → 回收
    //#endregion

    //核心数据结构：<类型名, {池, 预制体, 组件名(可选)}>
    //用映射表（Map）动态管理对象池
    private poolMap: Map<string, { pool: NodePool; prefab: Prefab; compName?: string }> = new Map();

    //单例
    private static _inst: BulletManager;
    public static get inst(): BulletManager {
        if (this._inst == null) {   // 关键判断：只有第一次访问时才实例化
            this._inst = new BulletManager();
        }
        return this._inst
    }

    protected onLoad(): void {
        BulletManager._inst = this;  // 在 onLoad 中赋值，确保挂载后获取，组件必须挂载在节点上

        //实例化对象池
        this.initPools();

        // // 预加载5个 bullet01 和 10个 bullet02
        // BulletManager.inst.preloadBullet('bullet01', 5);
        // BulletManager.inst.preloadBullet('bullet02', 10);

        // // 或者直接预加载所有类型，每个类型10个
        // BulletManager.inst.preloadAll(10);
    }

    //初始化池
    private initPools() {
        //遍历预制体数组,把每个预制体都变成对象池类型
        for (const prefab of this.bulletPrefabs) {
            //取到每个预制体的名字
            const type = prefab.name;
            //通过每个预制体的名字进行标识，这里的type就是bullet01 02...   键：type → 值：{pool，prefab，compName}
            this.poolMap.set(type, {
                //每一个预制体都实例化为对象池类型
                pool: new NodePool(),
                prefab: prefab,
                compName: prefab.name //这里的预制体名跟组件名一样
            });
        }
    }

    //预加载一种子弹(子弹类型，数量)
    public preloadBullet(type: string, count: number) {
        const info = this.poolMap.get(type);
        if (!info) {
            console.warn(`[BulletManager]没有找到子弹类型：${type}`);
            return;
        }
        //循环创建放入池中
        for (let i = 0; i < count; i++) {
            const bullet = instantiate(info.prefab);
            //提前打类型标签
            bullet[`bulletType`] = type;
            // put 会自动 removeFromParent
            info.pool.put(bullet);
        }
    }

    //预加载所有子弹（数量）
    public preloadAll(countPerType: number) {
        //通过forEach方法遍历每个对象池
        this.poolMap.forEach((info, type) => {
            for (let i = 0; i < countPerType; i++) {
                const bullet = instantiate(info.prefab);
                bullet['bulletType'] = type;
                info.pool.put(bullet);
            }
        });
    }

    //获取子弹（从对应池）
    private getBullet(type: string): Node {
        //通过type标签取出对应的预制体
        const info = this.poolMap.get(type);
        if (!info) return null
        //如果对象池中的可用数量大于0就通过get方法取出来，没有就实例化新的节点
        return info.pool.size() > 0 ? info.pool.get() : instantiate(info.prefab);
    }

    //通用发射口
    fire(type: string, worldPos: Vec3, direction: Vec3) {
        //从poolMap里取出对应表,如果不存在就return
        const info = this.poolMap.get(type);
        if (!info) return;

        //获取子弹
        const bullet = this.getBullet(type)
        //先设置父节点，再设置世界坐标。避免设置节点的时候默认子节点的世界坐标变为0,0
        bullet.setParent(this.bulletParent);
        bullet.setWorldPosition(worldPos);

        //在节点上存自定义类型 bulletType：type ，后面需要回收
        bullet[`bulletType`] = type;

        //取预制体下的自定义组件名
        const comp = bullet.getComponent(info.compName) as unknown as ILauncher | null;
        //使用接口类型断言来避免报错，保持类型安全
        if (comp?.init) comp.init(direction);
    }

    //回收（根据节点上保存的类型自动放入对应池）
    recycleBullet(node: Node) {
        //相当于node.bulletType 通过自定义属性取到对应的类型
        const type = node[`bulletType`];
        if (!type) return
        const info = this.poolMap.get(type);
        if (info) {
            //把对象回收到池
            info.pool.put(node);
        }
    }
}


