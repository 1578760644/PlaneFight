# PlaneFight

此项目为Cocos学习的第五个项目，开发版本**3.8.2**，2D项目模仿经典游戏飞机大战。从游戏开始到游戏中再到结束，基本上实现了完整的游玩逻辑闭环。

![image-20260605235450430](./PlaneFight.assets/image-20260605235450430.png)

![image-20260605235459366](./PlaneFight.assets/image-20260605235459366.png)

![image-20260605235510408](./PlaneFight.assets/image-20260605235510408.png)

## 主要功能：

- 场景管理：Start场景、Game场景、End场景，重新开始按钮
- 飞机移动：触摸控制，边界限制
- 射击系统：单发、双发切换，独立控制射速，对象池管理子弹
- 敌人系统：多种敌人（小、中、大），不同的血量，受击动画，爆炸动画，对象池管理
- 碰撞检测：纯数学距离检测，避开物理引擎
- 道具系统：随机生成奖励，双发道具、炸弹道具，拾取后触发效果
- UI系统：血量显示（图标）、炸弹计数（精灵动画）、分数显示、暂停-恢复 游戏
- 音效系统：集中管理的音效单例、背景音乐和音效分离，音量可调
- 数据持久化：历史最高分本地存储，跨场景传递当前得分



## 设计思路：

- **单例模式**：方便在任何脚本中访问核心功能，减少引用传递和拖拽绑定
- **对象池模式**：管理子弹、敌人、奖励。避免频繁创建/销毁节点，通过Map统一管理多种类型的对象池
- **数据驱动**：新增类型或修改参数只需要更改数据，无需改动逻辑代码。
- **关注点分离**：一个脚本只做一件事
- **接口约束：**强制对象实现必要方法，保证对象池安全重置，同时让Manager能统一调用
- **精灵动画：**避开引擎Animation组件与对象池兼容问题
- **时间戳差值判断**：双击炸弹检测、无敌闪烁、帧动画计时，不依赖引擎计时器



## 目录结构：

```markdown
PlaneFight/
├── Data/
│   └── GameData.ts
│
├── Game/
│   ├── Bullet01.ts
│   ├── Bullet02.ts
│   ├── Enemy0.ts
│   ├── Enemy1.ts
│   ├── Enemy2.ts
│   ├── Player.ts
│   ├── PropBomb.ts
│   ├── PropBullet02.ts
│   └── SubBullet.ts
│
├── Manager/
│   ├── AudioManager.ts
│   ├── BgManager.ts
│   ├── BulletManager.ts
│   ├── EnemyManager.ts
│   ├── EnemySpawner.ts
│   ├── GameManager.ts
│   ├── PlayerManager.ts
│   ├── RewardManager.ts
│   ├── RewardSpawner.ts
│   └── SceneManager.ts
│
└── UI/
    ├── End/
    │   ├── EndUI.ts
    │   └── RestartButton.ts
    ├── Game/
    │   ├── BombUI.ts
    │   ├── HealthUI.ts
    │   ├── PauseUI.ts
    │   └── ScoreUI.ts
    └── Start/
        └── StartButton.ts
```
