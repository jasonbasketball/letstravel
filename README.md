# 遛趣星球 - 本地周边好玩地方推荐网站

一个专注于本地周边游玩推荐的平台，为年轻人和带娃家庭发现身边的好去处。

## 功能特性

- 📍 实时定位，基于高德地图API推荐周边景点
- 🔍 支持多种分类筛选（公园、游乐场、博物馆、动物园、露营地、咖啡馆、餐厅）
- 🎯 距离范围过滤，可自定义搜索半径
- 🚗 一键导航功能
- ❤️ 收藏功能，方便后续查看
- 📱 响应式设计，适配手机、平板、电脑
- 🌟 精美的UI设计，采用马卡龙色调

## 技术栈

- HTML5
- CSS3
- JavaScript
- 高德地图API

## 如何部署到GitHub Pages

### 步骤1：准备代码

1. 确保所有文件都已提交到GitHub仓库
2. 确保所有资源路径都是相对路径（本项目已配置）

### 步骤2：在GitHub上启用Pages

1. 登录GitHub，进入你的仓库（https://github.com/jasonbasketball/letstravel）
2. 点击顶部导航栏的「Settings」
3. 在左侧菜单中点击「Pages」
4. 在「Source」部分，选择「main」分支，然后点击「Save」
5. 等待几分钟，GitHub会自动构建和部署你的网站

### 步骤3：访问你的网站

部署完成后，你可以通过以下URL访问你的网站：
`https://jasonbasketball.github.io/letstravel`

## 本地开发

1. 克隆仓库：`git clone https://github.com/jasonbasketball/letstravel.git`
2. 打开 `index.html` 文件即可在本地浏览器中查看

## 注意事项

- 本项目使用了高德地图API，需要有效的API密钥
- 由于GitHub Pages的限制，某些浏览器可能会阻止地理定位请求，建议在本地开发环境中测试定位功能
- 网站在GitHub Pages上运行时，所有功能应该正常工作，包括地图显示和POI搜索

## 项目结构

```
letstravel/
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js            # 主要功能逻辑
│   └── data.js            # 数据文件
├── .gitignore            # Git忽略文件
├── index.html            # 主页面
└── README.md             # 项目说明
```

## 高德地图API配置

本项目使用了两个API密钥：
- Web服务密钥：用于地理编码和POI搜索
- Web端(JS API)密钥：用于地图显示

这些密钥已经在代码中配置好，无需修改。

## 许可证

MIT License