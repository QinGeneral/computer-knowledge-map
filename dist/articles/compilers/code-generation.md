# 目标代码生成

## CPU 硬件架构

- 复杂指令集（CISC）：典型代表 Intel x86，Register-Memory 架构，在指令里可以混合使用内存地址和寄存器。
- 精简指令集（RISC）：典型代表 ARM，Load-Store 架构。在这种架构下，指令被分为内存访问（Load 和 Store）和 ALU 操作两大类，而后者只能在寄存器上操作。各种 RISC 指令集都是 Load-Store 架构的，比如 ARM、MIPS、RISC-V 和 PowerPC 等。

## 后端处理整体过程

![典型后端处理过程](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-32-backend.jpg)

MIR → 指令选择 → LIR → 指令排序 → 寄存器分配 → 指令排序 → 翻译成目标代码 → 目标代码。

## 关键流程

### 指令选择

对于相同的源代码和 IR，编译器可以生成不同的指令，而我们要选择代价最低的那个。

### 指令排序

CPU 内部是分成多个功能单元的。

对于一条指令，每个功能单元处理完毕以后，交给下一个功能单元，然后它就可以接着再处理下一条指令。

![在某一时刻，各个功能部件分别用于不同的指令——多个功能单元并行](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-33-pipeline.jpg)

在同一时刻，不同的功能单元实际上是在处理不同的指令。多条指令实质上是并行执行的，从而减少了总的执行时间，这种并行叫做指令级并行。

但是有的时候，指令之间会存在依赖关系，后一条指令必须等到前一条指令执行完毕才能运行。

指令排序的目的是让指令以最佳顺序执行，尽量利用指令级并行的性能优势。

### 寄存器分配

对于编译器来说，肯定要尽量利用寄存器，不去读写内存。因为内存读写对于 CPU 来说就是 IO，性能很低。

### 窥孔优化

窥孔优化思路，是提供一个固定大小的窗口，比如能够容纳 20 条指令，并检查窗口内的指令，看看是否可以优化。然后再往下滑动窗口，再次检查优化机会。

### 调用约定（面向硬件）

ABI 是 Application Binary Interface 的缩写，也就是应用程序的二进制接口。通常，ABI 里面除了规定调用约定外，还要包括二进制文件的格式、进程初始化方式等更多内容。

在实现编译器时候，你可以发明自己的调用约定，比如哪些寄存器用来放参数、哪些用来放返回值，等等。但是，如果你要使用别语言编译好的目标文件，或者你想让自己的编译器生成的目标文件被别人使用，那你就要遵守某种特定的 ABI 标准。

## 面试指南

具备芯片相关产品的研发经验是真正掌握编译目标代码生成部分程序开发的必要前提。

## 扩展阅读

- 指令排序：基于数据依赖图的 List Scheduling 算法
- 寄存器分配：寄存器分配染色算法
- 指令选择：树覆盖算法

## 原图对照

> 整理说明：正文按所提供图片转录，合并印刷换行并调整 Markdown 排版；保留原图的术语、表述和历史语境。图表直接截取原图，参考链接使用图中二维码地址。

- [第 34 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-32.jpg)
- [第 35 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-33.jpg)
- [第 36 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-34.jpg)
- [第 37 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-35.jpg)
