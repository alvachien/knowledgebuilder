from pydub import AudioSegment

def cut_mp3(input_path, output_path, start_time, end_time):
    # 加载MP3文件
    audio = AudioSegment.from_mp3(input_path)
    
    # 将时间转换为毫秒
    start_time_ms = start_time * 1000
    end_time_ms = end_time * 1000
    
    # 截取音频
    cut_audio = audio[start_time_ms:end_time_ms]
    
    # 导出新的MP3文件
    cut_audio.export(output_path, format="mp3")

# 示例用法
input_path = "input.mp3"
output_path = "output.mp3"
start_time = 10  # 起始时间（秒）
end_time = 20    # 终点时间（秒）

cut_mp3(input_path, output_path, start_time, end_time)