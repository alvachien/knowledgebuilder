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

2. 三角函数线    


### 二、同角三角函数基本关系式及诱导公式    


