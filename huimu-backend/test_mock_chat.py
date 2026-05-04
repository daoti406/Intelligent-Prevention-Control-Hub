#!/usr/bin/env python3
"""测试模拟模式的对话功能"""
import requests
import json

url = 'http://127.0.0.1:8081/api/ai/chat'

test_cases = [
    {'role': 'user', 'content': '你好'},
    {'role': 'user', 'content': '养猪要注意什么？'},
    {'role': 'user', 'content': '如何预防疫病？'},
    {'role': 'user', 'content': '温度和湿度怎么控制？'}
]

print("=" * 60)
print("测试模拟模式的对话功能")
print("=" * 60)
print("\n提示：请先在另一个窗口运行 'python app.py'\n")
print("如果看到 'Running on http://127.0.0.1:8081'，则可以继续\n")

input("按回车键开始测试...")

for i, message in enumerate(test_cases, 1):
    print(f"\n[测试 {i}] 用户: {message['content']}")
    try:
        response = requests.post(url, json={'messages': [message]}, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"        AI: {result['reply']}")
        else:
            print(f"        [错误] 状态码: {response.status_code}, 响应: {response.text}")
    except Exception as e:
        print(f"        [错误] {str(e)}")

print("\n" + "=" * 60)
print("测试完成")
print("=" * 60)