# 中间代码

## 后端部分

概述：编译器的后端是指基于前端解析生成的 AST 或其他中间代码（IR），经过一系列优化之后，生成可以直接运行程序代码（目标代码）的程序模块。目标代码有时是直接编译到程序将要运行的物理机的本地代码上（机器码），还有一些时候是先编译为一种中间代码（通常是跨平台的），结合各个系统平台的虚拟机来运行。

编译器后端更多的是与 CPU、内存等硬件的底层设施打交道，通常只有参与操作系统方面的研发工作才有机会涉足。在理论方面，会涉及到计算机体系结构方面硬件理论知识。这对软件工程师提出了更高的要求，需要具备软硬结合等跨领域、跨学科的综合型知识。

## 中间代码

IR，也就是中间代码（Intermediate Representation，有时也称 Intermediate Code，IC），它是编译器中很重要的一种数据结构。编译器在做完前端工作以后，首先就是生成 IR，并在此基础上执行各种优化算法，最后再生成目标代码。

## 基本概念

### 基于用途的分类

第一类用途：基于源语言做一些分析和变换（HIR）

第二类用途：独立于源语言和 CPU 架构做分析和优化（MIR）

第三类用途：依赖于 CPU 架构做优化和代码生成（LIR）

### IR 数据结构

第一种：类似 TAC（Three Address Code）的线性结构

第二种：树结构

第三种：DAG - 有向无环图

第四种：PDG - 程序依赖图

![冗余的子树——树结构；DAG 结构消除了冗余的子树——DAG 结构](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-24-ast-dag.jpg)

### P-Code：用于解释执行的 IR

即“Portable Code”，这是另外一种 IR 的类别范畴，与目标机器无关，因此可以在多种设备上基于运行时虚拟机的方式进行解释执行。

### SSA 格式

SSA 是 Static Single Assignment 的缩写，也就是静态单赋值。这是 IR 的一种设计范式，它要求一个变量只能被赋值一次。

SSA 的优点：使用 SSA 的形式，体现了精确的“使用-定义（use-def）”关系。并且变量的值定义出来以后就不再变化，所以基于 SSA 更容易运行一些优化算法。

## 面试指南

- Java 的字节码就是一种 IR，它可以直接被 JVM 解释执行，也可以进一步优化编译（JIT）到机器码运行。
- JavaScript - V8 的 Ignition 解释器接收的字节码，也有类似的机制。它是通过 TurboFun 进行 JIT 编译为机器码。

## 扩展阅读

- 关于程序依赖图的论文参考：[ferrante87.pdf](https://www.cs.utexas.edu/~pingali/CS395T/2009fa/papers/ferrante87.pdf)
- LLVM 官方手册：[LangRef.html](https://llvm.org/docs/LangRef.html)
- Java 虚拟机字节码指令集：[jvms-6.html](https://docs.oracle.com/javase/specs/jvms/se14/html/jvms-6.html)
- 鲸书 - 第 4 章

## 原图对照

> 整理说明：正文按所提供图片转录，合并印刷换行并调整 Markdown 排版；保留原图的术语、表述和历史语境。图表直接截取原图，参考链接使用图中二维码地址。

- [后端部分扉页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-21.jpg)
- [第 24 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-22.jpg)
- [第 25 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-23.jpg)
- [第 26 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-24.jpg)
- [第 27 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-25.jpg)
