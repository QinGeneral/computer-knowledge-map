from pathlib import Path
import json,re,hashlib,unicodedata,difflib
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
DOMAINS=[
 ('overview','计算机基础总览','从应用软件、系统软件到计算机硬件，建立整体坐标。',['8065','8067'],'''计算机的知识层次 @8065
  应用软件
    计算机应用程序
  系统软件
    操作系统
    编译原理
    计算机网络
    计算机体系结构
  硬件
    计算机组成
    CPU / GPU
    内存 / 硬盘
    显示器 / 键盘
'''),
 ('algorithms','数据结构与算法','理解数据如何组织，以及算法如何衡量与求解问题。',['8066','8067','8068'],'''算法 @8066
  复杂度
    时间复杂度 :: 原图列举常数、对数、线性、平方与指数数量级；实际复杂度取决于具体算法和实现。
      O(1) :: 原图示例：Hash 表、缓存。
      O(log n) :: 原图示例：二分查找、二叉搜索树。
      O(n) :: 原图示例：遍历操作。
      O(n²) :: 原图示例：双重 for 循环。
      O(2ⁿ) :: 原图以递归举例；递归并不都具有指数复杂度，需分析递推关系。
    空间复杂度
      O(1) 原地操作
      O(n) 线性辅助空间
  递归与分治
    终止状态
    本层处理
    Drill Down
    本层状态清理
  动态规划
    递归加缓存
    递推公式
    状态定义
    最优子结构
    状态转移方程
  二分查找
    有序
    有界
    通过索引随机访问
  贪心算法
    判断能不能贪心
    与动态规划的联系 :: 原图将贪心描述为“弱化版的动态规划”，此处保留为原图提示，不作为通用定义。
  并查集
    站队问题
    初始化
    查询与合并
    路径压缩
  布隆过滤器
    判断不存在准确
    判断存在有误差
    多个 Hash 函数映射到位
  位运算
    常见的位运算公式
  LRU
    Hash Table + 双向链表
    get 和 set 的 O(1) 复杂度
基础数据结构 @8066
  数组
    连续空间
    查找与插入删除 :: 原图概括为“查找快、插入/删除结点慢”；按下标访问和按值查找需区分。
  链表
    离散空间
    查找与插入删除 :: 原图概括为“查找慢、插入/删除结点快”；插入删除的常数时间以已定位结点为前提。
  栈
    先进后出
  队列
    先进先出
  映射
    K/V 键值对，Key 不重复
  集合
    Key 不重复
  树
    二叉树
      DFS 深度优先搜索
      BFS 广度优先搜索
      二叉搜索树
      平衡二叉树
        AVL 树
        红黑树
      剪枝
    字典树
      空间换时间
  图
    记录已访问的结点
数据结构细分 @8067
  非受限线性表
    顺序结构
      数组
        O(1) 随机访问
        平均 O(n) 插入和删除
        越界错误 :: 原图写有“导致 Stack OverFlow”；越界后果依语言与运行环境而异，不能一概而论。
    链式结构
      单链表
        遍历访问结点
        指针存储开销
      双链表
        前驱结点指针
      循环链表
        尾结点指向头结点
      静态链表
        数组与后继指针
  受限线性表
    栈
      顺序或链式实现
      浏览器前进与后退
      括号匹配
      表达式计算
    堆
      大顶堆
      小顶堆
      找第 K 大元素
    队列
      普通队列
      双边队列
      优先级队列
      LFU Cache
  树与二叉树
    二叉树
      顺序和链式实现
      完全二叉树
      满二叉树
      二叉搜索树
      平衡二叉搜索树
        红黑树
      遍历方式
        广度优先搜索
        深度优先搜索
          前序遍历
          中序遍历
          后序遍历
    哈夫曼树
    字典树
排序 @8067
  O(n²) 分组 :: 沿用原图的分组标签，不代表所有输入下的复杂度。
    冒泡排序
    插入排序
    选择排序
  O(n log n) 分组
    快速排序
    归并排序
  O(n) 分组 :: 原图将桶、计数、基数排序归于线性组；其复杂度还受值域、桶数、位数等参数影响。
    桶排序
    计数排序
    基数排序
练习与工具 @8066
  Google 搜索引擎
  iTerm2 + zsh
  heyfocus.com
  IDEA + LeetCode Plugin
  LeetCode
'''),
 ('math','常用数学','从编程、通用算法、数据结构与机器学习中认识数学的用途。',['8068','8066'],'''程序员的数学应用地图 @8068
  编程语句
    判断语句
    循环结构
    递归调用
  通用算法
    二分查找
    树的遍历
    归并排序
    暴力法
    求最优解
  数据结构
    数组
    链表
    堆栈
    队列
    哈希表
    n 叉树
  机器学习算法
    潜在语义分析
    分类算法
    线性回归
    隐马尔可夫模型
    特征标准化和去噪
    特征选择和降维
    向量空间模型
    AB 测试
    推荐模型
数学学习方法 @8068
  广度优先了解概念 :: 原图建议先认识各领域概念的名称及其解决的问题。
  了解概念的用途与局限 :: 原图建议先了解作用、大致步骤、发明背景与局限，再深入算法和证明。
  将复杂操作暂作整体理解 :: 原图建议面对陌生符号时，先把它实现的功能看作一个整体操作。
  从工作相关领域开始 :: 原图建议通过实际用途建立学习反馈。
  用程序实现数学问题的解法 :: 原图建议将正在学习的数学解法写成程序。
  结合在线课程系统学习
'''),
 ('os','操作系统','从进程、内存与文件系统，延伸到 I/O 和网络编程。',['8069','8070','8071','8072'],'''操作系统工作流程 @8069
  初创期
    x86 体系结构 :: 原图类比：要有开放的营商环境。
    系统初始化 :: 原图类比：创建一家软件外包公司。
    实模式 :: 原图类比：公司初创没员工，老板亲自接项目。
  发展期
    保护模式和多进程 :: 原图类比：公司慢慢做大，项目越接越多。
    进程管理 :: 原图类比：建立项目管理体系。
    内存管理 :: 原图类比：建立会议室管理体系。
    文件系统 :: 原图类比：建立文档资料管理体系。
    输入输出设备管理 :: 原图类比：建立售前售后体系。
  壮大期
    进程间通信 :: 原图类比：公司内部项目合作。
    网络通信 :: 原图类比：外部公司合作。
  内核子系统
    系统调用子系统
    进程管理子系统
      调度
      任务管理
      同步
      CPU
    内存管理子系统
      内存映射
      虚拟内存
      物理内存
      页表
      swap
      伙伴
      slab
    文件子系统
      VFS
      缓存
      文件系统
    设备子系统
      字符设备
      块设备
    网络子系统
      套接字
      协议栈
      网络设备
进程管理 @8069
  程序到进程
    ELF Header
    Segment Header Table
    代码段
      .text
      .rodata
    数据段
      .data
      .bss
    不加载到内存
      .symtab
      .strtab
      Section Header Table
  进程列表
    任务 ID
    亲缘关系
    任务状态
    权限
    运行统计
    调度相关
    信号处理
    内存管理
    文件与文件系统
    内核栈
内存管理 @8069
  进程地址空间
    内核态
    用户态
    Stack 栈
    mmap 内存映射区
    堆
    BSS 区域
    Data 区域
    Text 区域
  虚拟内存与物理内存
    页
    页表项
    换出
    换入
    文件映射
    内存映射
文件系统 @8070
  系统调用
    sys_open
    sys_read
    sys_write
  文件描述符
  进程打开的文件
  虚拟文件系统 VFS
    struct file
      file operation
    struct dentry
      dir operation
    struct inode
      inode operation
  文件系统类型
    ext4
    ext3
    ntfs
  块设备访问路径
    struct address_space
    Page Cache
    通用块设备层
      BIO
    块设备 I/O 调度层
      调度算法
      I/O 请求队列
    块设备驱动程序
    硬盘设备
  ext4 文件系统
    inode
    Block
    sector
输入输出系统 @8070
  用户进程
    open / read / write / ioctl
  文件系统接口
  虚拟文件系统 :: 原图：抽象为文件系统操作，对用户提供文件操作。
  块设备
  设备驱动程序 :: 原图：屏蔽设备控制器，对操作系统提供统一接口。
  中断处理器 :: 原图：硬件事件统一处理。
  设备控制器 :: 原图：屏蔽不同硬件的差别。
  硬件 :: 原图：各种各样的硬件设备。
网络通信 @8070
  Linux 服务器 A
    Firefox
    Chrome
  Linux 服务器 B
    nginx
    tomcat
  用户态与内核态
  Socket
  HTTP 报文
    HTTP header
    HTTP body
  TCP header
  IP header
  MAC header
  eth0 / eth1
  交换机
  Linux 服务器作路由器
    路由表
网络编程 @8071
  基本知识
    TCP/IP 和 OSI 参考模型
    UNIX 标准
    IP 地址
    子网划分
    端口
    C/S 模型
  使用技巧
    TCP 连接检测
      KeepAlive
      应用层 heartbeat
    字节流读写
      读取
        检测异常输入
          FIN 和 EOF 处理
          RST 处理
        流式处理
          处理 message 格式
        缓冲区溢出处理
      写入
        RST 捕获和 SIGPIPE
    有序关闭
      半关闭连接
      shutdown
  编程框架
    Java
      Netty
      MINA
    C/C++
      ACE
      Libevent
      ASIO
  并发模型
    进程
      fork
      exec
      wait / waitpid
    线程
      信号量
      条件变量
      互斥锁
      创建和终止
  I/O 模型
    阻塞式 I/O
    非阻塞式 I/O
    I/O 多路复用
      select
      poll
      Linux
        epoll
      BSD
        kqueue
    信号驱动式 I/O
    异步 I/O
网络编程：协议与模型 @8072
  基本协议
    TCP
      连接管理
        三次握手
          SYN
          ACK
        四次挥手 :: 照片标签写作“四次握手”，此处按连接关闭语义整理为“四次挥手”。
          TIME_WAIT
          CLOSE_WAIT
          FIN / RST
      流量控制
        交互式通信：小包处理
        延时 ACK
        滑动窗口
      拥塞控制
        慢启动
        拥塞避免
    UDP
      报文结构
      校验和
    本地套接字
      IPC 机制
      本地路径
  编程模型
    套接字地址
      IPv4 套接字地址
      IPv6 套接字地址
      通用套接字地址
      UNIX 域套接字地址
    服务器端 :: 原图给出的调用顺序：socket create → bind → listen → accept → read/write → close/shutdown。
      socket create
      bind
      listen
      accept
      read / write
      close / shutdown
    客户端 :: 原图给出的调用顺序：socket create → connect → read/write → close/shutdown。
      socket create
      connect
      read / write
      close / shutdown
  编程范式
    每个连接 fork 一个子进程
    每个连接创建一个线程
    单线程处理 accept 和连接 I/O
    业务逻辑分离到 Worker 线程池
    main-sub reactor :: 主线程 accept，sub 线程池处理连接 I/O。
  调试工具
    netstat
    lsof
    tcpdump
    traceroute
    ping
    ip
'''),
 ('architecture','计算机组成原理','理解指令如何执行，以及处理器、存储器和设备怎样协作。',['8073','8074','8075'],'''计算机的基本组成 @8073
  计算机性能
    CPU 主频
    响应时间
    吞吐率
  计算机功耗
    散热
    能耗和电力
  冯·诺依曼体系结构
    运算器 / 处理器单元
    控制器
    存储器
    输入设备
    输出设备
  常见硬件
    CPU
    主板
    内存
    硬盘
    鼠标 / 键盘
    显示器
计算机的指令和运算 @8073
  计算机指令
    机器码
      编译 → 汇编 → 机器码
      指令格式和指令跳转
      函数调用和程序栈
    程序执行
      静态链接和 ELF 格式
      程序的装载和执行
      动态链接
  计算机运算
    二进制编码
      整数和补码
      字符串和 Unicode
      浮点数和定点数
    数字电路
      门电路
      加法器
      乘法器
处理器设计 @8073
  CPU
    建立数据通路
      处理器时钟
      触发器和锁存器
    面向流水线的设计
    控制冒险和数据冒险
    分支预测
    异常和中断
    SIMD 和并行计算
  其他处理器
    CISC 和 RISC
    GPU 和 NUMA 架构
    FPGA / ASIC / TPU :: 原图将 ASIC 拼作 AISC，此处统一为标准缩写。
    分布式计算
    虚拟机和 Docker
存储器和 I/O 系统 @8073
  存储器层次结构
    局部性原理
    SRAM 和 CPU 高速缓存
    DRAM 和内存
    SSD 硬盘和 Flash Card
    机械硬盘
    虚拟内存和内存保护
  I/O 系统
    IO_WAIT :: 原图文字为“IO_WAIT：CPU 和内存的通信”；保留此标签供对照，不将其作为 I/O wait 的准确定义。
    DMA 技术
    访问输入输出设备
  数据完整性
    RAID
    Erasure Code
    ECC 内存
    Hadoop 和分布式存储
5 大类 CPU 指令 @8074
  算术类指令
    add :: 原图示例：add $s1, $s2, $s3；$s1 = $s2 + $s3。
  逻辑类指令
    or :: 原图示例：or $s1, $s2, $s3；$s1 = $s2 | $s3。
  数据传输指令
    load word :: 原图示例：load $s1, 10($s2)；$s1 = memory[$s2 + 10]。这是原图中的示意写法。
  条件分支指令
    branch on equal :: 原图示例：beq $s1, $s2, 10；相等时跳转，原图以 PC+4+10 示意，具体偏移须依指令编码解释。
  无条件跳转指令
    jump :: 原图示例：j 1000；跳转到目标地址。
MIPS 指令 @8074
  指令类型
    R 型 :: 原图字段位宽依次为 6 / 5 / 5 / 5 / 5 / 6：opcode、rs、rt、rd、shamt、funct。关联算术操作与逻辑操作。
    I 型 :: 原图关联数据传输、条件分支、立即数操作。
    J 型 :: 原图关联无条件跳转。
  指令字段
    opcode
    rs
    rt
    rd
    shamt 位移量
    funct 功能码
    address / immediate
    target address
  表示方式
    汇编代码
    二进制表示 :: 原图 add 示例字段：opcode=0，rs=10001，rt=10010，rd=01000，shamt=00000，funct=100000。
    十六进制表示 :: 原图示例：0x02324020。
程序栈 @8075
  压栈
  出栈
  栈的地址方向 :: 原图示意：从栈底向栈顶，内存地址逐渐变小。
  函数栈帧
    更外层调用函数栈帧
    调用当前函数的栈帧
    当前执行函数栈帧
  内存布局
    栈底
    其他参数
    返回地址
    栈顶
寄存器 @8075
  PC 寄存器 :: 原图：下一条指令的内存地址。
  指令寄存器 :: 原图：当前正在执行的指令码。
  条件码寄存器 :: 原图：存放条件和逻辑运算的结果。
    CF / ZF / SF / OF
  其他寄存器
    累加寄存器
    向量寄存器
    通用寄存器
程序执行过程 @8075
  C 语言源码
  编译器
  汇编代码
  汇编器
  目标代码
  静态程序库
  链接器
  可执行代码
  装载器 :: 原图在可执行代码到内存的箭头处标为“汇编器”；此处按装载阶段整理为“装载器”，请结合原图核对。
  内存中的程序和数据
冯·诺依曼结构示意 @8075
  CPU
    Control Unit 控制器
    Arithmetic / Logic Unit 运算器
  Memory Unit 存储器
  Input Device 输入设备
  Output Device 输出设备
'''),
 ('networks','计算机网络','从分层协议到 HTTP、HTTPS 与 Web 服务，连接网络中的概念。',['8076','8077'],'''网络协议总览 @8076
  应用层
    DHCP
    HTTP
    HTTPS
    RTMP
    P2P
    DNS
    GTP
    RPC
  传输层
    UDP
    TCP
  网络层
    ICMP
    IP
    OSPF
    BGP
    IPSec
    GRE
  链路层
    ARP
    VLAN
    STP
  物理层
    网络跳线
HTTP 全览图 @8076
  DNS
    根 DNS
    顶级 DNS
    权威 DNS
    本地 DNS
  负载均衡
    四层与七层
  下层协议
    TCP/IP
      IPv4
      IPv6
    UNIX Domain Socket
    可靠数据传输
  HTTP/1.1
    RFC 文档
      RFC2616
      RFC7230
    请求 / 应答
      请求方法
        GET
        HEAD
        POST
      请求头 + 请求体
      响应头 + 响应体
      状态码
    无状态
    长连接机制
    缓存
    MIME
  编码与压缩
    Base64
    chunked
    gzip
    deflate
  WebSocket
    全双工
    二进制帧
    有状态
  网络世界
    局域网
    广域网
    因特网
      FTP
      IMAP / POP3
      BT
      Magnet
    万维网
      WWW
  WAF
    应用层防护
    访问控制
    审计
Web 技术 @8077
  爬虫
    crawler / spider
    robots.txt
  HTML
    HTML4
    HTML5
  编程语言与样式
    JavaScript
    CSS
    PHP
    Python
  浏览器
    Chrome
    Firefox
    Safari
    IE / Edge
    Opera
  URI / URL
    协议名
    查询参数
    编码
HTTP 演进与服务 @8077
  HTTP/2
    SPDY
    HPACK
    Server Push
    gRPC
  HTTP/3
    QUIC
      基于 UDP
  抓包工具
    Wireshark
    tcpdump
  代理
    正向代理
    反向代理
    proxy 协议
      V1
      V2
  WebService
    RESTful
    SOAP
    RPC
    JSON
  Web 服务器
    Nginx
      OpenResty
    Apache
    Microsoft-IIS
    Tomcat
      Servlet 容器
  CDN
    负载均衡
    就近访问
    Squid / Varnish / ATS
HTTPS @8077
  对称加密
    AES
    ChaCha
  非对称加密
    RSA
    DH
  摘要算法
    SHA-2
  证书
    X.509
    CA
  SSL / TLS
    SNI
    OCSP
    连接优化
'''),
 ('engineering','软件工程','用过程、方法和工具，把知识落实到软件的完整生命周期。',['8078'],'''软件工程核心知识 @8078
  质量焦点
  三要素
    过程
    方法
    工具
过程 @8078
  瀑布模型 :: 沿用原图的上级标签，其中并列列出瀑布、增量、迭代及其他衍生模型。
    瀑布模型
    增量模型
    迭代模型
    其他衍生模型
  敏捷开发
    Scrum
    极限编程
    看板
    其他敏捷方法
方法 @8078
  项目定义和计划
    可行性分析
    项目计划
    流程规范
    风险管理
    配置管理
  需求分析
    需求分析
    变更管理
  设计
    架构设计
    技术选型
    重构
  编码
    程序编码
    单元测试 / 集成测试
    持续集成
  测试
    测试用例编写
    功能测试 / 性能测试
    质量与安全
  运行维护
    版本发布
    故障调试
    日志分析
    线上监控
工具 @8078
  项目管理
    任务跟踪工具
    项目计划工具
    团队沟通工具
  需求分析
    需求跟踪工具
    原型制作工具
  设计
    UML 建模工具
    图表制作工具
  开发
    源代码管理
    持续集成工具
  测试
    Bug 跟踪工具
    测试管理平台
    自动化测试工具
    压力测试工具
  运行维护
    自动化部署
    日志分析工具
    线上监控工具
''')]
topic_config=json.loads((ROOT/'source/topics.json').read_text())
for t in topic_config:
 if t['status']=='ready':
  assert t['outline'].strip() and t['photos'], 'Ready topics require an outline and source photos'
  DOMAINS.append((t['id'],t['title'],t['description'],[p['id'].replace('IMG_','') for p in t['photos']],t['outline']))

