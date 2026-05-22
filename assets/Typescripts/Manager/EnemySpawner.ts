import { _decorator, Component, Node } from 'cc';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('EnemySpawner')
export class EnemySpawner extends Component {
    @property
    public spawnInterval0: number = 1;
    @property
    public spawnInterval1: number = 5;
    @property
    public spawnInterval2: number = 10;

    private _timer0: number = 0;
    private _timer1: number = 0;
    private _timer2: number = 0;

    update(deltaTime: number) {
        this._timer0 += deltaTime;
        this._timer1 += deltaTime;
        this._timer2 += deltaTime;

        if (this._timer0 >= this.spawnInterval0) {
            this._timer0 = 0;
            EnemyManager.inst.spawn('Enemy0');
        }
        if (this._timer1 >= this.spawnInterval1) {
            this._timer1 = 0;
            EnemyManager.inst.spawn('Enemy1');
        }
        if (this._timer2 >= this.spawnInterval2) {
            this._timer2 = 0;
            EnemyManager.inst.spawn('Enemy2');
        }
    }
}


