import os


def rename_mp4_files(folder_path):
    # 获取指定文件夹内的所有文件
    files = os.listdir(folder_path)
    # 过滤出所有.mp4文件
    mp4_files = [f for f in files if f.endswith('.wav')]

    # 对文件进行编号重命名
    for index, filename in enumerate(mp4_files, start=1):
        # 构建新的文件名
        new_name = f"凉{index}.wav"
        # 构建完整的文件路径
        old_file = os.path.join(folder_path, filename)
        new_file = os.path.join(folder_path, new_name)

        # 重命名文件
        os.rename(old_file, new_file)
        print(f"Renamed '{filename}' to '{new_name}'")

folder_path = './凉'
rename_mp4_files(folder_path)