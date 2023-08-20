## 第一节 等式

### 一、等式的性质

1. 等式的两边同时加上（或减去）同一个数或代数式，等式仍然成立。   
如果$a = b$，则对于任意`c`，都有 $a+c=b+c$.
2. 等式的两边同时乘（或除以）同一个**不为零**的数或代数式，等式仍然成立。
如果$a = b$，则对于任意**不为零**的`c`，都有 $ac=bc$，$\cfrac{a}{c}=\cfrac{b}{c}$.

### 二、方程的解集

方程的解（或根）是指能使方程左右两边相等的未知数的值。一般地，把一个方程所有解的组成的集合称为这个方程的解集。

### 三、一元二次方程根与系数的关系

当一元二次方程 $ax^2+bx+c=0, (a \ne 0)$的解集不是空集时，这个方程的解可以记为：$x_1=\cfrac{-b + \sqrt{b^2-4ac}}{2a}, x_2=\cfrac{-b - \sqrt{b^2-4ac}}{2a}$.   

一元二次方程根与系数的关系为：$x_1+x_2=-\cfrac{b}{a}, x_1x_2=\cfrac{c}{a}$


## 第二节 不等式

### 一、不等式及其性质与证明

1. 不等式的有关概念
    - **不等式**：用数学符号 （$\neq, >, <, \geqslant , \leqslant $) 连接两个数或代数式，以表示它们之间的不等关系，含有这些不等式的式子，称为不等式；   
    - **同向不等式**：我们把 `a > b`和`c > d`（或`a < b`和`c < d`）这类不等号方向相同的不等式，称为同向不等式。
    - **异向不等式**：若一个不等式的左边大于右边，另一个不等式的左边小于右边，则称这两个不等式为异向不等式。
    - **绝对值不等式**：一般地，含有绝对值的不等式称为绝对值不等式；
2. 比较两个实数大小的依据
    - 设任意两个实数`a`, `b`，则有：   
    $a-b > 0 \iff a > b$;    
    $a - b = 0 \iff a = b$;    
    $a - b < 0 \iff a < b$.    
    - 设任意两个**正**实数，`a`, `b`，则有：   
    $\frac{a}{b} > 1 \iff a > b$;    
    $\frac{a}{b} = 1 \iff a = b$;    
    $\frac{a}{b} < 1 \iff a < b$.    
3. 不等式的性质
    - **对称性**： $a > b \iff b < a$.  
    - **传递性**： $a > b, b > c \Rightarrow a > c; a < b, b < c \Rightarrow a < c$.
    - **可加性**： $a > b \Rightarrow a + c > b + c $.      
    - **移项法则**： $a + b > c \iff a > c-b$.    
    - **同向不等式可加**： $a > b, c > d \Rightarrow a + c > b +d$.    
    - **异向不等式可减**： $a > b, c < d \Rightarrow a - c > b -d$.    
    - **可乘性**： $a > b, c > 0 \Rightarrow ac > bc; a > b, c < 0 \Rightarrow ac < bc$.     
    - **同向正值不等式可乘**: $a > b > 0, c > d \Rightarrow ac > bd$.     
    - **正值不等式两边同时取`n`次幂**： $a > b > 0 \Rightarrow a^n > b^n, (n \in \N, n > 1)$.    
    - **正值不等式两边同时取`n`次算术根**： $a > b > 0 \Rightarrow \sqrt[n]{a} > \sqrt[n]{b}, (n \in \N, n > 1)$.     
    - **正值不等式两边可以同时取倒数**：$a > b > 0 \Rightarrow \cfrac{1}{a} < \cfrac{1}{b} $.       
    - **异向正值不等式可除**: $a > b > 0, 0 < c < d \Rightarrow \cfrac{a}{c} > \cfrac{b}{d}$.       
