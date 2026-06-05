import { sys } from 'cc';

export class GameData {
    private static _inst: GameData;
    public static get inst(): GameData {
        if (!this._inst) this._inst = new GameData();
        return this._inst;
    }

    //历史最高分
    public get highScore(): number {
        const val = sys.localStorage.getItem(`highScore`);
        return val ? parseInt(val) : 0;
    }
    public set highScore(value: number) {
        sys.localStorage.setItem(`highScore`, value.toString());
    }

    // ----- 当前得分（内存中，不存盘） -----
    private _currentScore: number = 0;
    public get currentScore(): number {
        return this._currentScore;
    }
    public set currentScore(value: number) {
        this._currentScore = value;
    }

}



