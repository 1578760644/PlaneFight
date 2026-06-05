import { _decorator, Component, Node } from 'cc';
import { Player } from 'db://assets/Typescripts/Game/Player';
import { PlayerManager } from 'db://assets/Typescripts/Manager/PlayerManager';
const { ccclass, property } = _decorator;

@ccclass('HealthUI')
export class HealthUI extends Component {
    @property([Node])
    public heartNodes: Node[] = [];

    private _previousHp: number = -1;
    private _playerComp: Player | null = null;

    protected start(): void {
        // 通过 PlayerManager 单例获取 Player 节点，再拿到 Player 组件
        if (PlayerManager.inst && PlayerManager.inst.player) {
            this._playerComp = PlayerManager.inst.player.getComponent(Player)
        }
    }

    update(deltaTime: number) {
        if (!this._playerComp) return;

        const currentHp = this._playerComp.playerHp;
        if (currentHp !== this._previousHp) {
            this._previousHp = currentHp;
            this.updateDisplay(currentHp);
        }
    }

    private updateDisplay(hp: number) {
        for (let i = 0; i < this.heartNodes.length; i++) {
            this.heartNodes[i].active = i < hp;
        }
    }
}


