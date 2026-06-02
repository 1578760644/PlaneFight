import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _inst: AudioManager;
    public static get inst(): AudioManager {
        return this._inst;
    }

    private _audioSource: AudioSource = null!;

    // 背景音乐
    @property(AudioClip)
    public bgmClip: AudioClip = null!;
    @property(AudioClip)
    public gameOver: AudioClip = null!;

    // 子弹发射音效
    @property(AudioClip)
    public bulletClip: AudioClip = null!;

    // 敌人爆炸音效
    @property(AudioClip)
    public enemy0ExplosionClip: AudioClip = null!;
    @property(AudioClip)
    public enemy1ExplosionClip: AudioClip = null!;
    @property(AudioClip)
    public enemy2ExplosionClip: AudioClip = null!;

    //获取奖励音效
    @property(AudioClip)
    public propBullet02Clip: AudioClip = null!;
    @property(AudioClip)
    public propBombClip: AudioClip = null!;

    //结束奖励
    @property(AudioClip)
    public propBullet02ClipOut: AudioClip = null!;
    @property(AudioClip)
    public propBombUseClip: AudioClip = null!;

    // ---------- 音量控制（0 ~ 1） ----------
    @property({ displayName: '背景音乐音量', range: [0, 1, 0.01] })
    public bgmVolume: number = 0.8;

    @property({ displayName: 'Enemy0 爆炸音量', range: [0, 1, 0.01] })
    public enemy0Volume: number = 1.0;

    @property({ displayName: 'Enemy1 爆炸音量', range: [0, 1, 0.01] })
    public enemy1Volume: number = 1.0;

    @property({ displayName: 'Enemy2 爆炸音量', range: [0, 1, 0.01] })
    public enemy2Volume: number = 1.0;

    protected onLoad(): void {
        AudioManager._inst = this;
        this._audioSource = this.getComponent(AudioSource) || this.addComponent(AudioSource);
        //循环播放背景音乐
        this._audioSource.loop = true;
    }

    /**
     * 播放背景音乐（自动循环）
     */
    public playBGM() {
        if (this._audioSource && this.bgmClip) {
            this._audioSource.stop();                // 停止当前播放
            this._audioSource.clip = this.bgmClip;
            this._audioSource.volume = this.bgmVolume;
            this._audioSource.play();
        }
    }

    /**
     * 播放一次性音效（传入要播放的音频剪辑和音量 0~1）
     */
    public playSound(clip: AudioClip, volume?: number) {
        if (!clip) return;
        this._audioSource.playOneShot(clip, volume);
    }

    // 便捷方法（各自传入对应的音量）
    public playGameOver() { this.playSound(this.gameOver); }
    public playBullet() { this.playSound(this.bulletClip, 0.6); }
    public enemy0Explosion() { this.playSound(this.enemy0ExplosionClip, this.enemy0Volume); }
    public enemy1Explosion() { this.playSound(this.enemy1ExplosionClip, this.enemy1Volume); }
    public enemy2Explosion() { this.playSound(this.enemy2ExplosionClip, this.enemy2Volume); }
    public playPropBullet02Clip() { this.playSound(this.propBullet02Clip); }
    public playPropBombClip() { this.playSound(this.propBombClip); }
    public outPropBullet02Clip() { this.playSound(this.propBullet02ClipOut); }
    public usePropBombClip() { this.playSound(this.propBombUseClip); }

}


