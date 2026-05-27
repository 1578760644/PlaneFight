import { _decorator, Animation, Component, Node, UITransform, Vec3 } from 'cc';
import { EnemyManager } from '../Manager/EnemyManager';
import { Enemy0 } from './Enemy0';
import { Enemy1 } from './Enemy1';
import { Enemy2 } from './Enemy2';
import { PlayerManager } from '../Manager/PlayerManager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    public _isDead: boolean = false;
    public playerHp = 3;
    public MaxHp = 3;

    protected start(): void {
        //初始化血量
        this.playerHp = this.MaxHp;
    }

    update(deltaTime: number) {
        if (this._isDead) return;   // 死亡后不再检测碰撞               
        this.checkCollision();
    }

    private playerDead() {
        if (this._isDead) return;
        this._isDead = true;
        this.playerHp = 0;

        const anim = this.node.getComponent(Animation);
        if (anim) {
            anim.once(Animation.EventType.FINISHED, () => {
                //动画播放完毕，隐藏飞机
                this.node.active = false;
                //通知PlayerManager玩家已死亡
                const manager = this.node.parent?.getComponent(PlayerManager);
                if (manager) {
                    manager.onPlayerDied();
                }
            });
            anim.play('Player_Down');
        } else {
            //没有动画，直接隐藏并通知
            this.node.active = false;
            const manager = this.node.parent?.getComponent(PlayerManager);
            if (manager) {
                manager.onPlayerDied();
            }
        }

    }

    //距离碰撞检测，原理：碰撞总距离 = 飞机半径+敌人半径
    private checkCollision() {
        const playerPos = this.node.getWorldPosition();
        //获取飞机碰撞半径
        const playerUI = this.node.getComponent(UITransform);
        const playerRadius = playerUI ? Math.max(playerUI.width, playerUI.height) / 2 : 60;

        //获取当前活跃敌人
        const activeEnemies = EnemyManager.inst.getActiveEnemies()
        for (const enemyNode of activeEnemies) {
            if (!enemyNode || !enemyNode.active) continue;

            //尝试获取任意一种敌人组件
            let enemyComp: any = enemyNode.getComponent(Enemy0);
            if (!enemyComp) enemyComp = enemyNode.getComponent(Enemy1);
            if (!enemyComp) enemyComp = enemyNode.getComponent(Enemy2);

            if (enemyComp && !enemyComp._isDead) {
                //从敌人节点上获取 UITransform，不是从 enemyComp
                const enemyUI = enemyNode.getComponent(UITransform);
                if (!enemyUI) continue;
                const enemyRadius = Math.max(enemyUI.width, enemyUI.height) / 2;

                //碰撞总距离
                const totalRadius = playerRadius + enemyRadius;
                //计算敌人与player锚点之间的直线距离
                const dis = Vec3.distance(playerPos, enemyNode.getWorldPosition());
                if (dis < totalRadius) {
                    //处理player血量问题等
                    this.playerHp--
                    console.log('当前血量', this.playerHp);
                    if (this.playerHp <= 0) {
                        this.playerDead();
                    }
                    //先暂用跟子弹碰撞到的同一套逻辑
                    enemyComp.onHitByBullet()
                    break;
                }
            }
        }
    }
}


