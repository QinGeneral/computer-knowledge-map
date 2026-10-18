# 语义分析

## 基本概念

语义分析是编译器前端的第三个处理环节，其输入是在语法分析环节输出的抽象语法树，根据语言的特性对当前语法树进行检查和优化，在结构上进行节点的补充属性、调整语义化标识和删除不必要的节点等操作，因此输出的依然还是抽象语法树。

语义分析会针对上下文相关的内容进行处理，有时一部分语义分析的工作会和语法分析环节融合在一起。

![编译过程中的每个阶段，都可能使用符号表](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-13-phases.jpg)

## 核心难点

### 上下文相关文法

- 属性文法：上下文相关文法对 EBNF 进行了扩充，在上下文无关的推导过程中，辅助性解决一些上下文相关的问题。
- 注意：上下文相关文法由于和语言的设计、特性强耦合，并没有像状态图、BNF 那样有直观的、通用化分析范式。
- 应用场景：控制流检查、闭包分析、引用消解等。

```c
int a = 10;
int foo(int a) {
    int b = a + 3;
    return b;
}
```

![变量的作用域](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-14-scope.jpg)

### 属性计算

编译器一般会采用属性计算的方法，来计算出每个 AST 节点的类型属性，然后检查它们是否匹配。

- 属性文法：属性计算的方法，就是基于语法规则，来定义一些属性计算的规则，在做语法解析或遍历 AST 的时候执行这些规则，我们就可以计算出属性值。这种基于语法规则定义的计算规则，被叫做属性文法（Attribute Grammar）。
- 属性计算：S 属性，字面意思是综合属性，就是在 AST 中从下级的属性归纳、综合出本级的属性，更准确地说，是通过下级节点和自身来确定的；I 属性，继承属性，即 AST 中某个节点的属性是由上级节点、兄弟节点和它自身来决定的。
- 形成的数据结构：Annotated AST（带有标注信息的 AST）。
- 语法制导的翻译：属性计算的特点是会基于语法规则，增加一些与语义处理有关的规则，我们把这种语义规则的定义叫做语法制导的定义，如果变成计算动作，就叫做语法制导的翻译。

![带有标注信息的 AST](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-15-annotated-ast.jpg)

### 类型系统

- 类型：在计算机语言里，类型是数据的一个属性，它的作用是来告诉编译器或解释器，程序可以如何使用这些数据。
- 类型系统：类型系统是一门语言所有的类型的集合，其中包含了操作这些类型的规则，以及规定了类型之间是怎么相互作用的（比如一个类型能否转换成另一个类型）。
- 类型检查：这是与类型有关的分析和处理工作之一。主要用于对源程序代码中，一些类型不匹配的情况进行隐式类型转换或直接抛错。
- 子类型：面向对象编程时，我们可以给某个类创建不同的子类，实现一些个性化的功能；写程序时，我们可以站在抽象度更高的层次上，不去管具体的差异。把这里的结论抽象成一般意义上的类型理论，就是子类型。
- 类型转换：比如说，表达式“a=b+10”，如果 a 的类型是浮点型，而右边传过来的是整型，那么一般就要进行缺省的类型转换。
- 参数化类型/泛型：泛型是程序设计语言的一种风格或范式。泛型允许程序员在强类型程序设计语言中，编写代码时使用一些以后才指定的类型，在实例化时作为参数指明这些类型。

### 符号表

- 符号表内包含的信息：名称、分类、类型、作用域等。
- 存储形式：线性表格、层次化表格。

![一种层次化的符号表](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-17-symbol-table.jpg)

- 符号表的作用：维护程序中定义的标识符（ID 类 Token），提供给编译器的各个环节进行操作。
- 建立符号表的过程：整个编译器前端都会涉及到，词法分析阶段将 ID 类 Token 收集到符号表中，语法分析阶段可进行读取和补充，语义分析阶段在做引用消解时，符号表的作用至关重要。
- 注意：符号表跟编译过程多个阶段都相关。

![利用符号表帮助做引用消解](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-17-reference-table.jpg)

### 引用消解

- 概念解释：引用消解是一种非常重要的上下文相关的语义规则，它其实就是从符号表里查找被引用的符号的定义。
- 作用域：指计算机语言中变量、函数、类等起作用的范围。对于变量来说，为了找到正确的引用，就需要用到作用域。一般来说，它有两种使用场景，一种是标识符作用域，一种是词法作用域。

![变量引用的消解](https://qingeneral.github.io/computer-knowledge-map/figures/compilers/compiler-18-references.jpg)

### 闭包分析

很多语言都支持闭包。而要正确地使用闭包，就必须在编译期知道哪些变量是自由变量。

这里的自由变量是指在本函数外面定义的变量，但被这个函数中的代码所使用。这样，在运行期，编译器就会用特殊的内存管理机制来管理这些变量。所以，对闭包的分析，也是上下文敏感的。

### 控制流检查

像 return、break 和 continue 等语句，都与程序的控制流有关，它们必须符合控制流方面的规则。

在 Java 这样的语言中，语义规则会规定：如果返回值不是 void，那么在退出函数体之前，一定要执行一个 return 语句，那么就要检查所有的控制流分支，是否都以 return 语句结尾。

## 面试指南

语义分析与每一门编程语言的具体语法特性息息相关，因此针对不同语言的语义分析过程可能大相径庭。

- Java 在语义分析环节着重静态类型处理，并会对很多源程序中所涉及的语法糖进行去除。
- Python 在语义分析环节的一个显著特点是：由于其语法特性可以不声明变量就直接使用，所以编译器要能识别出正确的“定义-使用”关系。
- TypeScript 作为 JavaScript 的一种方言，强调通过类型检查在编译期提前发现程序的错误（而不像 JavaScript 那样在运行期才能发现很多问题），TypeScript 在编译耗时中有超过一半的时间用在了类型检查上。
- MySQL 在对 SQL 的语义分析过程中，需要结合对库名、表名等引用消解，进行正确性检查以及必要的优化。

## 扩展阅读

- 一本介绍有关语义分析的形式化方法的书：The Formal Semantics of Programming Languages: An Introduction (Foundations of Computing)
- 面向对象的语言特性：虎书（C 语言版）第 14 章
- 函数是语言的特性：虎书（C 语言版）第 15 章

## 原图对照

> 整理说明：正文按所提供图片转录，合并印刷换行并调整 Markdown 排版；保留原图的术语、表述和历史语境。图表直接截取原图，参考链接使用图中二维码地址。

- [第 15 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-13.jpg)
- [第 16 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-14.jpg)
- [第 17 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-15.jpg)
- [第 18 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-16.jpg)
- [第 19 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-17.jpg)
- [第 20 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-18.jpg)
- [第 21 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-19.jpg)
- [第 22 页](https://qingeneral.github.io/computer-knowledge-map/photos/compiler-20.jpg)
