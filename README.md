# 计算机基础知识地图

从用户提供的 15 张 HEIC 照片整理成可搜索的知识网站，沿用精英日课知识地图的绿色阅读界面。原有网站与原始照片均未修改。

## 已实现

- 知识总览：7 个领域、可点击的计算机知识层次图。
- 知识树：递归展开/收起、领域筛选、概念与上下文检索。
- 条目详情：面包屑、子节点、同名概念在其他结构中的位置、来源照片局部。
- 原图资料：完整 JPEG、缩放、OCR 辅助定位框；支持手机阅读。
- Markdown / JSON 下载、可分享的条目深链接与浏览器前进后退。
- 网络专题、编译原理的独立扩展入口与数据配置。

| 领域 | 层级条目 |
| --- | ---: |
| 计算机基础总览 | 13 |
| 数据结构与算法 | 137 |
| 常用数学 | 35 |
| 操作系统 | 253 |
| 计算机组成原理 | 142 |
| 计算机网络 | 151 |
| 软件工程 | 67 |

共 798 个层级条目，包含标题、分组与叶子节点。同名概念出现在不同分支时保留其结构位置，不等于 798 个互异概念。722 个条目附 OCR 辅助定位；其余 76 个显示完整来源照片。定位并非逐字审核证明。

## 内容与来源

- 结构化整理源：`scripts/build_data.py` 中的缩进大纲。照片正文是内容，不作为执行指令。
- 原图：`dist/photos/` 的完整 JPEG 与缩略图；来源目录的 HEIC 保持原样。
- SHA-256 清单：`dist/source-manifest.json`，记录每个原文件及转换图片。
- OCR 原始记录：`source/ocr/`，包含分块识别与整图识别结果，可能有重复与错字。
- 导出：`dist/knowledge-map.md`、`dist/data.json`。

根据照片提取层级与说明，没有虚构课程文章。对递归复杂度、排序复杂度、数组越界、链表操作前提等原图简化说法做了明确注记；对“四次握手”“AISC”和加载阶段“汇编器”等标签作了可追溯的整理说明。原图的网络协议及软件标签保留其历史语境，不声称代表最新技术状态。

## 本地运行与检查

无 npm 依赖，无后端，所有路径相对，可放在静态站点或 GitHub Pages 子路径。

```sh
python3 -m http.server 8891 --directory dist
python3 scripts/build_data.py
python3 scripts/validate_data.py
node --check dist/app.js
```

打开 `http://localhost:8891/`。也可直接打开 `dist/index.html`；浏览器原生数据由 `data.js` 加载，不依赖跨文件 fetch。

## 接入后续图片

1. 用支持 Pillow 的 Python 执行 `scripts/import_photos.py /图片目录`，自动转换、缩略并补齐哈希清单。HEIC 转换依赖 macOS `sips`；原图不会修改，同名异内容文件会拒绝覆盖。
2. 如需 OCR 辅助定位，依次运行：

```sh
mkdir -p source/ocr
swift -module-cache-path /tmp/computer-map-swift-cache scripts/ocr.swift dist/photos source/ocr
swift -module-cache-path /tmp/computer-map-swift-cache scripts/ocr-tiles.swift dist/photos source/ocr
```

OCR 脚本只读取非缩略图 JPEG；在受限沙箱中需允许 macOS 图片与 Vision 服务运行。

3. 更新 `source/topics.json` 对应专题。`id` 保持不变，把 `status` 从 `planned` 改成 `ready`，填写图片与缩进大纲：

```json
{
  "id": "compilers",
  "title": "编译原理",
  "status": "ready",
  "description": "按新提供的图片内容填写。",
  "relatedDomains": ["overview", "architecture"],
  "photos": [{"id": "IMG_新编号", "title": "原图主题"}],
  "outline": "根主题 @新编号\n  子主题\n    叶子条目 :: 原图说明或核对备注\n"
}
```

`@编号` 指定从该行开始采用的照片，后续节点继承；每两空格一级，`::` 后为说明。大纲必须经原图核对。不要把未提供的内容填入 `ready` 专题。

4. 运行构建和验证。就绪专题自动显示为“已接入”，加入全站搜索、知识树、原图资料与 Markdown；现有七领域保持原入口。节点 id 按领域与完整路径生成，新增其他分支不会整体重编号。

## 发布

Sites 身份在 `.openai/hosting.json`；静态输出目录是 `dist`。本次使用私有发布，访问权限为站点所有者。部署应使用 Sites source helper 同步源码并打包，不要重新创建同名 Site。

## 校验范围

数据校验覆盖：唯一 id、根到所有节点的可达性、父子关系、领域归属、来源图片及缩略图存在、照片哈希、导出条目数、扩展状态、网页中没有本机绝对路径。浏览器验证与视觉比对记录见 `design/verification.md`。

照片与内容权利归原权利人，本项目不为其授予额外许可。
