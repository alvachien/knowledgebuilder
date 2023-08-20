## 第一节 集合

### 一、集合与元素概念

1. **集合**    
把一些能够确定的、不同的对象汇集在一起，就说由这些对象组成一个集合，通常用英文大写字母 $ A, B, C, $ ...表示。    


2. **元素**    
组成集合的每个对象都是这个集合的元素。   

    - 集合的元素的特点，即确定性、互异性、无序性   
    **确定性**：集合的元素必须是确定的；    
    **互异性**：对于一个给定的集合，集合中的元素一定是不同的；  
    **无序性**：集合中的元素可以任意排序，如 `{a, b, c}`与`{b, a, c}`是同一个集合。
    - 集合中元素的属性：集合的唯一要素是元素。元素的形式是各种各样的，譬如：数字，字母，方程，图形甚至是**集合**等。   
    

3. 元素与集合的关系   
元素与集合之间只有**属于**（$ \in $）和**不属于**（$ \notin $）的关系，没有**等于** ( $ ＝ $ ）和**不等于**（ $ \not = $ ）的关系。

4. 集合的分类   
集合可以根据它含有的元素个数分为两类：**有限集**，**无限集**。前者表示集合含有有限的元素，后者表示集合含有无限个元素。

5. 几种常见的集合    
    - 不含任何元素的集合称为**空集**，记作$ \varnothing $。记得区分 $ \varnothing $ 和 $ \lbrace \varnothing \rbrace $，后者中有1个元素，该元素为空集。空集在实际问题中是存在的。譬如无解方程的解就是空集。
    - 所有**非负整数**组成的集合，称为**自然数集**，记作 $\N$。
    - 在自然数集`N`中，去掉元素`0`之后的集合，称为**正整数集**，记作 $N_+$ 或 $N^*$。
    - 所有**整数**组成的集合，称为**整数集**，记作 $\Z$。
    - 所有**有理数**组成的集合，称为**有理数集**，记作 $Q$。
    - 所有**实数**组成的集合，称为**实数集**，记作 $\R$。    


6. 集合的表示   

    - **列举法**。将集合中的元素一一列举出来。   
    - **描述法**。用集合所含元素的共同特征表示集合的方法。   
    - **图示法**。数学中，常用平面上一条封闭曲线的内部表示集合，这种图称为维恩图。    

7. 区间及其表示
    - 如果 $a < b$，则集合 $ \lbrace x | a \leqslant x \leqslant b \rbrace $，可以简写为 `[a, b]`，称为**闭区间**。
    - 如果 $a < b$，则集合 $ \lbrace x | a < x < b \rbrace $，可以简写为 `(a, b)`，称为**开区间**。
    - 如果 $a < b$，则集合 $ \lbrace x | a \leqslant x < b \rbrace $ 可简写为 `[a, b)`，集合 $ \lbrace x | a < x \leqslant b \rbrace $ 可简写为 `(a, b]`，并都称为**半开半闭区间**。
    - 如果用 $+\infin$ 表示“正无穷大”，用 $-\infin$ 表示“负无穷大”，则实数集 $R$ 可以表示为区间 $( -\infin, +\infin)$。
    - 另外几种常用的区间：   
        - 集合 $\lbrace x | x \geqslant a \rbrace$ 可以表示区间 $[a, +\infin)$   
        - 集合 $\lbrace x | x > a \rbrace$ 可以表示区间 $(a, +\infin)$   
        - 集合 $\lbrace x | x \leqslant a \rbrace$ 可以表示区间 $(-\infin, a]$   
        - 集合 $\lbrace x | x < a \rbrace$ 可以表示区间 $(-\infin, a)$   


### 二、集合与集合的关系   

1. **包含关系**    
    - **子集**。如果集合`A`的任意一个元素都是集合`B`的元素，那么集合`A`称为集合`B`的子集，记作 $A \sube B $(或者 $B \supe A$)，读作“A包含于B”（或“B包含A”）。
        - 任何集合都是其自身的子集，即 $ A \sube A $；
        - 空集是任意集合的子集。即 $ \varnothing \sube A $ 。
    - **真子集**。如果集合`A`是集合`B`的子集，并且`B`中至少有一个元素不属于`A`，那么集合`A`称为集合`B`的真子集。记作$ A \subsetneqq B $ （或 $ B \supsetneqq A $），读作“A真包含于B”（或“B真包含于A”）。
        - 空集是任意**非空**集合的真子集。

2. **相等关系**   
对于集合`A`，`B`，如果 $ A \sube B$ 且 $ B \sube A $， 那么 $A = B$，即集合`A`和集合`B`相等（`A`，`B`中所有元素均相同）。

3. **运算关系**    
    - **交集**。一般地，给定两个集合`A`, `B`，由既属于`A`又属于`B`的所有元素（即`A`和`B`的公共元素）组成的集合，称为`A`与`B`的交集，记作 $A \cap B$，读作“`A`交`B`”。即 $A \cap B = \lbrace x | x ∈ A 且 x ∈ B \rbrace$。   
    - **并集**。一般地，给定两个集合`A`, `B`，由两个集合的所有元素组成的集合，称为`A`与`B`的并集，记作 $A \cup B$，读作“`A`并`B`”。即 $A \cup B = \lbrace x | x ∈ A或 x ∈ B \rbrace$。   
    - **全集**。如果所要研究的集合都是某个给定集合的子集，那么这个给定的集合为全集，全集通常用`U`表示。       
    - **补集**。如果集合`A`是全集`U`的一个子集，则由`U`中不属于`A`的所有元素组成的集合，称为`A`在`U`中的补集，记作$ \complement_u A$ ，读作“`A`在`U`中的补集”。即 $ \complement_uA = \lbrace x | x ∈ U, x \notin A \rbrace$。    
        - 如把实数集 $\R$ 看做全集`U`，那么有理数集 $Q$的补集 $\complement_uQ$就是全体无理数的集合。

4. **逻辑关系**    
    - **交、并集运算性质**     
    对于任意两个集合`A`、`B`都有：    
        - 交集运算性质   
        $A \cap B = B \cap A \sube A$   
        $A \cap U = A$     
        $A \cap A = A$    
        $A \cap \varnothing = \varnothing \cap A = \varnothing $    

        - 并集运算性质    
        $A \cup B = B \cup A \supe A$   
        $A \cup U = U$     
        $A \cup A = A$    
        $A \cup \varnothing = \varnothing \cup A = A $    


    - **补集的运算性质**     
    给定全集`U`及其任意一个子集`A`， 有：   
    $\complement_u(\complement_uA)=A$    
    $\complement_u\varnothing=U$      
    $\complement_uU=\varnothing$      
    $A \cap \complement_uA=\varnothing$      
    $A \cup \complement_uA=U$      

    - **分配律、结合律、传递性**     
    **分配律**：    
    $A \cap ( B \cup C)=(A\cap B) \cup (A \cap C)$    
    $A \cup ( B \cap C)=(A\cup B) \cap (A \cup C)$    
    **结合律**：   
    $A \cup (B \cup C)=(A \cup B) \cup C$     
    $A \cap (B \cap C)=(A \cap B) \cap C$     
    **传递性**：    
    $A \sube B, B \sube C \Rightarrow A \sube C $    
    $A \subsetneqq B, B \subsetneqq C \Rightarrow A \subsetneqq C $     

    - **反演律（摩根法则）**    
    $\complement_u(A \cap B) = \complement_uA \cup \complement_uB$     
    $\complement_u(A \cup B) = \complement_uA \cap \complement_uB$     


5. **表示交、并、补关系常见的几种维恩图**      

TBD.

### 三、有限集的子集及元素个数公式   

1. 有限集的子集    
设有限集合`A`中有`n`个元素，则`A`的子集有$2^n$个，其中，真子集个数和非空子集个数都是$2^n-1$个，非空真子集的个数为($2^n-2$)个。    

2. 元素个数公式    
有限集`A`所含元素的个数用`card(A)`表示，并规定$card(\varnothing)=0$。`U`为全集，则有如下公式:
    - $card(A) + card(\complement_uA) = card(U)$    
    - $card(A \cup B) = card(A) + card(B) - card(A \cap B)$    
    - $card(A \cap B) = card(A) - card(A \cap \complement_uB) = card(B) - card(B \cap \complement_uA)$

## 第二节 常用逻辑用语    

### 一、命题与量词    
1. **命题**    
可供真假判断的陈述语句就是**命题**。判断为真的语句称为**真命题**；判断为假的语句称为**假命题**。

2. **量词**    
    - **全称量词**：一般地，“任意”、“所有”、“每一个”在陈述中表示所述事物的全体，称为**全称量词**，用符号 $\forall$ 表示。    
    - **全称量词命题**：含有全称量词的命题，称为**全称量词命题**。全称量词命题就是形如“对集合M的所有元素`x`， `r(x)`”的命题，可以简记为：$\forall A \in M, r(x)$；
    - **存在量词**：“存在”、“有”、“至少有一个”在陈述中表达所述事物的个体或部分，称为**存在量词**，用符号 $\exists$ 表示。    
    - **存在量词命题**：含有存在量词的命题，称为**存在量词命题**。存在量词命题就是形如“存在集合`M`中的元素`x`，`s(x)`”的命题，可以简记为： $\exists x \in M, s(x) $.


### 二、全称量词命题与存在量词的否定     

一般地，对命题`p`加以**否定**，就得到一个新的命题，记作 $\neg p$，读作“非`p`”或“`p`的否定”。   

|命题|命题的否定|
|:---|---:|
|$\forall x \in M, p(x)$.|$\exists x \in M, \neg p(x)$.|
|$\exists x \in M, p(x)$.|$ \forall x \in M, \neg p(x)$.|


### 三、充分条件、必要条件、充要条件   

设与`p`对应的集合为 $A=\lbrace x | p(x) \rbrace$， 与`q` 对应的集合为 $B=\lbrace x | q(x) \rbrace$，则有如下结论：   

|定义|从集合观点看|
|:---|:---|
|当$p \Rightarrow q$，称`p`是`q`的**充分条件**。|若集合$A \sube B$，则`p`是`q`的**充分条件**|
|当$q \Rightarrow p$，称`p`是`q`的**必要条件**。|若集合$B \sube A$，则`p`是`q`的**必要条件**|
|如果$p \Rightarrow q$且$q \nRightarrow p$，称`p`是`q`的**充分不必要条件**。|若集合$A \subsetneq B$，则`p`是`q`的**充分不必要条件**|
|如果$p \nRightarrow q$且$q \Rightarrow p$，称`p`是`q`的**必要不充分条件**。|若集合$A \supsetneq B$，则`p`是`q`的**必要不充分条件**|
|如果$p \Rightarrow q$且$q \Rightarrow p$，称`p`是`q`的**充分必要条件**（简称**充要条件**）。|若集合$A = B$，则`p`是`q`的**充分必要条件**|
|如果$p \nRightarrow q$且$q \nRightarrow p$，称`p`是`q`的**非充分非必要条件**。|若集合$A \subsetneq B$且$B \subsetneq A$，则`p`是`q`的**非充分非必要条件**|
