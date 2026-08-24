# 个人网站 · AI 产品经理

彩色简约风格的个人网站框架，包含 3D 地球（标记你所在的省份）。
纯 HTML + CSS + JS，无需构建工具，直接打开即可预览。

> 地球使用 [globe.gl](https://globe.gl/)（基于 three.js），纹理从 CDN 加载，需要联网才能显示。
> 当前地球标记位置：**中国 · 浙江省**（以杭州坐标 30.27°N, 120.16°E 代表）。

## 快速开始

直接双击 `index.html` 在浏览器中打开，或在项目目录运行：

```bash
# 使用 Python 启动本地服务器（推荐）
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 文件结构

```
项目/
├── index.html      # 页面结构（所有文案都在这里改）
├── css/
│   └── style.css   # 样式（配色、间距、圆角等设计变量）
├── js/
│   └── main.js     # 交互（菜单、滚动动画、导航高亮）
└── README.md
```

## 如何修改

### 1. 修改基本信息和文案
打开 `index.html`，把以下内容替换成你自己的：

- **标题**：`<title>` 标签里的「你的名字」
- **导航 Logo**：`.nav-logo` 里的名字
- **Hero 首屏**：`.hero-title`（名字）、`.hero-subtitle`（一句话定位）、`.hero-desc`（介绍）
- **关于我**：`.about-text` 里的段落，以及 `.about-meta` 里的状态/城市/邮箱
- **作品集**：`.work-grid` 里的 `.work-card`（占位卡片，后续替换）
- **技能**：`.skills-grid` 里的 `.skill-card`
- **联系**：`.contact-links` 里的邮箱和链接
- **页脚**：`.footer-inner` 里的名字

### 2. 修改配色和风格
打开 `css/style.css`，顶部 `:root` 里有所有设计变量：

| 变量 | 作用 |
|------|------|
| `--bg` / `--bg-alt` | 页面背景色（白色 / 浅灰） |
| `--text` / `--text-secondary` | 文字主色 / 次要色 |
| `--accent` | 主强调色（默认靛蓝 #6366f1） |
| `--accent-2` | 次强调色（默认紫 #8b5cf6） |
| `--accent-3` | 点缀色（默认青 #22d3ee） |
| `--gradient` | 渐变（按钮、标题装饰） |
| `--dark` | 深色背景（Hero / 导航 / 页脚） |
| `--radius` | 卡片圆角 |
| `--max-width` | 内容最大宽度 |

想换一套配色，只需改 `:root` 里的这几个颜色变量即可。

### 修改地球标记的位置

打开 `js/main.js`，找到 `initGlobe()` 里的这一行：
```js
const ZHEJIANG = { lat: 30.2741, lng: 120.1551 };
```
把经纬度改成你的位置（可在 [百度拾取坐标](https://api.map.baidu.com/lbsapi/getpoint/index.html) 查询）。
同时把 `labelsData` 里的文字 `"中国 · 浙江省"` 改成你的省市。

### 3. 补充作品集
在 `index.html` 的 `.work-grid` 里，复制一段 `.work-card` 结构，替换：
- `.work-cover--placeholder` → 换成 `<img>` 项目截图
- `.work-title` → 项目名称
- `.work-desc` → 项目描述
- `.work-tags` → 项目标签

## 已实现的功能

- ✅ 响应式设计（手机 / 平板 / 桌面）
- ✅ 彩色主题（靛蓝 → 紫渐变 + 青色点缀）
- ✅ 3D 发光地球，标记所在省份（浙江）+ 脉冲圆环 + 文字标签
- ✅ 固定导航栏 + 当前区块高亮
- ✅ 移动端汉堡菜单
- ✅ 滚动淡入动画
- ✅ 平滑滚动定位
- ✅ 作品集占位卡片（等你自己补充项目）