4. 常用不等式
    - 若 $a, b \in \R$，则 $a^2 \geqslant 0$ (当且仅当 $a = 0$时，等号成立)，$|a| \geqslant 0, (a-b)^2 \geqslant 0 $ （当且仅当 $a=b$ 时，等号成立）。   
    - 若 $a, b \in \R$, 则 $a^2+b^2 \geqslant 2ab, \cfrac{a^2+b^2}{2} \geqslant (\cfrac{a+b}{2})^2$ (均是当且仅当 $a=b$时，等号成立)。    
    - 若 $a, b, c \in \R$，则 $a^2+b^2+c^2 \geqslant ab + bc + ca, a^2+b^2+c^2 \geqslant \cfrac{(a+b+c)^2}{3} $，（均是当且仅当 $a = b = c$时，等号成立）。   
    - 若 $a > 0, b > 0$，则 $\cfrac{2ab}{a+b} \leqslant \sqrt{ab} \leqslant \dfrac{a+b}{2} \leqslant \sqrt{\cfrac{a^2+b^2}{2}}$。   
    其中：   
    $\cfrac{2ab}{a+b} = \cfrac{2}{\cfrac{1}{a} + \cfrac{1}{b}}$ 为`a`, `b`两个实数的**调和平均值**；   
    $\sqrt{\dfrac{a^2+b^2}{2}}$ 是`a`, `b`两个实数的**平方平均值**；    
    $\sqrt{ab}$ 是`a`, `b`两个实数的**几何平均值**；  
    $\cfrac{a+b}{2}$ 是`a`, `b`两个实数的**算术平均值**；   
    - **均值不等式**   
        - 若 $a > 0, b > 0$, 则 $\cfrac{a+b}{2} \geqslant \sqrt{ab}$ （当且仅当 $a = b$ 时，等号成立）。    
        变形：$a+b \geqslant 2\sqrt{ab}, ab \leqslant (\cfrac{a+b}{2})^2 $.       
        - 若 $a > 0, b > 0, c > 0$，则 $\cfrac{a+b+c}{3} \geqslant \sqrt[3]{abc}$ （当且仅当 $a = b = c$ 时，等号成立）。    
        变形：$a+b+c \geqslant 3\sqrt[3]{abc}, abc \leqslant (\cfrac{a+b+c}{3})^3$.    
    - **绝对值不等式**      
        - $|x| \leqslant a (a > 0)$ 的解集为 $\set{x|-a<x<a}$.    
        - $|x| \geqslant a (a > 0)$ 的解集为 $\set{x|x>a || x < -a}$.    
        - $||a|-|b|| \leqslant |a \plusmn b| \leqslant |a| + |b|$.      
5. 求代数式的最值   
    - 两个正数和为定值，乘积有最大值，即 $a > 0, b > 0$, 若 $a+b=S$ (定值)，则有 $ab \leqslant (\cfrac{a+b}{2})^2 = \cfrac{S^2}{4}$ (当且仅当 $a=b=\cfrac{S}{2}$ 时， $(ab)_{max}=\cfrac{S^2}{4}$ ).     
    - 两个正数积为定值，和有最小值，即$a > 0, b > 0$, 若 $ab=P$ (定值)，则有 $ab \geqslant 2\sqrt{ab}=2\sqrt{P}$ (当且仅当 $a=b=\sqrt{P}$ 时， $(a+b)_{max}=2\sqrt{P}$ ).        