def norm(s):return re.sub(r'[^a-z0-9\u4e00-\u9fff]','',unicodedata.normalize('NFKC',s).lower())
ocr={p.stem:json.loads(p.read_text()) for p in (ROOT/'source/ocr').glob('*.json')}
def match(label,photo):
 rows=ocr.get(photo,[]); a=norm(label)
 candidates=[]
 for r in rows:
  b=norm(r['text'])
  if not a or not b:continue
  ratio=difflib.SequenceMatcher(None,a,b).ratio()
  if a==b:ratio=1
  elif a in b and len(a)>=3:ratio=max(ratio,0.83)
  if ratio>=.78:candidates.append((ratio,r))
 if not candidates:return None
 _,r=max(candidates,key=lambda x:(x[0],-len(x[1]['text'])))
 x=max(0,min(1,r['x']));y=max(0,min(1,r['y']))
 return {'text':r['text'],'box':[x,y,min(r['w'],1-x),min(r['h'],1-y)],'confidence':r['confidence'],'method':'ocr-assisted'}
nodes=[];domains=[]
for slug,title,desc,photos,block in DOMAINS:
 stack=[];roots=[];photo='IMG_'+photos[0]
 for i,line in enumerate(block.strip().splitlines()):
  depth=(len(line)-len(line.lstrip()))//2
  text=line.strip();label,_,note=text.partition(' :: ')
  m=re.search(r' @(\d+)$',label)
  if m:photo='IMG_'+m[1];label=label[:m.start()]
  while len(stack)>depth:stack.pop()
  path_key='/'.join([slug]+[x['title'] for x in stack]+[label])
  stable_id=slug+'-'+hashlib.sha256(path_key.encode()).hexdigest()[:10]
  node={'id':stable_id,'title':label,'domain':slug,'parent':stack[-1]['id'] if stack else None,'children':[],'photo':photo,'note':note,'depth':depth}
  evidence=match(label,photo)
  if evidence:node['evidence']=evidence
  if stack:stack[-1]['children'].append(node['id'])
  else:roots.append(node['id'])
  nodes.append(node);stack.append(node)
 domains.append({'id':slug,'title':title,'description':desc,'photos':['IMG_'+p for p in photos],'roots':roots,'status':'ready','extension':any(t['id']==slug for t in topic_config),'count':sum(n['domain']==slug for n in nodes)})
