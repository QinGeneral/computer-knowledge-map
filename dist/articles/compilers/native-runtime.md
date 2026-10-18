# 基于物理机与操作系统的运行时

## 运行时部分

概述：基于对一门高级语言设计角度的考虑，我们通常会提到编译期和运行时两个阶段。如今很多动态类型语言、脚本语言，出于便于开发等需要，都会将很多工作从编译期后移到运行时。而运行时的很多工作，其实与程序编译期的处理流程又是密不可分的，因此对于编译原理的学习不得不涉足运行时范畴的很多内容。

## 基本概念

一些传统的高级语言，会直接将源代码编译为机器上直接执行的机器代码，因此对这部分编程语言运行时的讨论，实际上是对物理计算机（简称为物理机）和操作系统相关知识的讨论。

每一种不同的操作系统或不同物理机硬件架构，都需要将源代码编译成相应的目标代码，以确保其在目标平台上的正确运行。

![计算机运行机制](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-38-computer.jpg)

## 典型代表

C、C++、Golang

## CPU 相关核心概念

CPU 是计算机的核心，是运行指令的地方。不同架构的 CPU 对软件层面暴露了不同的指令集以供计算。

### 指令

在所有架构 CPU 上，指令最终形态都是 0101 的二进制方式，为了便于理解，我们通常会用汇编代码来表示机器指令。

根据 GNU 汇编器规定的格式，每条指令都包含两部分：操作码（opcode）和操作数（oprand）。

操作码是让 CPU 执行的动作，而操作数是指令的操作对象，它可以是常数、寄存器和某个内存地址。

![汇编代码示例](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-39-assembly.jpg)

### 寄存器

寄存器可以直接由指令访问。寄存器的读写速度非常快，大约是内存 100 倍。所以我们编译后的代码，要尽量充分利用寄存器，而不是频繁地去访问内存。

### 高速缓存

高速缓存通常是多级的（常见 CPU 架构中至少分为 L1～L3）。高速缓存也比内存快。

CPU 在读取指令和数据的时候，不是一次读取一条，而是读取相邻一批数据，放到高速缓存里。接下来要读取的数据，很可能已经在高速缓存里了，通过这种机制来提高运行性能。因此，编译器要尽量提高缓存的命中率。

### CPU 的其他功能模块

CPU 内部有多个功能单元，有的负责计算，有的负责解码，等等。所以，一个指令可以被切分成多个执行阶段，每个阶段在不同的功能单元上运行，这为实现指令级并行提供了硬件基础。

## 内存相关核心概念

### 1. 代码区

存放编译完成以后的机器码。

### 2. 静态数据区

保存程序中全局的变量和常量。

### 3. 栈

适合保存生存期比较短的数据，比如函数和方法里的本地变量。

- 重要知识点：栈帧的构成、活动记录、逐级调用过程。
- 栈的特点：申请和释放——修改栈顶指针，生存期与作用域相同。

### 4. 堆

适合管理生存期较长的一些数据，这些数据在退出作用域以后也不会消失。

- 重要知识点：通过操作系统 API 手动申请和释放。
- 管理机制：自动管理、手动管理。

![物理内存和逻辑内存关系](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-41-address-space.jpg)

## 操作系统相关核心概念

1. 定义：除了硬件支撑，程序的运行还需要软件，这些软件叫做运行时系统。
2. 操作系统：对于把源代码编译成机器码在操作系统上运行的语言来说（比如 C、C++），操作系统本身就可以看做是它们的运行时系统。
3. 管理 CPU 资源：分时执行。比如，时间片轮转算法，将 CPU 以时钟周期为单元执行多进程任务，实现并发。
4. 管理内存资源：逻辑内存（系统内核对内存地址划定）、物理内存（硬件中具体每一个 Bit 实际硬件存储情况）、虚拟内存（基于操作系统内核对内存管理问题的抽象，通常有一部分虚拟内存实际上是存在磁盘上的）。

## 面试指南

- C/C++：运行时其实就是操作系统本身，因此涉及到的概念其实是操作系统内核以及内核提供给用户态应用程序的各种 API。
- Golang：虽然像 C/C++ 一样也是编译成二进制的可执行文件，但它的运行时却更复杂，因为自带了垃圾回收（GC）和自有的一套并发机制（goroutine）。

## 扩展阅读

- C 语言的内存布局方式（见图例）
- 鲸书（第 5 章）：运行时支持
- 龙书（第 7 章）：运行时刻环境

![C 语言的内存布局方式](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-42-memory-layout.jpg)

## 原图对照

> 整理说明：正文按所提供图片转录，合并印刷换行并调整 Markdown 排版；保留原图的术语、表述和历史语境。图表直接截取原图，参考链接使用图中二维码地址。

- [运行时部分扉页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-36.jpg)
- [第 39 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-37.jpg)
- [第 40 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-38.jpg)
- [第 41 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-39.jpg)
- [第 42 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-40.jpg)
- [第 43 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-41.jpg)
- [第 44 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-42.jpg)
