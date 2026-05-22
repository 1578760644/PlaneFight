import { _decorator, Component, Node } from 'cc';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

interface SpawnRule {
    type: string;       //敌人类型
    interval: number;   //生成间隔
    count: number       //生成数量
}


@ccclass('EnemySpawner')
export class EnemySpawner extends Component {

    private rules: SpawnRule[] = [
        { type: 'Enemy0', interval: 1, count: 2 },
        { type: 'Enemy1', interval: 5, count: 1 },
        { type: 'Enemy2', interval: 10, count: 1 },
    ];

    private _timers: Map<string, number> = new Map();

    protected start(): void {
        //初始化每个规则的计时器
        for (const rule of this.rules) {
            this._timers.set(rule.type, 0);
        }
    }

    protected update(dt: number): void {
        for (const rule of this.rules) {
            //取到每一个map下对应的number
            let timer = this._timers.get(rule.type) + dt;
            this._timers.set(rule.type, timer);

            //触发时间到
            if (timer >= rule.interval) {
                // 重置计时器（考虑可能溢出，减去 interval）
                this._timers.set(rule.type, timer - rule.interval);

                // 一次性生成 count 个敌人
                for (let i = 0; i < rule.count; i++) {
                    EnemyManager.inst.spawn(rule.type);
                }
            }
        }
    }
}


