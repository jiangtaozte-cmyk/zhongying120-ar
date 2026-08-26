# 钟英中学百廿校庆 AR

多卡 AR 校史展览。参观者用手机扫描纪念卡上的**二维码**打开页面，页面摄像头再**图像识别是哪张卡**，展示该卡独立的 AR 内容（标题/年代 + 约 120 字介绍 + 入场/专属动画 + 自动语音解说 + 视频短片）。

- 6 张校史纪念卡（创校承志 / 抗战西迁 / 曾公祠定址 / 恢复钟英 / 杰出校友 / 校训文化）
- 六张卡共用**同一个二维码**（同一 URL）——"是哪张卡"由 MindAR 图像识别决定，非 URL
- 无集卡机制，每张卡独立展示
- 技术栈：MindAR 1.1.5 + A-Frame 1.4.2（CDN，无构建）+ Web Speech API（zh-CN TTS）

---

## ⚠️ 必读：使用前两步

仓库里的 `targets.mind` 仍是**旧的单目标**文件。新版有 6 张卡，**必须重编 `targets.mind`**，否则摄像头无法识别任何卡。

1. **重编 targets.mind（必须）**
   - 打开 MindAR 官方编译器：<https://hiukim.github.io/mind-ar-js-doc/tools/compile/>（无官方命令行工具）
   - **按下面顺序**依次上传 6 张 `assets/cards/` 下的 PNG（顺序即 targetIndex，硬约束）：
     1. `chengzhi.png`（创校承志 1904）
     2. `xiqian.png`（抗战西迁）
     3. `zenggongci.png`（曾公祠定址 1954）
     4. `fuming.png`（恢复钟英 2014）
     5. `xiaoyou.png`（杰出校友）
     6. `xiaoxun.png`（校训文化）
   - 点 Compile，确认每张特征点分布良好，下载 `targets.mind` 覆盖仓库同名文件。

2. **放视频（3 张视频卡需要）**
   - 将 3 段短片放到 `assets/video/`：`xiqian.mp4`、`zenggongci.mp4`、`xiaoyou.mp4`
   - 规格：H.264 mp4、**无声**（AR 内用浏览器 TTS 解说叠加）、15–30s、建议 ≤5MB
   - 暂无视频时，对应卡的视频区为黑块，其余功能正常；放入文件即生效，无需改代码。

---

## 本地测试

摄像头权限要求 **HTTPS 或 localhost**，故需起一个本地静态服务器（不要直接双击打开 `index.html`）：

```bash
# 在项目根目录
npx http-server -p 8080        # 或: python -m http.server 8080
```

浏览器打开 <http://localhost:8080/> → 等待加载完成 → 点「开始体验」→ 将镜头对准任一纪念卡 → 展示该卡 AR。

- iOS Safari / Android Chrome 均可。iOS 必须点「开始体验」按钮（该手势同时解锁语音合成与视频自动播放）。
- 调试日志：右上角「显示日志」。

---

## 部署（让二维码真正生效）

二维码默认编码 **GitHub Pages 地址**：`https://jiangtaozte-cmyk.github.io/zhongying120-ar/`

发布到该地址（启用 GitHub Pages 即可）。若部署到**别的域名/路径**：

```bash
cd tools
set AR_URL=https://你的域名/zhongying120-ar/        # Windows CMD
$env:AR_URL="https://你的域名/zhongying120-ar/"; node build-cards.js   # PowerShell
AR_URL=https://你的域名/zhongying120-ar/ node build-cards.js          # bash
```

重跑后**必须重编 `targets.mind`**（卡面变了）。

---

## 卡片生成（设计 / 二维码 / 重出图）

`tools/build-cards.js` 一次性输出 6 张卡的 SVG 源（`cards-svg/`）与 PNG（`assets/cards/`，1200×1680，5:7）。

```bash
cd tools && npm install        # 首次（依赖 @resvg/resvg-js + qrcode）
node build-cards.js
```

- 卡面文案/配色/插画改 `tools/build-cards.js` 中对应插画函数（`illuChengzhi` 等），重跑。
- 字体：SVG 中文用系统 SimHei（`C:/Windows/Fonts/simhei.ttf`）。换机器构建需有中文字体。
- `assets/cards/qr-only.png` 是独立的同款二维码（备用，如做指示牌）。

---

## 印刷实体卡

`assets/cards/<id>.png` 直接打印：
- 尺寸 A5 / 明信片；**哑光、高对比、避免反光**（反光会严重影响 AR 识别）
- 卡上的二维码即访问入口：参观者手机扫码 → 打开页面 → 点「开始体验」→ 摄像头对准**这张卡** → 该卡 AR
- 印刷图 = MindAR 跟踪目标（同一张 PNG 编入 `targets.mind`），二者完全一致

---

## 文件结构

```
zhongying120-ar/
├── index.html               # 全部逻辑：cards 数据、场景生成、多目标、TTS、视频、动画
├── targets.mind             # ⚠️ 需按上方步骤重编为 6 目标
├── README.md
├── .gitignore
├── cards-svg/               # 6 张卡的 SVG 源（可编辑）
│   └── <id>.svg
├── assets/
│   ├── cards/               # 6 张设计卡 PNG（印刷 + .mind 输入，含二维码角）
│   ├── video/               # 3 张视频卡的 mp4（放入即用）
│   └── img/                 # 预留：非视频卡的可选展示图/历史照片
└── tools/
    ├── package.json
    └── build-cards.js       # 卡片 + 二维码生成器
```

---

## 改卡 / 增删卡

- 改文案：编辑 `tools/build-cards.js` 的 `cards` 表 + 对应 `illu*` 函数，重跑，重编 `.mind`。
- 增删卡：同步改 `index.html` 的 `cards` 数组（下标 = targetIndex），重跑出图，重编 `.mind`（顺序与 `cards` 一致）。

## 技术说明（关键修复，勿回退）

- `#scene-container` 必须 `position:fixed; width/height:100%`：MindAR 用 `a-scene.parentNode` 定摄像头视频与 3D 相机投影尺寸，否则视频只铺半屏。
- AR 内容 `rotation="0 0 0"` 朝相机（垂直海报，勿用 -90 倒伏）。
- `mindar-image` 用 `uiLoading: no; uiScanning: no`：遮罩由本页完全自管，`#loading` 在「开始体验」点击后才隐藏（该手势解锁 iOS TTS/视频）。

## 语音（通用方案，微信内置也能出声）

- **音频优先**：每段介绍已合成 mp3 放 `assets/audio/`（`intro-<卡id>.mp3` + `alum-<校友id>.mp3`），AR 里用 HTML5 `<audio>` 播放。微信等内置 webview 虽屏蔽 `window.speechSynthesis`，但支持 `<audio>`，故**照样能播**。
- **兜底**：缺失音频或自动播放被拦截时，回退 Web Speech API（`zh-CN`，真浏览器可用）。
- **改造**：`tools/gen-audio.py` 用 `edge-tts`（微软在线语音，免费无 key，直出 mp3）从 `index.html` 的 `intro`/`bio` 文案重新合成。改文案后重跑：
  `python tools/gen-audio.py`
- 关键经验：微信无 `speechSynthesis`；「开始体验」手势会调用一次静音播放松弛来解锁 `<audio>`。
