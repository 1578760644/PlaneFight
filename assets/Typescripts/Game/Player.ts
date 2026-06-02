import { _decorator, Animation, color, Color, Component, director, Node, Sprite, UITransform, Vec3 } from 'cc';
import { EnemyManager } from '../Manager/EnemyManager';
import { Enemy0 } from './Enemy0';
import { Enemy1 } from './Enemy1';
import { Enemy2 } from './Enemy2';
import { PlayerManager } from '../Manager/PlayerManager';
import { RewardManager } from '../Manager/RewardManager';
import { PropBomb } from './PropBomb';
import { PropBullet02 } from './PropBullet02';
import { GameManager } from '../Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    public _isDead: boolean = false;
    public playerHp = 3;
    public MaxHp = 3;

    //无敌相关
    private _isInvincible: boolean = false;
    private _invincibleTimer: number = 0;
    @property({ displayName: '无敌时长(秒)' })
    public invincibleDuration: number = 1;

    //闪烁相关
    private _sprite: Sprite | null = null;
    private _originalColor: Color = new Color(255, 255, 255, 255); //默认白色不透明

    protected start(): void {
        //初始化血量
        this.playerHp = this.MaxHp;
        this._sprite = this.node.getComponent(Sprite);
        if (this._sprite) {
            this._originalColor = this._sprite.color.clone();
        }
    }

    update(deltaTime: number) {
        if (this._isDead || GameManager.inst.isPaused) return;   // 死亡和暂停后不再检测碰撞               
        this.onInvincible(deltaTime);
        this.checkCollision();
    }

    private onInvincible(deltaTime: number) {
        if (this._isInvincible) {
            this._invincibleTimer -= deltaTime;
            if (this._invincibleTimer <= 0) {
                //无敌结束，恢复正常
                this._isInvincible = false;
                this._invincibleTimer = 0;
                if (this._sprite) {
                    //恢复原色
                    this._sprite.color = this._originalColor.clone();
                }
            } else {
                //闪烁效果：根据剩余时间快速切换透明度
                if (this._sprite) {
                    //每0.1秒切换一次可见性，floor的作用向下取整，*10目前是每0.1秒闪烁一次。间隔为 T 秒，乘数为 1 / T
                    const blink = Math.floor(this._invincibleTimer * 10) % 2 === 0;
                    this._sprite.color = blink ? this._originalColor.clone() : new Color(255, 255, 255, 100);
                }
            }
        }
    }

    private playerDead() {
        if (this._isDead) return;
        this._isDead = true;
        this.playerHp = 0;
        this._isInvincible = false; //死亡时取消无敌

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

                // // 暂停整个游戏（敌人、子弹、输入等全部停止）
                // director.pause();

                // 1 秒后恢复并跳转到游戏结束场景
                setTimeout(() => {
                    director.loadScene('End');   // 确保你已创建名为 'EndScene' 的场景
                }, 1000);
            });
            anim.play('Player_Down');
        } else {
            //没有动画，直接隐藏并通知
            this.node.active = false;
            const manager = this.node.parent?.getComponent(PlayerManager);
            if (manager) {
                manager.onPlayerDied();
            }
            // 无动画时也跳转
            setTimeout(() => {
                director.loadScene('End');
            }, 1000);
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
                    //如果无敌，不扣血，只销毁敌人
                    if (!this._isInvincible) {
                        //处理player血量问题等
                        this.playerHp--
                        console.log('当前血量', this.playerHp);

                        if (this.playerHp <= 0) {
                            this.playerDead();
                            break; //死了就不再检查其他敌人
                        } else {
                            //开启无敌
                            this._isInvincible = true;
                            this._invincibleTimer = this.invincibleDuration;
                        }
                    }

                    //先暂用跟子弹碰撞到的同一套逻辑
                    enemyComp.onHitByBullet()
                    break;
                    // break跳出 for 循环。
                    // 作用：同一帧内只处理一个敌人的碰撞。避免飞机同时撞到两个敌人时瞬间扣两次血（即便无敌期间，也可能多个敌人一起被销毁，但通常一次碰撞处理一个足够）。
                    // 如果你希望同一帧可以同时撞到多个敌人（比如无敌时只销毁敌人但不扣血，允许同时销毁多个），可以把这里的 break 移除。但对于大多数弹幕游戏，一次碰撞只处理一个敌人更可控。
                }
            }
        }

        //获取当前活跃奖励物品
        const activeRewards = RewardManager.inst.getActiveRewards();
        for (const rewardNode of activeRewards) {
            if (!rewardNode || !rewardNode.active) continue;

            //尝试获取奖励组件
            let rewardComp: any = rewardNode.getComponent(PropBomb);
            if (!rewardComp) rewardComp = rewardNode.getComponent(PropBullet02);

            if (rewardComp) {
                const rewardUI = rewardNode.getComponent(UITransform);
                if (!rewardUI) continue;
                const rewardRadius = Math.max(rewardUI.width, rewardUI.height) / 2;

                const totalRadius = playerRadius + rewardRadius;
                const dis = Vec3.distance(playerPos, rewardNode.getWorldPosition());
                if (dis < totalRadius) {
                    //拾取奖励
                    rewardComp.onPickUp();

                    //判断类型并触发效果  instanceof判断 rewardComp 是不是 PropBullet02 这个类的实例。
                    if (rewardComp instanceof PropBullet02) {
                        const pm = this.node.parent?.getComponent(PlayerManager);
                        if (pm) {
                            pm.activateTwoShootTemporart(8);
                        }
                    } else if (rewardComp instanceof PropBomb) {
                        RewardManager.inst.addBomb();
                    }
                    break;
                }
            }
        }
    }
}