extensions=[{k:v for k,v in t.items() if k not in ['outline','photos']}|{'roots':next((d['roots'] for d in domains if d['id']==t['id']),[]),'photos':[p['id'] for p in t['photos']]} for t in topic_config]
photo_labels={'8064':'原始目录','8065':'计算机基础总览','8066':'数据结构与算法（一）· 全幅','8067':'数据结构与算法（二）','8068':'常用数学 · 算法补充','8069':'操作系统 · 进程与内存','8070':'操作系统 · 文件、I/O 与网络通信','8071':'网络编程 · 基础、I/O 与框架','8072':'网络编程 · 协议与编程模型','8073':'计算机组成原理 · 总览','8074':'CPU 指令 · MIPS','8075':'程序栈、寄存器与程序执行','8076':'计算机网络 · 协议与 HTTP','8077':'计算机网络 · Web 与 HTTPS','8078':'软件工程'}
for t in topic_config:
 for p in t['photos']:photo_labels[p['id'].replace('IMG_','')]=p['title']
photos=[]
for num,label in photo_labels.items():
 p='IMG_'+num
 photos.append({'id':p,'title':label,'src':'photos/'+p+'.jpg','thumb':'photos/'+p+'-thumb.jpg','domains':[d['id'] for d in domains if p in d['photos']]})
