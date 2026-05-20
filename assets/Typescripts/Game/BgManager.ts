import { _decorator, Component, Node, UITransform, view } from 'cc';
import { SceneManager } from '../Manager/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('BgManager')
export class BgManager extends Component {

    //后续改为动态获取
    @property(Node)
    public Bg01: Node | null = null;
    @property(Node)
    public Bg02: Node | null = null;

    //背景滚动速度
    @property
    private BgScrollSpeed: number = SceneManager.inst.BgScrollSpeed;

    //获取当前视图大小
    private visibleSize = view.getVisibleSize();
    //设置通过当前视图大小+10 设置背景高度，多出余量作为背景移动的过渡
    private bghight: number = this.visibleSize.height + 10;

    start() {
        //动态设置背景图片
        this.setBgPosition();
    }

    update(deltaTime: number) {
        //背景滚动
        this.BgScroll(deltaTime);
    }

    private setBgPosition() {
        //设置背景尺寸跟可视尺寸相同
        if (this.Bg01) {
            const ui1 = this.Bg01.getComponent(UITransform);
            ui1.setContentSize(this.visibleSize.width, this.bghight)
            //初始化位置，居中显示。默认锚点是0.5 0.5
            this.Bg01.setPosition(0, 0);
        }
        if (this.Bg02) {
            const ui2 = this.Bg02.getComponent(UITransform);
            ui2.setContentSize(this.visibleSize.width, this.bghight)
            //Bg02贴在Bg01上方
            this.Bg02.setPosition(0, this.bghight);
        }
    }

    private BgScroll(deltaTime: number) {
        if (!this.Bg01 || !this.Bg02) return;

        const moveDistance = this.BgScrollSpeed * deltaTime;

        //让背景向下移动
        let b1Pos = this.Bg01.getPosition();
        this.Bg01.setPosition(b1Pos.x, b1Pos.y - moveDistance)
        let b2Pos = this.Bg02.getPosition();
        this.Bg02.setPosition(b2Pos.x, b2Pos.y - moveDistance)

        // 更新位置引用
        b1Pos = this.Bg01.getPosition();
        b2Pos = this.Bg02.getPosition();
        //当Bg01移出屏幕外时拼接在Bg02后面
        if (b1Pos.y < - this.bghight) {
            this.Bg01.setPosition(b2Pos.x, b2Pos.y + this.bghight)
        }
        if (b2Pos.y < - this.bghight) {
            this.Bg02.setPosition(b1Pos.x, b1Pos.y + this.bghight)
        }
    }
}


