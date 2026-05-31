import { _decorator, Component, Node } from 'cc';
import { RewardManager } from './RewardManager';
const { ccclass, property } = _decorator;

interface RewardSpawnRule {
    type: string,
    interval: number,
    count: number
}

@ccclass('RewardSpawner')
export class RewardSpawner extends Component {

    private rules: RewardSpawnRule[] = [
        { type: 'PropBomb', interval: 15, count: 1 },
        { type: 'PropBullet02', interval: 10, count: 1 },
    ]

    private _timers: Map<string, number> = new Map();


    start() {
        //初始化每个规则的计时器
        for (const rule of this.rules) {
            this._timers.set(rule.type, 0);
        }
    }

    update(deltaTime: number) {
        for (const rule of this.rules) {
            let timer = (this._timers.get(rule.type) ?? 0) + deltaTime;
            this._timers.set(rule.type, timer);

            //触发时间到
            if (timer >= rule.interval) {
                //重置计时器
                this._timers.set(rule.type, timer - rule.interval);

                for (let i = 0; i < rule.count; i++) {
                    RewardManager.inst.rewordSpawn(rule.type);
                }
            }
        }
    }
}


