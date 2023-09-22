## 第一节 任意角的概念与弧度制    

### 一、角的概念

角可以看成平面内一条射线绕其端点从一个位置旋转到另一个位置所成的图形，旋转开始的射线称为角的始边，旋转终止时的射线称为角的终边，射线的端点称为角的顶点。

### 二、角的分类

角可以分为正角、负角、零角。角的旋转方向是角分类的标准。    

### 三、象限角与轴线角    
1. 象限角：角的顶点与坐标原点重合，角的始边落在*x*轴的正半轴上，角的终边在第几象限，就把这个角称为第几象限角（或说这个角属于第几象限）；     
2. 轴线角：若角的终边在坐标轴上，就说这个角是轴线角（或象限届角）。     
3. 象限角与轴线角的表示     
    - 象限角表示    
        - 第一象限角：$k \cdot 360 \degree \lt \alpha \lt k \cdot 360 \degree + 90 \degree (k \in \Z)$.        
        - 第二象限角：$k \cdot 360 \degree + 90 \degree \lt \alpha \lt k \cdot 360 \degree + 180 \degree (k \in \Z)$.        
        - 第一象限角：$k \cdot 360 \degree + 180 \degree \lt \alpha \lt k \cdot 360 \degree + 270 \degree (k \in \Z)$.        
        - 第一象限角：$k \cdot 360 \degree + 270 \degree \lt \alpha \lt k \cdot 360 \degree + 360 \degree (k \in \Z)$.        
    - 轴线角表示      
        *x*轴正半轴：$a=k \cdot 360 \degree \space (k \in \Z)$.        
        *x*轴负半轴：$a=k \cdot 360 \degree + 180 \degree \space (k \in \Z)$.        
        *y*轴正半轴：$a=k \cdot 360 \degree + 90 \degree \space (k \in \Z)$.        
        *y*轴负半轴：$a=k \cdot 360 \degree + 270 \degree \space (k \in \Z)$.        
        *x*轴：$a=k \cdot 180 \degree \space  (k \in \Z)$.        
        *y*轴：$a=k \cdot 180 \degree + 90 \degree \space  (k \in \Z)$.        
        坐标轴：$a=k \cdot 90 \degree \space  (k \in \Z)$.        


### 四、终边相同的角

所有与$\alpha$终边相同的角组成一个集合，这个集合可记为$\{\beta | \beta = k \cdot 360 \degree + \alpha, k \in \Z\}$.     

必须明确：判断时，角的形式应该与集合中所述形式相同，即：(1)*k*是整数；(2)$\alpha$是任意角；(3)$k \cdot 360 \degree$与$\alpha$自己以**＋**链接。如：$1410 \degree=4 \times 360 \degree +(-30 \degree)$，即$1410 \degree, -30 \degree$的终边相同；(4)相等的角终边一定相同，终边相同而角不一定相等；(5)终边相同的角有无穷多个，它们相差$360 \degree$的整数倍；(6)终边与$\alpha$的终边共线的角$\beta$满足$\{\beta | \beta = \alpha + k \cdot 180 \degree, k \in \Z \}$；终边与$\alpha$的终边垂直的角$\beta$满足$\{\beta | \beta = \alpha + 90 \degree + k \cdot 180 \degree, \space  k \in \Z \}$。     


### 五、角度制与弧度制

1. 角度制。使用角度来度量角时，将圆周等分为360份，其中每一份说对应的圆心角为1度，这种用度来衡量角的刻度称为角度制。       

2. 弧度制。长度等于半径长的圆弧所对应的圆心角为1弧度的角，记作1 rad。这种以弧度为单位来度量角的制度称为弧度制。     

3. 弧度的计算：任一已知角$\alpha$的弧度的绝对值：$\alpha=\cfrac{l}{r}$, 其中，*l*是以角$\alpha$作为圆心角时所对圆弧的长，*r*为圆的半径。      

4. 弧度制与角度制的换算。     
$360\degree = 2 \pi \space rad. \iff \pi \space rad = 180 \degree$.      
$1 \degree = \cfrac{\pi}{180} \space rad \approx 0.017 45\space rad \iff 1 \space rad=(\cfrac{180}{\pi})\degree \approx 57 \degree 18'$.      

