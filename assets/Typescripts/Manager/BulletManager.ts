import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { Bullet01 } from './Bullet01';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property(Prefab)
    public bullet01Prefab: Prefab | null = null;
    @property(Prefab)
    public bullet02Prefab: Prefab | null = null;
    @property(Node)
    public bulletParent: Node | null = null; //存放子弹的容器

    //对象池
    private bulletPool: NodePool = new NodePool();

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
    }

    protected start(): void {
        this.preLoadBullet(20);
    }

    //预创建子弹，可以在游戏开始时调用
    preLoadBullet(count: number) {
        for (let i = 0; i < count; i++) {
            const bullet = instantiate(this.bullet01Prefab);
            // put(node) 是 NodePool 提供的方法，作用是将不再使用的节点放入池中，而不是直接 destroy 销毁。
            // 节点会被自动从场景中移除 removeFromParent()，但保留在内存里，下次需要时用 get() 取出来复用。
            this.bulletPool.put(bullet);
            
            // console.log('子弹池当前数量：', this.bulletPool.size()); //查看是否预创建成功
        }
    }

    //从池中获取一颗子弹
    getBullet(): Node {
        let bullet: Node = null;
        //对象池可用对象 > 0
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get(); //获取对象池中的对象
        } else { //如果没有就实例化子弹
            bullet = instantiate(this.bullet01Prefab)
        }
        return bullet;
    }

    //回收子弹到池
    recycleBullet(bullet: Node) {
        // // 可以在这里重置子弹状态
        // bullet.getComponent(Bullet)?.reset?.(); // 如果有 reset 方法
        this.bulletPool.put(bullet);
    }

    //发射接口，参数：发射位置和方向
    fire01(position: Vec3, direction: Vec3) {
        const bullet = this.getBullet();
        bullet.setParent(this.bulletParent); 
        bullet.setWorldPosition(position);
        //#region
        // bullet.setParent(this.bulletParent,true); 
        // 原来把设置父节点写在世界坐标下面 
        // 如果不写可选参数true，setParent会默认把子节点世界位置重置
        //#endregion
        //获取BulletManger下的Bullet01组件，然后调用里面的init方法
        const bulletComp = bullet.getComponent(Bullet01)
        if (bulletComp) {
            bulletComp.init(direction);
        }
        // bullet.getComponent(Bullet01)?.init(direction);
    }

}


