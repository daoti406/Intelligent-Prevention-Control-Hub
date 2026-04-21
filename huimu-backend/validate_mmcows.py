#!/usr/bin/env python3
"""
验证脚本：使用 MmCows 数据集测试 AI 模型的识别准确率
"""

import os
import json
import requests
import base64
from tqdm import tqdm

# AI模型API配置
AI_API_KEY = os.environ.get('AI_API_KEY', 'your-api-key-here')
AI_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

# MmCows 数据集路径
# 请替换为实际的数据集路径
MMCOWS_DATA_PATH = 'path/to/mmcows/visual_data'


def analyze_image(image_path):
    """
    使用AI模型分析图像
    :param image_path: 图像路径
    :return: 分析结果
    """
    try:
        # 读取图像并编码
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # 构建API请求
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {AI_API_KEY}'
        }
        
        # 准备请求数据
        payload = {
            'model': 'deepseek-ai/deepseek-vl-7b-chat',
            'messages': [
                {
                    'role': 'user',
                    'content': [
                        {
                            'type': 'text',
                            'text': '请分析这张图片，识别出里面的动物类型（猪、牛、鸡等），并评估其健康状态。返回格式：{"animal": "动物类型", "confidence": 置信度, "alert_level": "预警等级", "advice": "处理建议"}'
                        },
                        {
                            'type': 'image_url',
                            'image_url': {
                                'url': f'data:image/jpeg;base64,{image_data}'
                            }
                        }
                    ]
                }
            ],
            'max_tokens': 500
        }
        
        # 发送API请求
        response = requests.post(AI_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        # 处理API响应
        result = response.json()
        
        # 提取分析结果
        if 'choices' in result and len(result['choices']) > 0:
            content = result['choices'][0]['message']['content']
            
            # 尝试解析JSON格式的结果
            try:
                analysis_result = json.loads(content)
                return analysis_result
            except json.JSONDecodeError:
                # 如果返回的不是JSON格式，返回默认结果
                return {
                    "animal": "未知",
                    "confidence": 0.5,
                    "alert_level": "中",
                    "advice": "无法分析图像，请检查图像质量"
                }
        
    except Exception as e:
        print(f"AI分析失败: {str(e)}")
    
    # 返回默认结果
    return {
        "animal": "未知",
        "confidence": 0.0,
        "alert_level": "中",
        "advice": "分析失败"
    }


def load_annotations(annotation_path):
    """
    加载标注数据
    :param annotation_path: 标注文件路径
    :return: 标注数据
    """
    with open(annotation_path, 'r', encoding='utf-8') as f:
        annotations = json.load(f)
    return annotations


def calculate_accuracy(predictions, annotations):
    """
    计算识别准确率
    :param predictions: 预测结果
    :param annotations: 标注数据
    :return: 准确率
    """
    correct = 0
    total = len(predictions)
    
    for pred, anno in zip(predictions, annotations):
        if pred['animal'] == anno['animal']:
            correct += 1
    
    return correct / total if total > 0 else 0


def main():
    """
    主函数
    """
    print("开始验证 MmCows 数据集...")
    
    # 检查数据集路径
    if not os.path.exists(MMCOWS_DATA_PATH):
        print(f"错误：数据集路径不存在: {MMCOWS_DATA_PATH}")
        print("请下载 MmCows 数据集并修改 MMCOWS_DATA_PATH 变量")
        return
    
    # 收集图像文件
    image_files = []
    for root, dirs, files in os.walk(MMCOWS_DATA_PATH):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                image_files.append(os.path.join(root, file))
    
    print(f"找到 {len(image_files)} 张图像")
    
    # 限制测试数量，避免API调用过多
    test_files = image_files[:10]  # 只测试前10张图像
    print(f"开始测试 {len(test_files)} 张图像...")
    
    # 分析图像
    predictions = []
    for image_path in tqdm(test_files):
        result = analyze_image(image_path)
        predictions.append(result)
        print(f"{os.path.basename(image_path)}: {result['animal']} (置信度: {result['confidence']})")
    
    # 这里应该加载真实的标注数据进行对比
    # 由于没有真实标注数据，我们使用模拟数据进行演示
    annotations = [
        {"animal": "牛"} for _ in test_files
    ]
    
    # 计算准确率
    accuracy = calculate_accuracy(predictions, annotations)
    print(f"\n识别准确率: {accuracy:.2f}%")
    
    # 保存结果
    with open('validation_result.json', 'w', encoding='utf-8') as f:
        json.dump({
            "predictions": predictions,
            "annotations": annotations,
            "accuracy": accuracy
        }, f, ensure_ascii=False, indent=2)
    
    print("验证完成，结果已保存到 validation_result.json")


if __name__ == '__main__':
    main()