5. 特殊角的度数与弧度数的对应表     

    度|$0 \degree$|$30 \degree$|$45 \degree$|$60 \degree$|$90 \degree$|$120 \degree$|$135 \degree$|$150 \degree$|$180 \degree$|$270 \degree$|$360 \degree$   
    --|--|--|--|--|--|--|--|--|--|--|--
    弧度|0|$\cfrac{\pi}{6}$|$\cfrac{\pi}{4}$|$\cfrac{\pi}{3}$|$\cfrac{\pi}{2}$|$\cfrac{2}{3}\pi$|$\cfrac{3}{4}\pi$|$\cfrac{5}{6}\pi$|$\pi$|$\cfrac{3}{2}\pi$|$2\pi$

6. 弧长公式、扇形面积公式      
设扇形的半径为*r*，弧长为*l*，$\alpha, n \degree$是其圆心角的大小，则弧长公式及扇形面积如下：         

    类别|角度制|弧度制    
    --|--|--    
    弧长|$l=\cfrac{\mid n \mid \pi r}{180}$|$l=\mid \alpha \mid r$       
    扇形面积|$S=\cfrac{\mid n \mid \pi r^2}{360}$|$S=\cfrac{1}{2}lr=\cfrac{1}{2}\mid \alpha \mid r^2 $       

注意：    
- 用弧度表示角的大小时，“弧度”两个字可以不写；    
- 用角度表示角的大小时，角度标志不可以不写。     



## 第二节、任意角的三角函数

### 一、任意角的三角函数    

1. 任意角的三角函数的定义    
对于任意角$\alpha$来说，设$P(x, y)$是$\alpha$终边上异于原点的任意一点，它与原点的距离是*r (r > 0)*，那么角$\alpha$的正弦、余弦、正切分别是$\sin \alpha = \cfrac{y}{r}, \space \cos \alpha = \cfrac{x}{r}, \space \tan \alpha = \cfrac{y}{x} \space (x \not = 0)$.

正弦、余弦、正切都是以角为自变量，以比值为函数值的函数，这三个函数统称为三角函数。     

在三角函数中，角和三角函数值的对应关系是多值对应。给定一个角，它的三角函数值唯一确定。反过来，给定一个三角函数值，有无穷多个角与之对应。      
$\cfrac{y}{r}, \cfrac{x}{r}, \cfrac{y}{x}$的大小，与点*P*在角$\alpha$的终边上的位置无关，只与角的大小有关。


2. 三角函数线    
设角$\alpha$的终边与单位圆交于点*P*，过点*P*做*x*轴的垂线，垂足为*M*，过点*A(1, 0)*作为单位圆的切线，设它与$\alpha$的终边（当$\alpha$为第一、第四象限角时）或其反向延长线（当$\alpha$为第二、第三象限角时），相交于点*T*。

TBD.    

我们把与单位圆有关的*MP*, *OM*, *AT*分别称为角$\alpha$的正弦线、余弦线、正切线，统称为三角函数线。     

当$\alpha$的终边与*x*轴重合时，正弦线、正切线分别变成一个点，此时角$\alpha$的正弦值和正切值都为0。当$\alpha$的终边与*y*轴重合时，余弦变成一个点，正切线不存在，此时角$\alpha$的正切值不存在。     

3. 三角函数的定义域    

三角函数|正弦函数|余弦函数|正切函数   
--|--|--|--    
表达式|$y=\sin x$|$y=\cos x$|$y=\tan x$
定义域|$\R$|$\R$|$\{x \mid x \not = k \pi + \frac{\pi}{2}, \space k \in \Z \}$

4. 三角函数值的符号    

各三角函数值在各个象限的符号。    
TBD.

5. 几个常用特殊角的三角函数值   

函数值|正弦值|余弦值|正切值     
--|--|--|--
0|0|1|0
$\cfrac{\pi}{6}$|$\cfrac{1}{2}$|$\cfrac{\sqrt{3}}{2}$|$\cfrac{\sqrt{3}}{3}$
$\cfrac{\pi}{4}$|$\cfrac{\sqrt{2}}{2}$|$\cfrac{\sqrt{2}}{2}$|$1$
$\cfrac{\pi}{3}$|$\cfrac{\sqrt{3}}{2}$|$\cfrac{1}{2}$|$\sqrt{3}$
$\cfrac{\pi}{2}$|1|0|-
$\cfrac{2}{3}\pi$|$\cfrac{\sqrt{3}}{2}$|$-\cfrac{1}{2}$|$-\sqrt{3}$
$\cfrac{3}{4}\pi$|$\cfrac{\sqrt{2}}{2}$|$-\cfrac{\sqrt{2}}{2}$|$-1$
$\cfrac{5}{6}\pi$|$\cfrac{1}{2}$|$-\cfrac{\sqrt{3}}{2}$|$-\cfrac{\sqrt{3}}{3}$
$\pi$|$0$|$-1$|$0$


