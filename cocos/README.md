# 星港防线

一个用于 Cocos Creator 面试展示的轻量 2D 防守游戏 Demo。当前目录包含可直接在浏览器打开的可玩版本，方便面试现场快速演示；核心代码按 Creator 项目常见职责拆分，后续可以平移到 `GameManager`、`Enemy`、`Tower` 和 `Projectile` 组件。

## 运行

直接打开 `index.html`，或在个人主页根目录执行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080/cocos/`。

## 面试可讲的技术点

- 固定帧间隔：`dt` 限制在 50ms，避免切后台回来时实体瞬移。
- 对象生命周期：敌人、子弹、粒子都经过统一更新与清理，便于替换为 Cocos Pool。
- 数据驱动：炮塔类型的费用、伤害与攻速由 `type` 控制，适合进一步抽成配置表。
- 输入适配：使用 Pointer Events，同时覆盖鼠标、触摸和触控笔。
- 响应式 Canvas：根据 CSS 容器和 devicePixelRatio 重设绘制尺寸，保证高清屏清晰。

## 迁移到 Cocos Creator

建议在 Creator 3.x 中建立 `Canvas / GameManager / EnemyLayer / TowerLayer / UILayer` 节点，将 `main.js` 中的 `update`、`spawnEnemy`、`addTower` 和 `fire` 分别迁移为组件方法；表现层使用 Creator UI、节点池和 tween 替换 Canvas 绘制即可。