6. 证明不等式的常用方法
    - **比较法**    
        - **差比法**：$a - b \geqslant 0 \Rightarrow a \geqslant b$.       
        - **商比法**: $\cfrac{a}{b} \geqslant 1 (b > 0) \Rightarrow a \geqslant b (b > 0)$.     
    - **综合法**：从已知条件出发，综合利用各种结果，经过逐步推导，最后得到结论的方法，在数学上通常称为**综合法**。    
    - **分析法**：执果索因，从要求证的不等式出发，返回去求使此不等式成立的充分条件。     
    - **反证法**： 首先假证结论的否定成立，然后由此进行推理得到矛盾，最后得出假设不成立。    
    - **放缩法**：根据证明的需要对某些式或值进行适当的放大或缩小。    
    - **构造法**：通过构造函数、方程、数列、复数（向量）或不等式来证明不等式。    
    - **判别式法**：与一元二次函数有关的或能通过等价变形转化为一元二次方程的问题，利用判别式与方程解的关系来处理。    
    - **数学归纳法**：(1) 证明当`n=1`时命题成立；(2) 假设`n=m`时命题成立，那么可以推导出`n=m+1`时命题也成立(`m`为任意自然数)。    


### 二、不等式的解法

1. 一元二次不等式
    - 设$x_1, x_2$ 是一元二次方程 $ax^2+bx+c=0, (a, b, c \in \R, a \ne 0)$ 的两个实数根。    
    TBD. 
    - 解一元二次不等式的一般步骤：    
        - 对不等式变形，使一端为零且二次项系数大于零；
        - 计算判别式 $\Delta$ 。   
        - $\Delta \geqslant 0$，求出相应的一元二次方程的根。    
        - 根据二次函数的图像写出一元二次不等式的解集。   

2. 简单高次不等式的解法   
对于可化为 $F(x) = (x-x_1) (x - x_2)...(x-x_n) > 0$ 形式的高次不等式可按以下标根法求解。 设 $x_1 < x_2 < ... < x_n, x_i \ne x_j, i \ne j $ :
    - 将每个因式的根按大小顺序标在数轴上；    
    - 从右上方依次通过每个点画出曲线；   
    TBD.
    - $F(x) > 0$的解集为上方波峰包含的区间； $F(x) < 0$ 的解集为下方波谷包含的区间；      
3. 绝对值不等式
    - **绝对值**的定义：数轴上表示数`x`的点与原点的距离为数`x`的绝对值，记作`|x|`。   
    若$x \in \R, x = \begin{cases}
        x & x > 0 \\
        0 & x = 0 \\
        -x & x < 0
    \end{cases}$
    - 几何意义：`|x|`是指数轴上坐标为`x`的点到原点的距离， `|x-m|`是指数轴上坐标为`x`的点到坐标为`m`的点的距离。   
    - 绝对值的运算性质   
        - $|a\sdot b|=|a| \sdot |b|$.    
        - $|\cfrac{a}{b}|=\cfrac{|a|}{|b|} \space (b \ne 0) $.    
        - $||a|-|b|| \leqslant |a + b| \leqslant |a| + |b| $（当且仅当 $ab\leqslant 0$，左边等号成立；当且仅当 $ab\geqslant 0$，右边等号成立）.     
        - $||a|-|b|| \leqslant |a - b| \leqslant |a| + |b| $（当且仅当 $ab\geqslant 0$，左边等号成立；当且仅当 $ab \leqslant 0$，右边等号成立）.      
        - $|a_1+a_2+\sdot \sdot \sdot +a_n| \leqslant |a_1| + |a_2| + \sdot \sdot \sdot + |a_n| \space (n \in \N)$.             
    - 若 $a > 0$，则 $|x| < a \iff -a < x < a; |x| > a \iff x > a \mid \mid x < -a$.    
    - 绝对值不等式的解法   
    基本思想是利用等价转化、零点分段和实数绝对值的几何意义等方法来去掉绝对值符号：   
        - $|f(x)|<g(x) \iff -g(x) < f(x) < g(x)$.   
        - $|f(x)|>g(x) \iff f(x) > g(x) \mid \mid f(x) < -g(x)$.   
        - $|f(x)|>|g(x)| \iff |f(x)|^2 < |g(x)|^2 $.    
        - 含有多个绝对值符号的不等式可用“按零点分区间讨论”的方法来解。   
4. 不等式组的解法    
分别求出每个不等式的解集，然后求交集，即为不等式组的解集。

