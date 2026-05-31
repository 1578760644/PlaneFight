import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { EnemyManager } from '../Manager/EnemyManager';
import { Enemy0 } from './Enemy0';
import { Enemy1 } from './Enemy1';
import { Enemy2 } from './Enemy2';
const { ccclass, property } = _decorator;

//用于独立检测bullet02里单独的子弹
@ccclass('SubBullet')
export class SubBullet extends Component {
    public damage: number = 2;
    public hitRadius: number = 6;

    //碰撞检测
    public checkCollision(): boolean {
        const bulletPos = this.node.getWorldPosition();
        const activeEnemies = EnemyManager.inst.getActiveEnemies();
        for (const enemyNode of activeEnemies) {
            if (!enemyNode || !enemyNode.active) continue;

            let enemyComp: any = enemyNode.getComponent(Enemy0);
            if (!enemyComp) enemyComp = enemyNode.getComponent(Enemy1);
            if (!enemyComp) enemyComp = enemyNode.getComponent(Enemy2);

            if (enemyComp && !enemyComp._isDead) {
                const ui = enemyNode.getComponent(UITransform);
                const enemyRadius = ui ? Math.max(ui.width, ui.height) / 2 : 40;
                const totalRadius = this.hitRadius + enemyRadius;
                const dist = Vec3.distance(bulletPos, enemyNode.getWorldPosition());
                if (dist < totalRadius) {
                    enemyComp.onHitByBullet(this.damage);   // 传入伤害值
                    return true; // 命中一个敌人后立即返回
                }
            }
        }
        return false;
    }
}