data={'schemaVersion':1,'title':'计算机基础知识地图','description':'从知识结构出发，读懂计算机','domains':domains,'extensions':extensions,'nodes':nodes,'photos':photos,'contentPolicy':'根据用户提供的照片整理层级与摘要；原图中的简化说法在条目中另作说明。OCR 仅作为定位辅助，不能替代原图。'}
(DIST/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
# Browser-native data keeps file:// preview useful as well as normal static hosting.
(DIST/'data.js').write_text('window.KNOWLEDGE_DATA='+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';\n')
md=['# 计算机基础知识地图','',data['contentPolicy'],'']
for d in domains:
 md+=['## '+d['title'],'',d['description'],'']
 for n in nodes:
  if n['domain']==d['id']:
   md.append('  '*n['depth']+'- '+n['title']+('：'+n['note'] if n['note'] else '')+f' [原图]({"photos/"+n["photo"]+".jpg"})')
 md.append('')
md+=['## 后续专题','']
for t in extensions:md.append('- '+t['title']+'：'+('已接入' if t['status']=='ready' else '等待图片')+'。'+t['description'])
md.append('')
(DIST/'knowledge-map.md').write_text('\n'.join(md))
print(json.dumps({'domains':len(domains),'nodes':len(nodes),'photos':len(photos),'evidenceLocated':sum('evidence'in n for n in nodes)},ensure_ascii=False))
