#!/usr/bin/env python3
"""
生成文章索引文件
用于GitHub Pages等静态部署环境
"""

import os
import json
import re
from datetime import datetime

def parse_front_matter(content):
    """解析Markdown文件的Front Matter"""
    lines = content.split('\n')
    if not lines or lines[0].strip() != '---':
        return {}
    
    front_matter = {}
    i = 1
    while i < len(lines) and lines[i].strip() != '---':
        line = lines[i].strip()
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"\'')
            
            # 处理标签数组
            if key == 'tags' and value.startswith('['):
                try:
                    # 简单解析数组格式
                    value = value.strip('[]').replace('"', '').replace("'", "")
                    front_matter[key] = [tag.strip() for tag in value.split(',')]
                except:
                    front_matter[key] = []
            else:
                front_matter[key] = value
        i += 1
    
    return front_matter

def generate_posts_index():
    """生成posts目录的索引文件"""
    posts_dir = 'posts'
    if not os.path.exists(posts_dir):
        print(f"错误: {posts_dir} 目录不存在")
        return
    
    files_info = []
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md') and filename != 'index.md':
            filepath = os.path.join(posts_dir, filename)
            
            try:
                # 获取文件统计信息
                stat = os.stat(filepath)
                
                # 读取文件内容
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 解析Front Matter
                front_matter = parse_front_matter(content)
                
                file_info = {
                    'filename': filename,
                    'lastModified': int(stat.st_mtime * 1000),
                    'size': stat.st_size,
                    'title': front_matter.get('title', filename.replace('.md', '').replace('-', ' ').title()),
                    'date': front_matter.get('date', datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')),
                    'category': front_matter.get('category', '未分类'),
                    'tags': front_matter.get('tags', []),
                    'description': front_matter.get('description', '')
                }
                
                files_info.append(file_info)
                print(f"处理文件: {filename}")
                
            except Exception as e:
                print(f"处理文件 {filename} 时出错: {e}")
                continue
    
    # 按修改时间排序
    files_info.sort(key=lambda x: x['lastModified'], reverse=True)
    
    # 生成索引文件
    index_data = {
        'version': '1.0.0',
        'lastUpdated': datetime.now().isoformat(),
        'count': len(files_info),
        'files': files_info
    }
    
    # 写入索引文件
    index_path = os.path.join(posts_dir, 'index.json')
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n索引文件已生成: {index_path}")
    print(f"共处理 {len(files_info)} 个文件")
    
    return index_data

if __name__ == '__main__':
    print("正在生成文章索引...")
    generate_posts_index()
    print("完成！")
