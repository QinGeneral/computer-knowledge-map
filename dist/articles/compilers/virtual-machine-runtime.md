# 基于虚拟机的运行时

## 基本概念

一部分高级语言会提供一个语言的特有虚拟机运行时（一个运行于操作系统之上的应用程序），在编译时先将源代码转换为一种中间代码（通常是字节码），把中间代码交给虚拟机执行，虚拟机也可以抹平不同物理机硬件架构和不同操作系统之间的差异性。

## 典型代表

Java、Python、JavaScript

## 核心概念

### 基于栈的虚拟机

- 典型代表：JVM（Java）、Python 虚拟机。
- 优点：易于生成代码。
- 缺点：代码体积较大、不能充分利用寄存器。

### 基于寄存器的虚拟机

- 典型代表：Erlang、Lua、Dalvik（Android）、Ignition（JavaScript-V8）。
- 优点：代码体积较小，因为参数更好地结合了寄存器进行传递。
- 缺点：实现起来更加复杂，难度大。

## 面试指南

### Java

- HotSpot 是基于堆栈架构的虚拟机。
- 内存管理：划分了程序计数器、虚拟机栈、堆、方法区、运行时常量和本地方法栈等不同区域。
- JVM 封装了操作系统的线程模型，为应用程序提供了并发处理机制。
- 操作系统的多线程并发、线程锁等概念是面试常考的话题之一。

### JavaScript-V8

- 曾经是基于堆栈架构的虚拟机，后来改为了目前的基于寄存器架构。
- 运行时方面的主要优化算法：隐藏类、内联缓存。
- 垃圾回收方面基于分代回收、染色算法。

### Python

- 在运行时层面，Python 虚拟机有些时候是运行机器码，比如内置函数，而有些时候是解释执行字节码。前者的栈帧类似于 C 语言，而后者则会加入操作数栈，这一点更像 JVM。
- 自己实现了对堆的管理机制，被称作 Arena 机制，相比直接调用操作系统的堆内存操作来说，更加高效、灵活。
- 在并发方面，除了对系统的线程进行了封装之外，还实现了协程机制。

## 扩展阅读

一篇有关 Java HotSpot 虚拟机的论文：[schwaighofer09master.pdf](http://ssw.jku.at/Research/Papers/Schwaighofer09Master/schwaighofer09master.pdf)

JavaScript-V8 虚拟机的栈帧：

![Ignition 的栈帧](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-45-ignition-frame.jpg)

### 垃圾收集（GC）常见一些算法

- 标记-清除（Mark and Sweep）
- 标记-整理（Mark and Compact）
- 停止-拷贝（Stop and Copy）
- 引用计数
- 分代收集
- 增量收集
- 并发收集

## 原图对照

> 整理说明：正文按所提供图片转录，合并印刷换行并调整 Markdown 排版；保留原图的术语、表述和历史语境。图表直接截取原图，参考链接使用图中二维码地址。

- [第 45 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-43.jpg)
- [第 46 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-44.jpg)
- [第 47 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-45.jpg)
- [第 48 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-46.jpg)
