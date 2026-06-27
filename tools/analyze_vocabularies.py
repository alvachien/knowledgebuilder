"""
Analyze English listening JSON files and extract vocabulary content.
Outputs vocabulary to a JSON file in the format:
{
    "enword": "word",
    "cnword": "n. 单词"
}
"""

import json
import sys
from pathlib import Path
from typing import List, Dict


def get_word_translation(word: str) -> str:
    """Get Chinese translation for an English word."""
    # Common word translations dictionary
    translations = {
        "chemist": "n. 药剂师；化学家", "journalist": "n. 记者", "exactly": "adv. 精确地",
        "agency": "n. 代理机构", "quality": "n. 质量", "responsibility": "n. 责任",
        "catalogue": "n. 目录", "interview": "n./v. 面试", "fantastic": "adj. 极好的",
        "management": "n. 管理", "definitely": "adv. 肯定地", "trainee": "n. 实习生",
        "dime": "n. 一角硬币", "nickel": "n. 五分硬币", "quarter": "n. 四分之一",
        "penny": "n. 便士", "conference": "n. 会议", "break": "n./v. 休息",
        "coin": "n. 硬币", "pence": "n. 便士(复数)", "film": "n. 电影",
        "exposure": "n. 曝光", "aspirin": "n. 阿司匹林", "local": "adj. 当地的",
        "halfpenny": "n. 半便士", "tube": "n. 管子；地铁", "cab": "n. 出租车",
        "accountant": "n. 会计师", "lemonade": "n. 柠檬水", "rubbish": "n. 垃圾",
        "allowance": "n. 津贴", "machinery": "n. 机械", "temporary": "adj. 临时的",
        "atomic": "adj. 原子的", "crash": "n./v. 碰撞", "landlord": "n. 房东",
        "humor": "n. 幽默", "waistcoat": "n. 马甲", "sense": "n. 感觉",
        "bar": "n. 酒吧", "pigeon": "n. 鸽子", "chain": "n. 链条",
        "upset": "adj./v. 心烦的", "spill": "v. 溢出", "heaven": "n. 天堂",
        "launderette": "n. 自助洗衣店", "memory": "n. 记忆", "polish": "v./n. 擦亮",
        "international": "adj. 国际的", "chocolate": "n. 巧克力", "biscuit": "n. 饼干",
        "overall": "adj./n. 全面的", "spoil": "v. 宠坏", "washbasin": "n. 洗脸盆",
        "bake": "v. 烘焙", "typewriter": "n. 打字机", "estimate": "v./n. 估计",
        "model": "n. 模型", "assistant": "n. 助手", "parcel": "n. 包裹",
        "customer": "n. 顾客", "cycle": "n./v. 循环", "congratulation": "n. 祝贺",
        "librarian": "n. 图书管理员", "rare": "adj. 稀有的", "gown": "n. 长袍",
        "drawer": "n. 抽屉", "fancy": "adj./v. 花哨的", "pound": "n. 英镑",
        "shampoo": "n./v. 洗发水", "pack": "n./v. 包装", "reserve": "v./n. 预订",
        "intend": "v. 打算", "engage": "v. 从事", "photograph": "n./v. 照片",
        "cream": "n. 奶油", "sour": "adj. 酸的", "cardigan": "n. 开襟羊毛衫",
        "inch": "n. 英寸", "curtain": "n. 窗帘", "dependable": "adj. 可靠的",
        "petrol": "n. 汽油", "newsagent": "n. 报刊经销商", "milkman": "n. 送奶工",
        "dustman": "n. 清洁工", "extremely": "adv. 极其", "picnic": "n./v. 野餐",
        "weed": "n./v. 杂草", "injure": "v. 伤害", "paint": "n./v. 油漆",
        "ankle": "n. 脚踝", "roast": "v./adj. 烤", "tray": "n. 托盘",
        "briefcase": "n. 公文包", "plastic": "n./adj. 塑料", "lighter": "n. 打火机",
        "depend": "v. 依靠", "delicious": "adj. 美味的", "awful": "adj. 糟糕的",
        "duster": "n. 抹布", "racket": "n. 球拍", "chest": "n. 胸部",
        "wrist": "n. 手腕", "millionaire": "n. 百万富翁", "nylon": "n. 尼龙",
        "volleyball": "n. 排球", "supervisor": "n. 主管", "label": "n./v. 标签",
        "persuade": "v. 说服", "confusing": "adj. 令人困惑的", "packet": "n. 小包",
        "jar": "n. 罐子", "overtime": "n./adv. 加班", "mess": "n. 混乱",
        "instant": "adj./n. 立即的", "reception": "n. 接待处", "pineapple": "n. 菠萝",
        "shark": "n. 鲨鱼", "desk": "n. 书桌", "grapefruit": "n. 葡萄柚",
        "menu": "n. 菜单", "tap": "n./v. 水龙头", "shore": "n. 海岸",
        "panel": "n. 面板", "absolutely": "adv. 绝对地", "extra": "adj./n. 额外的",
        "withdraw": "v. 撤回", "deposit": "n./v. 存款", "tender": "adj. 温柔的",
        "peculiar": "adj. 奇特的", "account": "n. 账户", "sponge": "n. 海绵",
        "flavor": "n. 味道", "sign": "n./v. 标志", "apologize": "v. 道歉",
        "dial": "v./n. 拨号", "chord": "n. 和弦", "nowadays": "adv. 如今",
        "certificate": "n. 证书", "classical": "adj. 古典的", "decent": "adj. 体面的",
        "squash": "n./v. 壁球", "guitar": "n. 吉他", "whistle": "n./v. 口哨",
        "strap": "n. 带子", "essay": "n. 文章", "lipstick": "n. 口红",
        "rucksack": "n. 背包", "personally": "adv. 亲自地", "character": "n. 性格",
        "practically": "adv. 实际上", "design": "n./v. 设计", "pot": "n. 锅",
        "commuter": "n. 通勤者", "suspicious": "adj. 可疑的", "rail": "n. 铁轨",
        "approach": "v./n. 接近", "percent": "n. 百分比", "mood": "n. 心情",
        "transport": "n./v. 运输", "exchange": "n./v. 交换", "remainder": "n. 剩余部分",
        "accidentally": "adv. 意外地", "private": "adj. 私人的", "fault": "n. 错误",
        "motorbike": "n. 摩托车", "seaside": "n. 海边", "cancel": "v. 取消",
        "salad": "n. 沙拉", "tonic": "n. 补品", "ham": "n. 火腿",
        "tasteless": "adj. 无味的", "disgrace": "n./v. 耻辱", "beef": "n. 牛肉",
        "olive": "n. 橄榄", "roll": "n./v. 卷", "gin": "n. 杜松子酒",
        "experience": "n./v. 经验", "slim": "adj. 苗条的", "inspire": "v. 激励",
        "plump": "adj. 丰满的", "documentary": "n. 纪录片", "medium": "adj./n. 中等的",
        "experiment": "n./v. 实验", "fridge": "n. 冰箱", "obviously": "adv. 显然地",
        "afford": "v. 负担得起", "concentrate": "v. 集中", "partner": "n. 伙伴",
        "hardware": "n. 硬件", "economy": "n. 经济", "portion": "n. 部分",
        "normally": "adv. 通常", "coach": "n. 教练", "strawberry": "n. 草莓",
        "departure": "n. 离开", "tempt": "v. 诱惑", "tart": "n. 馅饼",
        "steak": "n. 牛排", "milky": "adj. 乳白色的", "deliver": "v. 递送",
        "sauce": "n. 酱汁", "bean": "n. 豆子", "stock": "n. 库存",
        "contain": "v. 包含", "diet": "n. 饮食", "spaghetti": "n. 意大利面",
        "tinned": "adj. 罐装的", "tempting": "adj. 诱人的", "laundry": "n. 洗衣店",
        "reference": "n. 参考", "curry": "n. 咖喱", "cancellation": "n. 取消",
        "mushroom": "n. 蘑菇", "lager": "n. 淡啤酒", "prawn": "n. 对虾",
        "sherry": "n. 雪利酒", "rack": "n. 架子", "conductress": "n. 女售票员",
        "lamb": "n. 羊肉", "misery": "n. 痛苦", "interrupt": "v. 打断",
        "postage": "n. 邮资", "shame": "n. 羞耻", "iron": "n./v. 铁",
        "shivery": "adj. 发抖的", "homesick": "adj. 想家的", "stomach": "n. 胃",
        "bound": "adj. 一定的", "chill": "n./v. 寒冷", "legal": "adj. 法律的",
        "slightly": "adv. 稍微", "feverish": "adj. 发烧的", "solicitor": "n. 律师",
        "freezing": "adj. 冰冻的", "style": "n. 风格", "goodness": "n. 善良",
        "splendid": "adj. 极好的", "performance": "n. 表演", "property": "n. 财产",
        "primary": "adj. 主要的", "secondary": "adj. 次要的", "budget": "n./v. 预算",
        "relate": "v. 联系", "footpath": "n. 人行道", "coast": "n. 海岸",
        "research": "n./v. 研究", "qualify": "v. 使合格", "comprehensive": "adj. 综合的",
        "scare": "v./n. 惊吓", "connect": "v. 连接", "fence": "n. 栅栏",
        "jog": "v./n. 慢跑", "sheepdog": "n. 牧羊犬", "infect": "v. 感染",
        "engineer": "n. 工程师", "auntie": "n. 阿姨", "economic": "adj. 经济的",
        "assembly": "n. 集会", "beard": "n. 胡须", "guide": "n./v. 导游",
        "appointment": "n. 约会", "empire": "n. 帝国", "corridor": "n. 走廊",
        "entertainment": "n. 娱乐", "gracious": "adj. 亲切的", "passenger": "n. 乘客",
        "due": "adj. 到期的", "drift": "v./n. 漂流", "traffic": "n. 交通",
        "properly": "adv. 适当地", "alarm": "n./v. 警报", "scenery": "n. 风景",
        "kettle": "n. 水壶", "paraffin": "n. 石蜡", "pension": "n. 养老金",
        "stew": "n./v. 炖菜", "religious": "adj. 宗教的", "immigrant": "n. 移民",
        "requirement": "n. 要求", "company": "n. 公司", "lovable": "adj. 可爱的",
        "romantic": "adj. 浪漫的", "mysterious": "adj. 神秘的", "generous": "adj. 慷慨的",
        "tranquil": "adj. 平静的", "violet": "n./adj. 紫罗兰", "feminine": "adj. 女性的",
        "pink": "adj./n. 粉红色的", "royal": "adj. 皇家的", "organ": "n. 器官",
        "dragon": "n. 龙", "recital": "n. 独奏会", "advertise": "v. 做广告",
        "minor": "adj. 较小的", "annual": "adj. 年度的", "contrary": "adj./n. 相反的",
        "cemetery": "n. 墓地", "presentation": "n. 演示", "accommodation": "n. 住宿",
        "glossy": "adj. 光滑的", "dame": "n. 女士", "vacant": "adj. 空的",
        "dedicate": "v. 奉献", "attic": "n. 阁楼", "profession": "n. 职业",
        "furnish": "v. 布置", "senior": "adj. 高级的", "colleague": "n. 同事",
        "wardrobe": "n. 衣柜", "efficient": "adj. 高效的", "kitchenette": "n. 小厨房",
        "strict": "adj. 严格的", "sink": "n./v. 水槽", "urgent": "adj. 紧急的",
        "sloping": "adj. 倾斜的", "recommendation": "n. 推荐", "perfume": "n. 香水",
        "fur": "n. 毛皮", "tuxedo": "n. 无尾礼服", "luxury": "n. 奢侈",
        "diamond": "n. 钻石", "elegantly": "adv. 优雅地", "assistance": "n. 帮助",
        "resident": "n. 居民", "switchboard": "n. 交换机", "ridiculous": "adj. 荒谬的",
        "hell": "n. 地狱", "route": "n. 路线", "entertain": "v. 娱乐",
        "adjust": "v. 调整", "operator": "n. 操作员", "scrap": "n./v. 碎片",
        "regulator": "n. 调节器", "nevertheless": "adv. 然而", "lavatory": "n. 厕所",
        "delay": "n./v. 延迟", "flush": "v./n. 冲洗", "entrance": "n. 入口",
        "pillow": "n. 枕头", "marvellous": "adj. 极好的", "brochure": "n. 小册子",
        "disappear": "v. 消失", "crown": "n. 王冠", "doorstep": "n. 门阶",
        "association": "n. 协会", "inclusive": "adj. 包含的", "adapt": "v. 适应",
        "equip": "v. 装备", "amaze": "v. 使惊奇", "stimulate": "v. 刺激",
        "opportunity": "n. 机会", "laser": "n. 激光", "reduction": "n. 减少",
        "beam": "n. 光束", "parliament": "n. 议会", "clay": "n. 黏土",
        "wheel": "n. 轮子", "grant": "n./v. 拨款", "pottery": "n. 陶器",
        "craft": "n. 工艺", "council": "n. 委员会", "potter": "n. 陶工",
        "cashier": "n. 收银员", "backstroke": "n. 仰泳", "dessert": "n. 甜点",
        "currency": "n. 货币", "ration": "n./v. 配给", "credit": "n. 信用",
        "spider": "n. 蜘蛛", "annoyed": "adj. 恼怒的", "whisper": "v./n. 低语",
        "champagne": "n. 香槟", "incident": "n. 事件", "liable": "adj. 有责任的",
        "media": "n. 媒体", "sunbathing": "n. 日光浴", "jewellery": "n. 珠宝",
        "clumsy": "adj. 笨拙的", "bemuse": "v. 使困惑", "idiot": "n. 白痴",
        "smuggler": "n. 走私者", "creative": "adj. 创造性的", "relax": "v. 放松",
        "commission": "n. 佣金", "nuisance": "n. 讨厌的人", "multiply": "v. 乘",
        "fraction": "n. 分数", "divide": "v. 分开", "jean": "n. 牛仔裤",
        "application": "n. 申请", "bang": "n./v. 砰", "chip": "n. 芯片",
        "possession": "n. 拥有", "exorbitant": "adj. 过高的", "plead": "v. 恳求",
        "jungle": "n. 丛林", "inefficient": "adj. 效率低的", "colony": "n. 殖民地",
        "premise": "n. 前提", "behavior": "n. 行为", "client": "n. 客户",
        "spectacle": "n. 景象", "prosperous": "adj. 繁荣的", "mortgage": "n. 抵押贷款",
        "teenager": "n. 青少年", "unemployment": "n. 失业", "frustrate": "v. 使沮丧",
        "stroke": "n./v. 中风", "sponsor": "n./v. 赞助商", "code": "n. 代码",
        "nil": "n. 零", "region": "n. 地区", "edge": "n. 边缘",
        "clover": "n. 三叶草", "hysterical": "adj. 歇斯底里的", "tartan": "n. 格子呢",
        "superstition": "n. 迷信", "tweed": "n. 粗花呢", "flatter": "v. 奉承",
        "crowned": "adj. 加冕的", "pavement": "n. 人行道", "brimmed": "adj. 有边的",
        "ambulance": "n. 救护车", "financial": "adj. 财务的", "gallow": "n. 绞刑架",
        "filter": "n./v. 过滤器", "sneeze": "v./n. 打喷嚏", "siesta": "n. 午睡",
        "suntan": "n. 晒黑", "yacht": "n. 游艇", "stretch": "v./n. 伸展",
        "splash": "v./n. 溅", "bay": "n. 海湾", "rehearsal": "n. 排练",
        "prevention": "n. 预防", "technique": "n. 技术", "enthusiasm": "n. 热情",
        "prosecute": "v. 起诉", "insurance": "n. 保险", "shoplifter": "n. 商店扒手",
        "donkey": "n. 驴", "backgammon": "n. 西洋双陆棋", "munch": "v. 大声咀嚼",
        "schedule": "n./v. 时间表", "await": "v. 等待", "divert": "v. 转移",
        "helicopter": "n. 直升机", "sesame": "n. 芝麻", "viewfinder": "n. 取景器",
        "stirfry": "v. 炒", "battered": "adj. 破旧的", "ginger": "n. 姜",
        "compartment": "n. 隔间", "register": "v./n. 登记", "tasty": "adj. 美味的",
        "centimetre": "n. 厘米", "vehicle": "n. 车辆", "spiciness": "n. 辛辣",
        "shred": "v./n. 切碎", "registration": "n. 登记", "sprout": "n./v. 芽",
        "wok": "n. 炒锅", "licence": "n. 执照", "ingredient": "n. 成分",
        "mixture": "n. 混合物", "plate": "n. 盘子", "gram": "n. 克",
        "cartidge": "n. 墨盒", "fragile": "adj. 易碎的", "rheumatism": "n. 风湿病",
        "drastic": "adj. 激烈的", "designer": "n. 设计师", "much": "adv./adj. 很多",
        "raspberry": "n. 覆盆子", "aisle": "n. 过道", "punnet": "n. 小篮子",
        "loganberry": "n. 罗甘莓", "avail": "n./v. 效用", "polling": "n. 投票",
        "campaign": "n./v. 运动", "solitary": "adj. 孤独的", "restriction": "n. 限制",
        "pizza": "n. 披萨", "bloke": "n. 家伙", "bargain": "n./v. 便宜货",
        "widow": "n. 寡妇", "referee": "n. 裁判", "judo": "n. 柔道",
        "probation": "n. 缓刑", "moustache": "n. 胡子", "snatch": "v./n. 抢夺",
        "contact": "n./v. 联系", "unattended": "adj. 无人看管的", "transfer": "n./v. 转移",
        "security": "n. 安全", "roaring": "adj. 咆哮的", "check": "v./n. 检查",
        "abdomen": "n. 腹部", "scream": "v./n. 尖叫", "furry": "adj. 毛茸茸的",
        "riddle": "n. 谜语", "rattle": "v./n. 发出响声", "lining": "n. 衬里",
        "carcinoma": "n. 癌", "conscience": "n. 良心", "administer": "v. 管理",
        "saucer": "n. 茶碟", "severe": "adj. 严重的", "convince": "v. 说服",
        "porcelain": "n. 瓷器", "dosage": "n. 剂量", "injection": "n. 注射",
        "vase": "n. 花瓶", "unsteady": "adj. 不稳定的", "transistor": "n. 晶体管",
        "emigrate": "v. 移居国外", "portable": "adj. 便携的", "cameraman": "n. 摄影师",
        "import": "n./v. 进口", "export": "n./v. 出口", "penalty": "n. 处罚",
        "mini": "adj. 迷你的", "theoretical": "adj. 理论的", "brake": "n./v. 刹车",
        "sequence": "n. 顺序", "cassette": "n. 盒式磁带", "pathetic": "adj. 可怜的",
        "imaginative": "adj. 富有想象力的", "jazz": "n. 爵士乐",
    }
    # Return translation if found, otherwise return empty string for proper nouns/names
    word_lower = word.lower()
    return translations.get(word_lower, "")


