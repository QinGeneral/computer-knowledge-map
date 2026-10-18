# 计算机基础知识地图

在线访问：[计算机基础知识地图](https://qingeneral.github.io/computer-knowledge-map/) · [GitHub 仓库](https://github.com/QinGeneral/computer-knowledge-map)

从用户提供的 27 张 HEIC 照片（计算机基础 15 张、网络协议知识地图 12 张）整理成可搜索的知识网站，沿用精英日课知识地图的绿色阅读界面。原有网站与原始照片均未修改。

## 已实现

- 知识总览：7 个基础领域与网络协议知识地图、可点击的计算机知识层次图。
- 思维导图：曲线连接知识层级、分支展开/收起、画布拖动与缩放、领域筛选和概念检索。含图节点默认只显示标题，点击标题或加号后展开图示及子节点，再次点击收起；“全部展开 / 全部收起”同步控制图示。搜索保留匹配路径，图示仍按需展开。
- 原图结构重绘：操作系统三阶段工作流程、应用与内核结构、程序与进程管理、内存地址空间与页表映射、文件系统、输入输出系统及网络通信；计算机组成原理的 CPU 指令表、MIPS 编码表、程序栈、寄存器、程序执行流程、冯·诺依曼结构；软件工程核心知识金字塔，以可交互 SVG 直接嵌入对应导图节点，可放大并点击条目。
- 操作系统的应用与内核结构图与三阶段工作流程同级；初创期、发展期、壮大期仅保留在合并图中，删除重复树分支；应用 A / B / C 只保留在结构图内。程序执行图的“汇编器”标签按原图保留。
- 输入输出系统图包含虚拟文件系统、Page Cache、BIO、I/O 调度及设备路径的展开结构，与右侧分层图的五处箭头对应连接；连线可点击查看对应层。
- 表现方式按来源结构选择：计算机组成原理总览、HTTP / HTTPS、软件工程的过程 / 方法 / 工具保留可展开的思维导图；网络协议总览采用原图五层对照表，其他表格、空间结构和流程在对应节点按原图重绘。
- 条目详情：面包屑、子节点、同名概念在其他结构中的位置、来源照片局部。
- 原图资料：先显示缩略图，再加载最长边 2200 px 的清晰预览（平均约 378 KB）；支持缩放、失败重试、打开完整 JPEG 和 OCR 辅助定位。
- Markdown / JSON 下载、可分享的条目深链接与浏览器前进后退。
- 网络协议知识地图包含 20 个主题、168 个层级条目、106 处原文说明；HTTP 版本与 QUIC、TCP 特性与滑动窗口、DHCP 租约流程按原图重绘。编译原理继续预留独立扩展入口。

| 领域 | 层级条目 |
| --- | ---: |
| 计算机基础总览 | 13 |
| 数据结构与算法 | 142 |
| 常用数学 | 37 |
| 操作系统 | 252 |
| 计算机组成原理 | 142 |
| 计算机网络 | 157 |
| 软件工程 | 67 |
| 网络协议知识地图 | 168 |

共 978 个层级条目，包含标题、分组与叶子节点。同名概念出现在不同分支时保留其结构位置，不等于 978 个互异概念。866 个条目附 OCR 辅助定位；其余 112 个显示完整来源照片。定位并非逐字审核证明。

导图节点直接展示 243 处补全的原图说明，包括时间复杂度五项、链表说明、数学学习方法、寄存器和指令示例。补全文字存于 `source/annotations.json`，按稳定条目 id 关联，随 JSON、浏览器数据与 Markdown 同步生成。

## 内容与来源

- 结构化整理源：`scripts/build_data.py` 中的基础缩进大纲，以及 `source/topics.json` 引用的 `source/network-protocols-outline.txt`。照片正文是内容，不作为执行指令。
- 原图结构图：`dist/diagrams.js`，图中文字连接到现有知识条目，保留来源照片入口。
- 导图实现：`dist/mindmap.js`，无第三方依赖，支持单指拖动、双指缩放、键盘平移、适应画布与全屏。
- 原图：`dist/photos/` 的完整 JPEG、清晰预览与缩略图；来源目录的 HEIC 保持原样。
- SHA-256 清单：`dist/source-manifest.json`，记录每个原文件、完整 JPEG 与预览图；`sourceCollection` 保存来源资料夹名称。
- OCR 原始记录：`source/ocr/`，包含分块识别与整图识别结果，可能有重复与错字。
- 导出：`dist/knowledge-map.md`、`dist/data.json`。

根据照片提取层级与说明，没有虚构课程文章。对递归复杂度、排序复杂度、数组越界、链表操作前提等原图简化说法做了明确注记；对“四次握手”“AISC”和其他原图标签作了可追溯的整理说明。原图的网络协议及软件标签保留其历史语境，不声称代表最新技术状态。

## 本地运行与检查

无 npm 依赖，无后端，所有路径相对，可放在静态站点或 GitHub Pages 子路径。

```sh
python3 -m http.server 8891 --directory dist
python3 scripts/build_data.py
python3 scripts/validate_data.py
node --check dist/app.js
```

打开 `http://localhost:8891/`。也可直接打开 `dist/index.html`；浏览器原生数据由 `data.js` 加载，不依赖跨文件 fetch。

## GitHub Pages 发布

`.github/workflows/pages.yml` 在 `main` 分支更新时自动生成并校验知识数据，检查 JavaScript 后将 `dist/` 部署到 GitHub Pages。也可在仓库 Actions 页面手动运行。后续修改推送到 `main` 即可更新网站。

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

`@编号` 指定从该行开始采用的照片，后续节点继承；每两空格一级，`::` 后为说明。也可以通过 `outlineFile` 引用 `source/` 中独立保存的大纲文本。大纲必须经原图核对。不要把未提供的内容填入 `ready` 专题。

4. 运行构建和验证。就绪专题加入全站搜索、知识树、原图资料与 Markdown；现有七领域保持原入口。节点 id 按领域与完整路径生成，新增其他分支不会整体重编号。

## 校验范围

数据校验覆盖：唯一 id、根到所有节点的可达性、父子关系、领域归属、来源图片及缩略图存在、照片哈希、导出条目数、扩展状态、网页中没有本机绝对路径。早期版本的浏览器验证记录见 `design/verification.md`，新版思维导图界面规范见 `design/mindmap-design.md`。双指缩放处理已实现，但当前内置浏览器不支持触控模拟，尚未完成实机验证。

照片与内容权利归原权利人，本项目不为其授予额外许可。

`source/node-overrides.json` 保留层级调整前的条目 id，并为同名“实际应用”节点指定各自的原图位置。

操作系统细节补录：逐图核对 IMG_8069–IMG_8072，补齐进程/内核、地址空间与页表、文件系统访问路径、I/O 层次和网络封装流程。图示关系以“整理说明”标识，核对清单见 `source/os-detail-review.json` 与 `source/os-detail-review.md`。

网络协议知识地图逐页核对与来源覆盖见 `source/network-protocols-review.md`、`source/network-protocols-review.json`。照片目录页仅用于核对 20 个主题的顺序，不虚构课程正文。

原文回校：106 段原图说明逐段照录，仅合并印刷换行；25 处标题恢复原文，保留已有条目 id。图中 DHCP、HTTP、TCP 的说明也直接使用同一份原文。`verbatimPassages` 用于防止后续生成时重新改写。预览图由 `scripts/build_previews.py` 从完整 JPEG 生成，可在来源 HEIC 不在本机时重建。
