#!/usr/bin/env python3
"""检查 .env 配置是否正确加载"""
from dotenv import load_dotenv
import os

# 加载 .env
load_dotenv()

print("=" * 60)
print("环境变量检查")
print("=" * 60)

AI_MODE = os.environ.get('AI_MODE', 'NOT_SET')
AI_API_KEY = os.environ.get('AI_API_KEY', 'NOT_SET')
AI_API_URL = os.environ.get('AI_API_URL', 'NOT_SET')
AI_MODEL = os.environ.get('AI_MODEL', 'NOT_SET')

print(f"AI_MODE: {AI_MODE}")
print(f"AI_API_KEY: {AI_API_KEY[:8] if len(AI_API_KEY) > 8 else AI_API_KEY}")
print(f"AI_API_URL: {AI_API_URL}")
print(f"AI_MODEL: {AI_MODEL}")
print()

# 检查是否正确配置
if AI_MODE == 'mock':
    print("[√] 模拟模式已启用")
    print("    ✅ 不会调用真实 API")
    print("    ✅ 不需要 API 密钥")
else:
    print(f"[!] 当前模式: {AI_MODE}")
    if AI_MODE == 'real':
        if not AI_API_KEY or AI_API_KEY == 'NOT_SET':
            print("    [X] 错误：真实模式需要配置 AI_API_KEY")
        else:
            print("    [√] 已配置 API 密钥")

print("=" * 60)
