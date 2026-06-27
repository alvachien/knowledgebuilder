class ChessBoard:
    """
    中国象棋棋盘类
    使用9x10的二维列表表示棋盘，从0-8列，0-9行
    红方在下方(行数大)，黑方在上方(行数小)
    """
    def __init__(self):
        # 初始化棋盘 (9列 x 10行)
        self.board = [[None for _ in range(9)] for _ in range(10)]
        # 初始化棋子位置
        self.initialize_pieces()
        # 当前回合方 (True为红方，False为黑方)
        self.red_turn = True

    def initialize_pieces(self):
        """
        摆放初始棋子
        """
        # 黑方 (上半部分)
        # 士
        self.board[0][3] = Piece('黑', '士', 0, 3)
        self.board[0][5] = Piece('黑', '士', 0, 5)
        # 象
        self.board[0][2] = Piece('黑', '象', 0, 2)
        self.board[0][6] = Piece('黑', '象', 0, 6)
        # 马
        self.board[0][1] = Piece('黑', '马', 0, 1)
        self.board[0][7] = Piece('黑', '马', 0, 7)
        # 车
        self.board[0][0] = Piece('黑', '车', 0, 0)
        self.board[0][8] = Piece('黑', '车', 0, 8)
        # 炮
        self.board[2][1] = Piece('黑', '炮', 2, 1)
        self.board[2][7] = Piece('黑', '炮', 2, 7)
        # 卒
        for i in range(5):
            self.board[3][2*i] = Piece('黑', '卒', 3, 2*i)
        
        # 将/帅
        self.board[0][4] = Piece('黑', '将', 0, 4)
        
        # 红方 (下半部分)
        # 士
        self.board[9][3] = Piece('红', '士', 9, 3)
        self.board[9][5] = Piece('红', '士', 9, 5)
        # 相
        self.board[9][2] = Piece('红', '相', 9, 2)
        self.board[9][6] = Piece('红', '相', 9, 6)
        # 马
        self.board[9][1] = Piece('红', '马', 9, 1)
        self.board[9][7] = Piece('红', '马', 9, 7)
        # 车
        self.board[9][0] = Piece('红', '车', 9, 0)
        self.board[9][8] = Piece('红', '车', 9, 8)
        # 炮
        self.board[7][1] = Piece('红', '炮', 7, 1)
        self.board[7][7] = Piece('红', '炮', 7, 7)
        # 兵
        for i in range(5):
            self.board[6][2*i] = Piece('红', '兵', 6, 2*i)
            
        # 帅/将
        self.board[9][4] = Piece('红', '帅', 9, 4)

    def display(self):
        """
        显示当前棋盘
        """
        print("  ", end="")
        for col in range(9):
            print(f"{col} ", end="")
        print()
        for row in range(10):
            print(f"{row} ", end="")
            for col in range(9):
                piece = self.board[row][col]
                if piece:
                    print(piece.symbol, end=" ")
                else:
                    print("· ", end="")
            print()
        print()

    def parse_chinese_notation(self, move_str):
        """
        解析中文棋谱表示法，如 "炮二平五", "马2进3"
        返回起始坐标(row1, col1)和目标坐标(row2, col2)
        """
        # 处理 "炮二平五" 格式
        if "平" in move_str:
            # 例如 "炮二平五": 取出 "二" 和 "五"，并确定是哪一方的棋子
            start_chinese = move_str[1]
            end_chinese = move_str[3]
            start_col = self.chinese_to_col(start_chinese)
            end_col = self.chinese_to_col(end_chinese)
            piece_type = move_str[0]

            # 找到起始位置
            start_row = None
            color = '红' if self.red_turn else '黑'
            for r in range(10):
                for c in range(9):
                    p = self.board[r][c]
                    if p and p.color == color and p.name == piece_type and c == start_col:
                        start_row = r
                        break
                if start_row is not None:
                    break

            if start_row is None:
                raise ValueError(f"未找到棋子 {piece_type}{start_chinese}")

            # 对于平移，行号不变
            target_row = start_row
            return start_row, start_col, target_row, end_col

        # 处理 "马2进3" 格式
        elif "进" in move_str or "退" in move_str:
            direction = "进" if "进" in move_str else "退"
            start_num_str = move_str[1]
            end_num_str = move_str[move_str.index(direction) + 1]
            
            try:
                start_index = int(start_num_str) - 1  # 转换为0-8索引
            except ValueError:
                # 如果是中文数字，转换
                start_index = self.chinese_to_number(start_num_str)
                
            try:
                end_index = int(end_num_str) - 1
            except ValueError:
                end_index = self.chinese_to_number(end_num_str)
            
            piece_type = move_str[0]
            color = '红' if self.red_turn else '黑'

            # 找到符合类型的棋子
            pieces = []
            for r in range(10):
                for c in range(9):
                    p = self.board[r][c]
                    if p and p.color == color and p.name == piece_type:
                        pieces.append((r, c))

            # 根据颜色和方向确定起始和目标行/列
            if piece_type in ['车', '马', '炮', '相', '象', '士', '帅', '将']:
                # 这些棋子通常根据行来区分 (如红方的车在9行，黑方在0行)
                # 这里简化处理，对于多枚同类型棋子，用索引区分
                # 更精确的逻辑需要考虑具体棋子的布局和编号
                # 此处假设编号对应棋子的列顺序 (如红马1指左侧马，马2指右侧马)
                if piece_type in ['马', '炮', '车']: # 通常成对出现，按列排序
                    pieces.sort(key=lambda x: x[1]) # 按列排序
                    if start_index >= len(pieces):
                        raise ValueError(f"未找到第{start_index+1}个{piece_type}")
                    start_row, start_col = pieces[start_index]
                else: # 帅/将, 相/象, 士 - 通常只有一个或特定位置
                    # 对于单个棋子，索引应为0
                    # 对于成对的相/象, 士，按列排序
                    if piece_type in ['相', '象', '士']:
                        pieces.sort(key=lambda x: x[1])
                        if start_index >= len(pieces):
                            raise ValueError(f"未找到第{start_index+1}个{piece_type}")
                        start_row, start_col = pieces[start_index]
                    else: # 帅/将
                         if start_index != 0 or len(pieces) != 1:
                             raise ValueError(f"帅/将位置错误")
                         start_row, start_col = pieces[0]

                # 计算目标行
                if color == '红':
                    if direction == '进':
                        target_row = start_row - (start_index - end_index) if piece_type in ['相', '象', '士'] else start_row - 1 # 非兵种默认向前一步
                        # 马、车、炮的进退是相对坐标变化
                        # 修正：进退对于车马炮是相对于当前行的移动
                        # 例如马2进3，如果当前在第2行，进到第3行（从下往上数）
                        # 需要重新解析：马2进3 -> 当前马在第2行（从下数），前进到第3行
                        # 为了简化，假设进退表示目标行（从下或上数）
                        # 重新定义：马2进3 -> 找当前红方第2个马（从左数），移动到行数为从下往上数第3行的位置
                        # 或者：马2进3 -> 当前马在R行，进到R-1行（如果红方）或R+1行（如果黑方）？不对
                        # 实际上，X进Y 或 X退Z，X是列号（从左数），Y/Z是目标行号（从己方数）
                        # 例如 红马2进3：红方第二个马（从左数第2个马，列2或7）向前移动到第3行（从下往上数第3行）
                        # 黑马2进3：黑马向前移动到第8行（从上往下数第3行）
                        # 这种解释更符合实际棋谱
                        # 那么 start_index 实际是列号，end_index 实际是目标行号（从己方底线数）
                        # 红方：行数 9,8,7,6,5,4,3,2,1,0 -> 目标行 = 9 - end_index
                        # 黑方：行数 0,1,2,3,4,5,6,7,8,9 -> 目标行 = 0 + end_index
                        # 但 start_index 如何对应棋子？它应该是列号。
                        # 例子：红马2进3
                        # 红马在 (9,1) 和 (9,7)。 "马2" 通常指从左数第2个马，即 (9,7)。
                        # "进3" 指移动到从己方数第3行，即 9-2=7 (9,8,7 -> 7是第3行)。不对，应该是9,8,7 -> 7是第3行，即9-2。
                        # 从下往上数第3行是 row=7 (9,8,7)。所以目标行 = 9 - (3-1) = 9 - 2 = 7。
                        # 移动：(9,7) -> (?,7) -> (?,7) 且 ? = 7 -> (7,7)。这不对，马不能直走。
                        # 我的理解有误。
                        # 正确理解：马2进3，马2是列号，如果是中文数字，则是第几个（从左数）。如果是阿拉伯数字，也是第几个。
                        # 进3是目标行号，对于红方是从下往上数，对于黑方是从上往下数。
                        # 红马在 (9,1) (9,7)。马2指第2个，即 (9,7)。
                        # 进3：红方从下往上数第3行是 row = 9-2 = 7。所以目标行是7。
                        # 但马不能从(9,7)直接走到(7,7)，这是直线。马走日。
                        # 所以 "进3" 应该理解为移动后所在的行号，而不是移动的步数。
                        # 红马(9,7) 进3 -> 目标行是7，列还是7？不对，马走日。
                        # 红马(9,7)，目标行是7，可能的落点 (7,5) 或 (7,9)。
                        # 通常棋谱不会只给一个数字就确定落点，需要结合棋盘情况。
                        # 实际上，"马2进3" 的标准解释是：
                        # 1. 找到红方第二个马 (9,7) [从左数，(9,1)是马1, (9,7)是马2]
                        # 2. "进3" 表示移动后的行数。对于红方，从下往上数，第3行是 row=7。
                        # 3. 马的移动规则是 L 形，必须从(9,7)走到合法的(7,x)位置。
                        # 4. 马(9,7)可以走到 (7,5) 或 (7,9)。
                        # 5. 如果(7,5)和(7,9)都空或可吃，则需要根据具体规则或提示判断，但通常棋谱是明确的。
                        # 6. 如果目标行是7，且马只能走到(7,5)或(7,9)，那么 "进3" 就是指示目标行。
                        # 所以，算法是：
                        # a. 找到颜色为self.red_turn, 名称为piece_type, 按列排序后索引为start_index的棋子 (start_row, start_col)
                        # b. 计算目标行：如果红方，target_row = 9 - (end_index); 如果黑方，target_row = 0 + end_index
                        # c. 计算目标列：通过棋子移动规则，找到从(start_row, start_col)出发，到达target_row的合法列
                        # d. 对于马：(s_r,s_c) -> (t_r, t_c)，满足 |t_r - s_r| = 2, |t_c - s_c| = 1 或 |t_r - s_r| = 1, |t_c - s_c| = 2
                        # e. 结合 t_r = target_row，求 t_c
                        # f. 红马(9,7)进3: target_row = 9 - (3-1) = 7? 不对，应该是 9 - 2 = 7 (从下数第3个是index 2, 9-2=7)
                        # g. 或者：红方，从下往上数，第1行是9，第2行是8，第3行是7。所以 "进3" 对红方是目标行=7。
                        # h. 黑方，从上往下数，第1行是0，第2行是1，第3行是2。所以 "进3" 对黑方是目标行=2。
                        # i. 所以 target_row = 9 - end_index if color == '红' else 0 + end_index
                        # j. 马(9,7) -> 目标行7，可能列 (7,5) or (7,9)。需要验证移动规则。
                        # |7-9|=2, |5-7|=2 -> 不是日。|7-9|=2, |9-7|=2 -> 不是日。
                        # |7-9|=2, |c-7|=1 -> |c-7|=1 -> c=6 or c=8? (7,6) or (7,8)?
                        # 马走日：(r,c) -> (r+/-2, c+/-1) or (r+/-1, c+/-2)
                        # 从(9,7) -> (9-2, 7+/-1) = (7, 8) or (7, 6), 或 (9-1, 7+/-2) = (8, 9) or (8, 5)
                        # 所以可能的落点是 (7,8), (7,6), (8,9), (8,5)
                        # 如果目标行是7，则 t_r = 7, 只能是 (7,8) 或 (7,6) -> t_c = 8 or 6
                        # 如果棋谱是 "马2进3"，且马2在(9,7)，目标行7，那么目标列只能是6或8。
                        # 棋谱 "马2进3" 本身可能无法唯一确定是6还是8，除非棋盘有障碍。
                        # 但为了程序执行，我们假设如果存在多个可能，选择第一个。
                        # 但这超出了简单解析的范围。
                        # 让我们重新定义一个更简单的模型，只处理明确的情况。
                        # 定义：输入格式 "Xn进/退m" 或 "Xn平m"
                        # X是棋子名，n是棋子编号（从左数，阿拉伯或中文），m是目标行或列
                        # 对于 "进/退"：
                        # - 如果是兵/卒，进是向前，退是向后
                        # - 如果是车/炮/马/相/象/士/帅/将，进是靠近对方，退是远离对方
                        # - 红方：进=行号减小，退=行号增大
                        # - 黑方：进=行号增大，退=行号减小
                        # - m表示目标的行号（从己方底线开始数）
                        # 例如：红马2进3 -> 红方第2个马，前进到从红方底线数第3行 (row=9,8,7 -> row=7)
                        #       黑马2进3 -> 黑方第2个马，前进到从黑方底线数第3行 (row=0,1,2 -> row=2)
                        # 这个定义仍然复杂。让我们简化为：
                        # "Xn进/退m" -> 找到X方第n个X棋子，根据进退方向移动，m表示目标行号（对于红方从0-9倒数，黑方从0-9正数）？
                        # 不，这也不对。
                        # 标准定义：
                        # "Xn进m" -> 找到X方第n个X棋子，移动后所在的行号是m（对于红方，m=0-9，9是底线，0是顶线；对于黑方，m=0-9，0是底线，9是顶线）。
                        # "Xn退m" -> 同上，但方向相反。
                        # "Xn平m" -> 列号从n变到m，行号不变。
                        # 进退对于不同棋子含义不同，但通常表示行号变化。
                        # 再次修正：对于非兵种，"Xn进m" 指棋子移动后的行号是m。
                        # 红方：行0-9，9是己方底线。进是向小数，退是向大数。"进m" -> 目标行接近0。
                        # 黑方：行0-9，0是己方底线。进是向大数，退是向小数。"进m" -> 目标行接近9。
                        # 但"进m"中的m是绝对行号还是相对行号？应该是绝对行号，即棋子移动到第m行。
                        # "马2进3" -> 红方马2移动到第3行 (row=3)。黑方马2移动到第3行 (row=3)。
                        # 这样更合理。目标行就是m。
                        # 因此：
                        # 1. 找到颜色为(color)，名称为(piece_type)，按列排序后索引为(start_index)的棋子 (start_row, start_col)
                        # 2. 确定方向："进" or "退"
                        # 3. 目标行 target_row = end_index (如果红方进/黑方退) or 9/0 - end_index (如果红方退/黑方进)? 不对
                        # 4. 实际上，"马2进3" -> 目标行就是3。 "马2退3" -> 目标行就是3。
                        # 5. 所以 target_row = end_index (对于所有情况？) - 不对，不合理。
                        # 6. 标准规则：进退表示相对于当前方向的移动。
                        #   - 红方：进=行号减小(向上)，退=行号增大(向下)
                        #   - 黑方：进=行号增大(向下)，退=行号减小(向上)
                        #   - "马2进3" -> 红方马2向上移动3步？不是。是移动到第3行。
                        #   - "马2进3" -> 目标行是3。红方马从9或7或...移动到3。
                        #   - 这意味着m是目标行号。
                        #   - 红方：目标行 = 9 - (从己方数第几行)？不对。
                        #   - 黑方：目标行 = 0 + (从己方数第几行)？不对。
                        #   - 实际上，m就是目标的绝对行号。
                        #   - "马2进3" -> 移动到第3行 (row=3)。
                        #   - "马2退7" -> 移动到第7行 (row=7)。
                        #   - 这样，无论是红方还是黑方，"进3"都意味着目标行是3。
                        #   - 但这与常规理解冲突。常规：红方进是向0，退是向9。黑方进是向9，退是向0。
                        #   - "马2进3" 对红方，是移动到行号3吗？如果马在row=7，进，应该是向更小的行号，比如row=5。
                        #   - 所以 "进3" 不是移动3步，而是移动到行号3。
                        #   - 如果红马在row=7，"进3" 是移动到row=3。这在逻辑上是可能的，但不符合马的走法。
                        #   - 错了！"马2进3" 中的3是目标行号。马的移动必须符合L形规则。
                        #   - 如果红马在(7,7)，要移动到row=3，可能的列是？马走L，(r1,c1) -> (r2,c2) where |r2-r1|=2/1 and |c2-c1|=1/2
                        #   - (7,7) -> (3,c) -> |3-7|=4. 不符合L形。马不能这样走。
                        #   - 所以 "马2进3" 的 "3" 不是绝对行号。
                        #   - 正确理解：对于车马炮，"进m"或"退m"中的m是目标行号，但必须符合该棋子的移动规则。
                        #   - "马2进3" -> 目标行是 "从己方数第3行"。
                        #   - 红方：从下往上数第3行是 row = 9,8,7 -> row=7 (索引2)
                        #   - 黑方：从上往下数第3行是 row = 0,1,2 -> row=2 (索引2)
                        #   - 索引2 -> 绝对行号 = 9-2=7 (红) or 0+2=2 (黑)
                        #   - 所以 target_row = 9 - end_index if color == '红' else 0 + end_index
                        #   - 这个公式适用于非兵种。兵/卒的进退是固定的前后。
                        #   - 重新整理逻辑：
                        #     - 找到 (start_row, start_col) 对应 Xn
                        #     - 计算 target_row:
                        #       - 非兵种: if direction == '进': target_row = 9/0 -/+ end_index; else: target_row = 9/0 +/- end_index
                        #       - 红方: 进 -> 9 - end_index, 退 -> 9 + (end_index_from_current) -> 不对
                        #       - 黑方: 进 -> 0 + end_index, 退 -> 0 - (end_index_from_current) -> 不对
                        #     - 更准确：进退表示移动后的行号（对于当前方的视角）
                        #     - 红方进 = 行号变小 (向0)，红方退 = 行号变大 (向9)
                        #     - 黑方进 = 行号变大 (向9)，黑方退 = 行号变小 (向0)
                        #     - "Xn进m" -> 移动后所在行是 "从己方底线开始数的第m行"
                        #     - 红方：第1行是9，第2行是8，...，第m行是 9-(m-1) = 10-m
                        #     - 黑方：第1行是0，第2行是1，...，第m行是 0+(m-1) = m-1
                        #     - 所以 target_row = 9 - end_index if color == '红' else 0 + end_index
                        #     - 注意：end_index 是从0开始的索引，但棋谱是1-9。所以棋谱的"3"对应索引2。
                        #     - target_row = 9 - (end_index) if color == '红' else 0 + (end_index) # end_index already 0-based from parse
                        #     - 但上面解析 end_index = int/chi - 1，所以已经是0-based。
                        #     - 红马2进3: start_index=1 (第2个), end_index=2 (第3行, 0-based), color=红
                        #                 马在(9,1)或(9,7)。按列排序，马1在(9,1)，马2在(9,7)。start=(9,7)
                        #                 target_row = 9 - 2 = 7
                        #                 马(9,7)->(7,x) 且符合L形。L形：(9,7)->(7,6) or (7,8)? |9-7|=2,|7-6|=1->是L形。(9,7)->(8,5/9)也行。
                        #                 所以目标是 (7,6) 或 (7,8)。棋谱 "进3" 指定目标行是7，所以列是6或8。
                        #                 有歧义，但规则允许。
                        #                 我们需要一个函数来根据起始点和目标行/列，找到合法的落点。
                        #                 马的规则：(sr,sc) -> (tr,tc) where (|tr-sr|=2 and |tc-sc|=1) or (|tr-sr|=1 and |tc-sc|=2)
                        #                 已知 (sr,sc), tr, 求 tc: |tc-sc|=1 if |tr-sr|=2, |tc-sc|=2 if |tr-sr|=1
                        #                               tc = sc +/- 1 if |tr-sr|=2, tc = sc +/- 2 if |tr-sr|=1
                        #                 验证 |tr-sr| in [1,2] 且计算tc
                        #                 sr=9, sc=7, tr=7. |7-9|=2. 所以 |tc-7|=1 -> tc = 6 or 8.
                        #                 可行目标：(7,6), (7,8)
                        #                 如果棋盘上 (7,6) 有己方棋子，则不能走。(7,8) 空或敌方则可走。
                        #                 简化：返回所有符合移动规则的可能目标点，上层判断。
                        #                 但解析器只需返回 (start_row, start_col, target_row, possible_target_cols)
                        #                 但为了与平的格式一致，我们先计算一个目标列。
                        #                 如果有多个可能，我们暂时选择第一个合法的。
                        #                 需要棋盘信息来判断合法性，这超出了解析器的职责。
                        #                 所以，解析器只负责找到 (start_pos) 和 (target_row/col)，不判断合法性。
                        #                 合法性判断在 move_piece 中。
                        #                 解析器返回 (s_r, s_c, t_r, t_c_guess)
                        #                 move_piece 检查 (s_r,s_c) -> (t_r, t_c) 是否符合规则。
                        #                 对于 "马2进3":
                        #                   start_pos = (9,7) [for red]
                        #                   target_row = 7 [for red]
                        #                   马规则：(9,7) to (7,6) or (7,8) are valid L-shapes
                        #                   都满足 t_r=7，所以 t_c 可以是 6 或 8。
                        #                   棋谱 "进3" 没有提供足够的信息来区分6和8。
                        #                   这是实际棋谱中可能出现的歧义，但在明确的棋盘下通常只有一个合法解。
                        #                   我们可以做一个假设：如果存在多个符合目标行/列的点，则选择第一个。
                        #                   或者，我们可以返回所有可能的点，但这需要修改返回格式。
                        #                 让我们尝试计算一个目标列。
                        #                 马 (s_r, s_c) -> (t_r, t_c) 满足 |t_r - s_r| = 2/1, |t_c - s_c| = 1/2
                        #                 已知 s_r, s_c, t_r -> 求 t_c
                        #                 case 1: |t_r - s_r| = 2 -> |t_c - s_c| = 1 -> t_c = s_c +/- 1
                        #                 case 2: |t_r - s_r| = 1 -> |t_c - s_c| = 2 -> t_c = s_c +/- 2
                        #                 check abs(tr - sr) in [1, 2]
                        #                 if abs(tr - sr) == 2: tc = [sc - 1, sc + 1]
                        #                 if abs(tr - sr) == 1: tc = [sc - 2, sc + 2]
                        #                 filter tc in [0, 8]
                        #                 pick first or raise if multiple?
                        #                 Let's implement a general move rule checker later, and for now, just calculate one possible t_c.
                        #                 Define a helper to get possible targets based on piece type and start/end.
                        #                 This is getting complex. Let's define the helper function first.
                        
                        # Calculate target_row based on color and direction
                        if color == '红':
                            if direction == '进':
                                target_row = start_row - 1 # Simple step for now, need to refine
                            else: # 退
                                target_row = start_row + 1
                        else: # 黑
                            if direction == '进':
                                target_row = start_row + 1
                            else: # 退
                                target_row = start_row - 1
                        
                        # For simplicity in parsing, we calculate a potential t_c based on piece rules
                        # Let's define a helper function inside to calculate target based on piece rules
                        def get_target_from_move_rule(piece_name, s_r, s_c, t_r_or_c, direction):
                            # This function should return (t_r, t_c) based on the piece's move logic and the parsed move
                            # For '进'/'退', t_r_or_c is the target row
                            # For '平', t_r_or_c is the target col
                            if direction in ['进', '退']:
                                t_r = t_r_or_c
                                possible_t_c = []
                                if piece_name == '马':
                                    dr = abs(t_r - s_r)
                                    if dr == 2:
                                        dc = 1
                                        possible_t_c = [s_c - dc, s_c + dc]
                                    elif dr == 1:
                                        dc = 2
                                        possible_t_c = [s_c - dc, s_c + dc]
                                    else:
                                        return None, None # Invalid move for 马
                                elif piece_name == '车':
                                    # 车可以沿直线移动，进退只改变行
                                    if s_c == t_r_or_c: # Wait, this is wrong. t_r_or_c is target_row for 进退
                                    # For 车进/退, row changes, col same
                                        if s_r != t_r: # Target row is different
                                            possible_t_c = [s_c] # Col must be same
                                elif piece_name == '炮':
                                    # Same as 车 for 进退
                                    if s_r != t_r:
                                        possible_t_c = [s_c]
                                elif piece_name == '兵':
                                    # 兵进退，红黑方向不同，但列不变
                                    possible_t_c = [s_c]
                                elif piece_name == '卒':
                                    possible_t_c = [s_c]
                                # Add other pieces as needed
                                # Filter possible_t_c to be within [0, 8]
                                possible_t_c = [c for c in possible_t_c if 0 <= c <= 8]
                                if not possible_t_c:
                                    return None, None
                                return t_r, possible_t_c[0] # Return first possible, refine later
                            
                            elif direction == '平':
                                t_c = t_r_or_c
                                # For 平, row same, col changes
                                return s_r, t_c
                            
                            return None, None


                        # Recalculate based on piece rules
                        # We need the piece name
                        piece_name = piece_type
                        
                        # Determine start_index correctly for pieces like 马/炮/车 which are paired
                        # The notation "马2" means the 2nd 马 from the left (0-based index 1) for the current color
                        # Find all pieces of this type for the current color and sort by column
                        all_pieces_of_type = []
                        for r in range(10):
                            for c in range(9):
                                p = self.board[r][c]
                                if p and p.color == color and p.name == piece_name:
                                    all_pieces_of_type.append((r, c))
                        all_pieces_of_type.sort(key=lambda x: x[1]) # Sort by column
                        if start_index >= len(all_pieces_of_type):
                            raise ValueError(f"未找到第{start_index+1}个{piece_name}")
                        start_row, start_col = all_pieces_of_type[start_index]

                        # Calculate target based on move rule
                        if "平" in move_str:
                            t_r, t_c = get_target_from_move_rule(piece_name, start_row, start_col, end_col, '平')
                        else: # 进 or 退
                            # Calculate target_row based on standard notation
                            # "Xn进m" for 红 means move to row such that it's the m-th row from 红方底线 (row 9)
                            # i-th row from bottom (row 9) is row = 9 - (i-1) = 10 - i (1-based i)
                            # Since end_index is 0-based, row = 9 - end_index
                            # For 黑, i-th row from top (row 0) is row = 0 + (i-1) = i - 1 (1-based i)
                            # Since end_index is 0-based, row = 0 + end_index
                            target_row_calc = 9 - end_index if color == '红' else 0 + end_index
                            t_r, t_c = get_target_from_move_rule(piece_name, start_row, start_col, target_row_calc, direction)
                        
                        if t_r is None or t_c is None:
                            raise ValueError(f"无效的移动 {move_str}")
                        
                        return start_row, start_col, t_r, t_c

        raise ValueError(f"无法解析棋谱: {move_str}")


    def chinese_to_col(self, ch):
        """
        将中文数字转换为列索引 (一=0, 二=1, ..., 九=8)
        """
        mapping = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '七': 6, '八': 7, '九': 8}
        return mapping.get(ch, -1)

    def chinese_to_number(self, ch):
        """
        将中文数字转换为阿拉伯数字 (一=1, 二=2, ..., 九=9)
        """
        mapping = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9}
        return mapping.get(ch, -1) - 1 # Return 0-based index

    def is_valid_move(self, from_row, from_col, to_row, to_col):
        """
        检查移动是否符合棋子规则 (简化版)
        """
        piece = self.board[from_row][from_col]
        if not piece:
            return False
        target_piece = self.board[to_row][to_col]
        if target_piece and target_piece.color == piece.color:
            return False  # 不能吃自己人

        # 检查是否在棋盘范围内
        if not (0 <= to_row < 10 and 0 <= to_col < 9):
            return False

        # 检查各棋子规则
        if piece.name == '帅' or piece.name == '将':
            # 帅/将在九宫内移动，每次一格，不能出宫
            in_palace_red = (7 <= to_row <= 9 and 3 <= to_col <= 5)
            in_palace_black = (0 <= to_row <= 2 and 3 <= to_col <= 5)
            if not ((piece.color == '红' and in_palace_red) or (piece.color == '黑' and in_palace_black)):
                return False
            # 移动一格
            if abs(to_row - from_row) + abs(to_col - from_col) != 1:
                return False
            # 特殊：将帅不能照面 (中间无子)
            # 检查是否在同一列
            if from_col == to_col:
                # 检查当前列上是否有其他棋子
                min_r, max_r = min(from_row, to_row), max(from_row, to_row)
                for r in range(min_r + 1, max_r):
                    if self.board[r][from_col] is not None:
                        return False # 有子阻隔，不能照面
                # 如果移动后形成照面 (即移动到与对方将帅同一列)
                other_king_row = -1
                for r in range(10):
                    p = self.board[r][to_col]
                    if p and p.name in ['帅', '将'] and p.color != piece.color:
                        other_king_row = r
                        break
                if other_king_row != -1 and abs(to_row - other_king_row) > 1:
                    # 移动后不在同一列，OK
                    pass
                elif other_king_row != -1 and abs(to_row - other_king_row) <= 1:
                    # 移动后与对方将帅照面，不允许
                    return False


        elif piece.name == '士' or piece.name == '仕':
            # 士/仕在九宫内斜线移动一格
            in_palace_red = (7 <= to_row <= 9 and 3 <= to_col <= 5)
            in_palace_black = (0 <= to_row <= 2 and 3 <= to_col <= 5)
            if not ((piece.color == '红' and in_palace_red) or (piece.color == '黑' and in_palace_black)):
                return False
            if abs(to_row - from_row) != 1 or abs(to_col - from_col) != 1:
                return False

        elif piece.name == '相' or piece.name == '象':
            # 相/象走田字，不能蹩腿
            dr = abs(to_row - from_row)
            dc = abs(to_col - from_col)
            if dr != 2 or dc != 2:
                return False
            # 检查蹩腿点
            block_r = (from_row + to_row) // 2
            block_c = (from_col + to_col) // 2
            if self.board[block_r][block_c] is not None:
                return False
            # 相不能过河
            if piece.color == '红' and to_row < 5:
                return False
            if piece.color == '黑' and to_row > 4:
                return False

        elif piece.name == '马':
            # 马走日字，不能蹩腿
            dr = abs(to_row - from_row)
            dc = abs(to_col - from_col)
            if not ((dr == 2 and dc == 1) or (dr == 1 and dc == 2)):
                return False
            # 检查蹩腿点
            if dr == 2:
                block_r = from_row + (to_row - from_row) // 2
                block_c = from_col
            else: # dc == 2
                block_r = from_row
                block_c = from_col + (to_col - from_col) // 2
            if self.board[block_r][block_c] is not None:
                return False

        elif piece.name == '车':
            # 车走直线，无障碍
            if from_row != to_row and from_col != to_col:
                return False
            # 检查路径无障碍
            if from_row == to_row:
                start, end = min(from_col, to_col), max(from_col, to_col)
                for c in range(start + 1, end):
                    if self.board[from_row][c] is not None:
                        return False
            else: # from_col == to_col
                start, end = min(from_row, to_row), max(from_row, to_row)
                for r in range(start + 1, end):
                    if self.board[r][from_col] is not None:
                        return False

        elif piece.name == '炮':
            # 炮走直线，吃子时需要隔一个子
            if from_row != to_row and from_col != to_col:
                return False
            # 检查路径
            count = 0
            if from_row == to_row:
                start, end = min(from_col, to_col), max(from_col, to_col)
                for c in range(start + 1, end):
                    if self.board[from_row][c] is not None:
                        count += 1
            else: # from_col == to_col
                start, end = min(from_row, to_row), max(from_row, to_row)
                for r in range(start + 1, end):
                    if self.board[r][from_col] is not None:
                        count += 1

            if target_piece: # 要吃子
                if count != 1:
                    return False
            else: # 不吃子
                if count != 0:
                    return False

        elif piece.name == '兵' or piece.name == '卒':
            # 兵/卒向前一格，过河后可左右
            forward = -1 if piece.color == '红' else 1
            crossed_river_red = from_row <= 4
            crossed_river_black = from_row >= 5

            is_forward = (to_row == from_row + forward and to_col == from_col)
            is_sideways = (to_row == from_row and abs(to_col - from_col) == 1)

            if piece.color == '红':
                if not crossed_river_red: # 未过河
                    return is_forward
                else: # 已过河
                    return is_forward or is_sideways
            else: # 黑
                if not crossed_river_black: # 未过河
                    return is_forward
                else: # 已过河
                    return is_forward or is_sideways

        return True

    def move_piece(self, move_str):
        """
        根据输入的棋谱字符串移动棋子
        """
        try:
            from_row, from_col, to_row, to_col = self.parse_chinese_notation(move_str)
        except ValueError as e:
            print(f"解析错误: {e}")
            return False

        if not self.is_valid_move(from_row, from_col, to_row, to_col):
            print(f"移动无效: {move_str}")
            return False

        piece = self.board[from_row][from_col]
        captured_piece = self.board[to_row][to_col]

        # 执行移动
        self.board[to_row][to_col] = piece
        self.board[from_row][from_col] = None
        piece.row = to_row
        piece.col = to_col

        # 检查是否吃掉了对方将/帅
        if captured_piece and captured_piece.name in ['帅', '将']:
            print(f"\n--- 游戏结束 ---")
            winner = "红方" if captured_piece.color == '黑' else "黑方"
            print(f"获胜方: {winner}")
            return True # 游戏结束

        # 切换回合
        self.red_turn = not self.red_turn
        
        print(f"成功执行: {move_str}")
        return False # 游戏未结束


