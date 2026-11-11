# Web-design · 东方Project 主题网站

网页设计课程作业：一个介绍东方Project 官方作品与代表性同人作品的静态网站。

- **在线预览**：<https://omiga3125.github.io/Web-design/>
- **作业要求**：主页 + 分页面、相对路径、图文并茂；主文件夹下包含 `index.html`、`image/`、`web/`

## 目录结构

```
index.html          主页（总体概括、作品分类入口、数据一览、年表）
style.css           全站样式（和风红白）
bgm.js              背景音乐控制（默认开启，右下角可关闭）
search.js           站内搜索交互
search-data.js      搜索索引（161 条：页面 / 游戏 / 专辑 / 曲目 / 书籍 / 同人）
web/
  games.html        弹幕射击游戏 TH06—TH20（15 部）
  musiccd.html      秘封俱乐部音乐CD（12 张、112 首，含逐曲解说）
  books.html        官方书籍（精选 11 部）
  doujin.html       同人作品（6 部，附 B 站观看链接）
image/              38 张封面图
audio/              背景音乐
```

## 说明

- 全部使用相对路径，复制到任意位置或直接双击 `index.html` 都能正常显示。
- 作品资料与封面参考自 [THBWiki](https://thbwiki.cc/)，版权归原作者 ZUN 与各社团所有；仅供学习交流。
- 页面由 Python 脚本按数据表批量生成，保证 15 部游戏、12 张专辑、11 本书的字段格式一致。

## GitHub Pages

仓库 Settings → Pages 中已设置为 **Deploy from a branch → main → / (root)**，
推送后自动发布，主页地址即上方「在线预览」。
