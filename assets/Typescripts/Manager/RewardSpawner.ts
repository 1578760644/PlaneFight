import { _decorator, Component, Node } from 'cc';
import { RewardManager } from './RewardManager';
const { ccclass, property } = _decorator;

@ccclass('RewardSpawner')
export class RewardSpawner extends Component {
    start() {

    }

    update(deltaTime: number) {
        RewardManager.inst.rewordSpawn('PropBomb')
    }
}


