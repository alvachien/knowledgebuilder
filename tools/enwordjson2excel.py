import json
import pandas as pd
import sys
import os

def json_to_excel(json_file_path, excel_file_path):
    """
    将JSON文件转换为Excel文件
    
    参数:
    json_file_path: JSON文件路径
    excel_file_path: 输出Excel文件路径
    """
    try:
        # 读取JSON文件
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # 验证数据格式
        if not isinstance(data, list):
            raise ValueError("JSON文件应该是一个数组")
        
        # 检查数组中每个元素的格式
        for item in data:
            if not isinstance(item, dict) or 'enword' not in item or 'cnword' not in item:
                raise ValueError("JSON数组中的每个元素应该包含'enword'和'cnword'字段")
        
        # 创建DataFrame
        df = pd.DataFrame(data)
        
        # 重命名列名为中文，便于理解
        df.columns = ['英文单词', '中文翻译']
        
        # 保存为Excel文件
        df.to_excel(excel_file_path, index=False, engine='openpyxl')
        
        print(f"成功将 {json_file_path} 转换为 {excel_file_path}")
        print(f"共处理了 {len(data)} 条记录")
        
    except FileNotFoundError:
        print(f"错误: 找不到文件 {json_file_path}")
    except json.JSONDecodeError:
        print(f"错误: {json_file_path} 不是有效的JSON文件")
    except Exception as e:
        print(f"转换过程中出现错误: {str(e)}")

def create_sample_json():
    """创建一个示例JSON文件用于测试"""
    sample_data = [
        {"enword": "hello", "cnword": "你好"},
        {"enword": "world", "cnword": "世界"},
        {"enword": "computer", "cnword": "计算机"},
        {"enword": "programming", "cnword": "编程"},
        {"enword": "python", "cnword": "Python"},
        {"enword": "data", "cnword": "数据"},
        {"enword": "structure", "cnword": "结构"}
    ]
    
    with open('sample.json', 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)
    
    print("已创建示例文件 sample.json")

def main():
    print("JSON到Excel转换工具")
    print("="*30)
    
    # 检查命令行参数
    if len(sys.argv) == 2:
        json_file = sys.argv[1]
        # 生成输出文件名
        base_name = os.path.splitext(json_file)[0]
        excel_file = f"{base_name}.xlsx"
    elif len(sys.argv) == 3:
        json_file = sys.argv[1]
        excel_file = sys.argv[2]
    else:
        # 如果没有提供参数，创建示例文件并使用它
        print("用法: python script.py <input.json> [output.xlsx]")
        print("没有提供参数，将创建示例文件并进行转换演示...")
        create_sample_json()
        json_file = "sample.json"
        excel_file = "output.xlsx"
    
    json_to_excel(json_file, excel_file)

if __name__ == "__main__":
    main()