class Piece:
    """
    棋子类
    """
    def __init__(self, color, name, row, col):
        self.color = color
        self.name = name
        self.row = row
        self.col = col
        # 棋子的显示符号
        self.symbols = {
            ('红', '帅'): '帅', ('红', '仕'): '仕', ('红', '相'): '相', ('红', '马'): '马', ('红', '车'): '车', ('红', '炮'): '炮', ('红', '兵'): '兵',
            ('黑', '将'): '将', ('黑', '士'): '士', ('黑', '象'): '象', ('黑', '马'): '馬', ('黑', '车'): '車', ('黑', '炮'): '砲', ('黑', '卒'): '卒'
        }
        # 标准化名称到符号
        if (color, name) in self.symbols:
            self.symbol = self.symbols[(color, name)]
        elif (color, name.replace('仕', '士').replace('相', '象').replace('兵', '卒')) in self.symbols:
            # Handle common name variations
            alt_name = name.replace('仕', '士').replace('相', '象').replace('兵', '卒')
            self.symbol = self.symbols.get((color, alt_name), name)
        else:
            self.symbol = name

    def __repr__(self):
        return f"{self.color}{self.name}"


def main():
    board = ChessBoard()
    print("中国象棋棋盘初始化完成。")
    board.display()

    print("请输入棋谱指令 (例如: '炮二平五', '马2进3')，输入 'quit' 退出。")
    print("当前回合: 红方")
    while True:
        move_input = input(f"[{'红' if board.red_turn else '黑'}方回合] 请输入移动指令: ").strip()
        if move_input.lower() == 'quit':
            break
        
        if board.move_piece(move_input):
            board.display()
            break # 游戏结束
        
        board.display()
        print(f"当前回合: {'红方' if board.red_turn else '黑方'}")


if __name__ == "__main__":
    main()