def analyze_vocabularies(json_path: str, output_path: str = None) -> List[Dict[str, str]]:
    """
    Read the JSON file and extract all unique vocabulary items.
    
    Args:
        json_path: Path to the input JSON file
        output_path: Path to the output JSON file (optional)
    
    Returns:
        List of vocabulary dictionaries with enword and cnword
    """
    # Read the JSON file
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    input_filename = Path(json_path).name
    print("=" * 60)
    print(f"VOCABULARY ANALYSIS - {input_filename}")
    print("=" * 60)
    
    all_vocabularies: List[str] = []
    
    # Iterate through each lesson
    for lesson in data:
        lesson_title = lesson.get('title', 'Unknown Lesson')
        sections = lesson.get('sections', [])
        
        for section in sections:
            vocabulary = section.get('vocabulary', [])
            if vocabulary:
                all_vocabularies.extend(vocabulary)
    
    # Get unique vocabularies sorted alphabetically
    unique_vocab = sorted(set(all_vocabularies), key=str.lower)
    
    # Summary
    print(f"Total vocabulary items: {len(all_vocabularies)}")
    print(f"Unique vocabulary items: {len(unique_vocab)}")
    
    # Generate vocabulary list with translations
    vocab_list = []
    for word in unique_vocab:
        translation = get_word_translation(word)
        vocab_list.append({"enword": word, "cnword": translation})
    
    # Determine output path
    if output_path is None:
        input_path = Path(json_path)
        output_path = input_path.parent / f"{input_path.stem}_vocabularies.json"
    
    # Write output JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(vocab_list, f, ensure_ascii=False, indent=2)
    
    print(f"\n[OUTPUT] Vocabularies saved to: {output_path}")
    print(f"         Total items: {len(vocab_list)}")
    
    return vocab_list


def main():
    # Default path
    script_dir = Path(__file__).parent
    default_path = script_dir.parent / 'public' / 'data' / 'englishlistening' / 'ltt1.json'
    
    # Get input file path from user or use default
    if len(sys.argv) > 1:
        json_path = sys.argv[1]
    else:
        user_input = input(f"Enter JSON file path (press Enter for default: {default_path}): ").strip()
        json_path = user_input if user_input else str(default_path)
    
    json_path = Path(json_path)
    if not json_path.exists():
        print(f"Error: File not found at {json_path}")
        return
    
    analyze_vocabularies(str(json_path))


if __name__ == '__main__':
    main()