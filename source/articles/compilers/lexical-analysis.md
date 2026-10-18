# 词法分析

## 前端部分

概述：编译器的前端是指将源程序代码（字符串）处理转换为抽象语法树（AST）的程序模块，通常是作为编译器中的一部分而存在的；也有一些语言的编译器只实现前端功能，而复用其他已有的编译器后端，这通常是建立在将源程序代码转换为某种中间代码的基础之上。

编译器前端其实与一门编程语言的设计息息相关，这也是一门语言的核心，在理论方面更多地牵涉到形式语言、自动机理论乃至一些数学上的基础理论知识；同时也要求设计者拥有丰富的软件编码工作经验，这又牵涉到了软件工程、工程实践等具体项目经验的积累。

## 基本概念

词法分析是编译器前端部分的第一个处理环节，其输入通常就是未经任何其他处理的源程序代码，输出的是一个 Token 化的序列（通常以 Token 对象构成的数组方式实现），供下游处理环节使用。

![把字符串转换为 Token（注意：其中的空白字符代表空格、tab、回车和换行符，EOF 是文件结束符）](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-06-token.jpg)

- 正则文法：词法分析工作的主要文法，它涉及的重要概念是正则表达式。
- 正则表达式：正则文法的一种直观描述，它是按照指定模式匹配字符串的一种字符组合。
- 正则表达式工具：字符串的模式匹配工具。

## 核心难点

### 有限状态自动机

构造词法分析器使用的计算模型：有限自动机（FSA）。它是用于识别正则文法的一种程序实现方案。其组成的词法单元是 Token，也就是指程序中标记出来单词和标点符号，它可以分成关键字、标识符、字面量、操作符号等多个种类。

在实际的编译器中，词法分析器一般都是手写的。

状态机的描述方式——状态图：

![左：一个能够识别标识符和数字字面量的有限自动机；右：一个能够识别 int 关键字和标识符的有限自动机](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-07-fsa.jpg)

### DFA 与 NFA

NFA：不确定的有限自动机。它的特点是：该状态机中存在某些状态，针对某些输入，不能做一个确定的转换。这里可以细分成两种情况：一种是对于一个输入，它有两个状态可以转换；另一种是存在 ε 转换的情况，也就是没有任何字符输入的情况下，NFA 也可以从一个状态迁移到另一个状态。

NFA 的优点是在设计上更简单直观，缺点是它无法避免回溯问题，在某些极端的情况下可能会造成编译器运行的性能低下。主要适用于状态较为简单，且不存在回溯的场景。

DFA：确定的有限自动机。它的特点是：该状态机在任何一个状态，基于输入的字符，都能做一个确定的状态转换。

DFA 的优点是它可以避免回溯问题，运行性能较高，缺点是 DFA 通常不容易直接设计出来，需要通过一系列方案，基于 NFA 的转换而得到，并且需要占用额外的空间。主要适用于状态较为复杂，或者对时间复杂度要求较为严苛的工业级词法分析器。

示例：

![DFA](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-08-dfa.jpg)

![NFA](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-09-nfa.jpg)

## 面试指南

### 从 Java 程序员视角看词法分析

JDK 源代码：`com.sun.tools.javac.parser.Lexer`（词法解析器接口），它可以把字符流变成一个个的 Token，具体的实现在 Scanner 和 JavaTokenizer 类中。

### 从 Python 程序员的视角看词法分析

CPython 编译器源代码：tokenizer.c 的关键函数 tok_get0。

### 从 JavaScript 程序员的视角看 V8 引擎的词法分析

V8 的词法分析：[https://v8.dev/blog/scanner](https://v8.dev/blog/scanner)

## 扩展阅读

- NFA 转 DFA 的算法：龙书（第 2/3 版）第 3.7 章节
- 输入缓冲技术：龙书（第 3 版）第 3.2 节
- 有穷自动机：龙书（第 3 版）第 3.6 节

## 原图对照

> 整理说明：正文按所提供图片转录，合并印刷换行并调整 Markdown 排版；保留原图的术语、表述和历史语境。图表直接截取原图，参考链接使用图中二维码地址。

- [目录 1](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-01.jpg)
- [目录 2](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-02.jpg)
- [目录 3](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-03.jpg)
- [前端部分扉页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-04.jpg)
- [第 07 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-05.jpg)
- [第 08 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-06.jpg)
- [第 09 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-07.jpg)
- [第 10 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-08.jpg)
- [第 11 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-09.jpg)