### 二、同角三角函数基本关系式及诱导公式    

1. 同角三角函数的基本关系式       
商数关系：$\tan \alpha = \cfrac{\sin \alpha}{\cos \alpha}$.       
平方关系：$\sin^2\alpha + \cos^2 \alpha = 1$.                

2. 同角三角函数基本关系式的应用      
    - 已知某个角的一个三角函数值，求它的其余各三角函数值；      
    - 化简三角函数式；     
    - 证明三角恒等式；      
    - 解三角方程       

3. 诱导公式       
    - 常用的诱导公式：      
    公式一：$\sin(\alpha + k \cdot 2 \pi)=\sin \alpha, \cos(\alpha + k \cdot 2 \pi)=\cos \alpha, \tan(\alpha + k \cdot 2 \pi)=\tan \alpha$.     
    公式二：$\sin(- \alpha)=-\sin \alpha, \cos(- \alpha)=\cos \alpha, \tan(- \alpha)=-\tan \alpha$.       
    公式三：$\sin(\pi - \alpha)=\sin \alpha, \cos(\pi - \alpha)=-\cos \alpha, \tan(\pi - \alpha)=\tan \alpha$.       
    公式四：$\sin(\pi + \alpha)=-\sin \alpha, \cos(\pi + \alpha)=-\cos \alpha, \tan(\pi + \alpha)=\tan \alpha$.      
    公式五：$\sin(\cfrac{\pi}{2} - \alpha)=\cos \alpha, \cos(\cfrac{\pi}{2} - \alpha)=\sin \alpha$.      
    公式六：$\sin(\cfrac{\pi}{2} + \alpha)=\cos \alpha, \cos(\cfrac{\pi}{2} + \alpha)=-\sin \alpha$.      
    公式七：$\sin(\cfrac{3\pi}{2} + \alpha)=-\cos \alpha, \cos(\cfrac{3\pi}{2} + \alpha)=\sin \alpha$.      
    公式八：$\sin(\cfrac{3\pi}{2} - \alpha)=-\cos \alpha, \cos(\cfrac{3\pi}{2} - \alpha)=-\sin \alpha$.      



    - 诱导公式巧记        
    记忆口诀是：奇变偶不变，符号看象限。诱导公式可概括为$k \cdot \cfrac{\pi}{2} \pm \alpha \space (k \in \Z) $的各个三角函数值，如$2\pi - \alpha = 4 \cdot \cfrac{\pi}{2} - \alpha, \space \cfrac{3}{2}\pi + \alpha = 3 \cdot \cfrac{\pi}{2} + \alpha$，当$k$为偶数时，得角$\alpha$的同名函数值；当$k$为奇数时，得角$\alpha$相应的余名函数值，然后前面加上把$\alpha$看成锐角时原函数值的符号，如$\sin(2\pi - \pi)=\sin(4 \cdot \cfrac{\pi}{2} - \alpha), k = 4$为偶数，故取$\sin \alpha$。    
    TBD.


## 第三节 三角函数的性质与图案      

### 一、三角函数的图像与性质    

1. “五点法”画三角函数的图像      
在作正弦曲线和余弦曲线有五个点在固定图像形状时，起着关键作用。    

2. 三角函数的图像与性质      

函数|$y=\sin x$|$y=\cos x$|$y=\tan x$    
--|--|--|--    
定义域|$\R$|$\R$|$\set{x \mid x \not = k \pi + \frac{\pi}{2}, k \in \Z }$ 
在一个周期的图像|TBD|TBD|TBD
值域|[-1, 1]|[-1, 1]|R
奇偶性|奇|偶|奇
单调性|TBD|TBD|TBD
最值|TBD|TBD|TBD
对称性|TBD|TBD|TBD
最小正周期|$2\pi$|$2\pi$|$\pi$



### 二、函数$y=A \sin(\omega x + \varphi)$的图像与性质

1. 函数$y=A \sin(\omega x + \varphi) \space (A > 0)$的图像的画法
    - 五点法     
    - 变换法       
    三角函数图像常见的几种变化：    
    - 振幅变换     
    - 周期变换       
    - 相位变换        
    - 平移变换       
    - 对称变换        

2. 函数$y=A \sin(\omega x + \varphi) \space (A > 0)$的性质

由函数$y=A \sin(\omega x + \varphi) \space (A > 0)$的图像，可以得到函数的性质：    
- 定义域    
- 值域      
- 最小正周期       
- 单调性    
- 奇偶性       
- 对称性      

