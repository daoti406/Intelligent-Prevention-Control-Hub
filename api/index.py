import os
import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# AI 配置
AI_API_KEY = os.environ.get('AI_API_KEY', '')
AI_API_URL = os.environ.get('AI_API_URL', 'https://api.deepseek.com/v1')
AI_MODEL = os.environ.get('AI_MODEL', 'deepseek-chat')

# Mock 用户数据
MOCK_USER = {
    'id': 1,
    'username': 'admin',
    'password': '123456',
    'name': '管理员'
}

# Mock 仪表盘数据
def get_dashboard_stats():
    return [
        {"label": "总监测数量", "value": "6", "type": "success"},
        {"label": "异常数量", "value": "2", "type": "warning"},
        {"label": "在线设备", "value": "5", "type": "primary"},
        {"label": "健康率", "value": "96%", "type": "success"}
    ]

def get_notifications():
    return [
        {"id": 1, "title": "温度异常预警", "time": "2024-01-15 10:30", "type": "warning", "status": "待处理", "read": False},
        {"id": 2, "title": "设备离线提醒", "time": "2024-01-15 09:15", "type": "error", "status": "处理中", "read": False},
        {"id": 3, "title": "系统维护通知", "time": "2024-01-14 16:00", "type": "info", "status": "已处理", "read": True},
        {"id": 4, "title": "AI分析完成", "time": "2024-01-14 14:30", "type": "success", "status": "已处理", "read": True}
    ]

def get_cameras():
    return [
        {"id": 1, "name": "禽舍A区", "status": "online", "animals": 20, "location": "A区-1号", "healthRate": 95, "warnings": 1, "gifUrl": "/assets/images/牛.gif"},
        {"id": 2, "name": "禽舍B区", "status": "online", "animals": 15, "location": "B区-2号", "healthRate": 98, "warnings": 0, "gifUrl": "/assets/images/猪.gif"},
        {"id": 3, "name": "禽舍C区", "status": "offline", "animals": 18, "location": "C区-3号", "healthRate": 92, "warnings": 1, "gifUrl": "/assets/images/鸡.gif"},
        {"id": 4, "name": "禽舍D区", "status": "online", "animals": 22, "location": "D区-4号", "healthRate": 96, "warnings": 0, "gifUrl": "/assets/images/牛.gif"},
        {"id": 5, "name": "禽舍E区", "status": "online", "animals": 16, "location": "E区-5号", "healthRate": 94, "warnings": 0, "gifUrl": "/assets/images/猪.gif"},
        {"id": 6, "name": "禽舍F区", "status": "online", "animals": 19, "location": "F区-6号", "healthRate": 97, "warnings": 0, "gifUrl": "/assets/images/牛.gif"}
    ]

# Mock 预警数据
def get_warnings(keyword=None, level=None, status=None):
    warnings = [
        {"id": 1, "title": "温度异常", "location": "禽舍A区", "type": "温度", "level": "high", "status": "待处理", "description": "温度超过32°C，建议通风降温", "time": "2024-01-15 10:30"},
        {"id": 2, "title": "湿度超标", "location": "禽舍C区", "type": "湿度", "level": "medium", "status": "待处理", "description": "湿度超过75%，建议除湿", "time": "2024-01-15 09:45"},
        {"id": 3, "title": "空气质量预警", "location": "禽舍B区", "type": "空气质量", "level": "low", "status": "处理中", "description": "氨气浓度偏高", "time": "2024-01-15 08:20"},
        {"id": 4, "title": "动物行为异常", "location": "禽舍A区", "type": "行为分析", "level": "medium", "status": "已处理", "description": "检测到异常行为，已确认正常", "time": "2024-01-14 15:30"},
        {"id": 5, "title": "设备离线", "location": "禽舍C区", "type": "设备", "level": "high", "status": "处理中", "description": "摄像头离线，正在排查", "time": "2024-01-15 09:15"}
    ]
    
    filtered = warnings
    if keyword:
        filtered = [w for w in filtered if keyword.lower() in w['title'].lower() or 
                    keyword.lower() in w['location'].lower() or 
                    keyword.lower() in w['type'].lower() or
                    keyword.lower() in w['description'].lower()]
    if level:
        filtered = [w for w in filtered if w['level'] == level]
    if status:
        filtered = [w for w in filtered if w['status'] == status]
    
    return {"data": filtered, "total": len(filtered)}

# Mock 监控数据
def get_monitors():
    return [
        {"id": 1, "name": "禽舍A区", "status": "online", "temperature": 28.5, "humidity": 65, "airQuality": "good", "animals": 20, "healthRate": 95},
        {"id": 2, "name": "禽舍B区", "status": "online", "temperature": 27.8, "humidity": 62, "airQuality": "good", "animals": 15, "healthRate": 98},
        {"id": 3, "name": "禽舍C区", "status": "offline", "temperature": None, "humidity": None, "airQuality": None, "animals": 18, "healthRate": 92},
        {"id": 4, "name": "禽舍D区", "status": "online", "temperature": 29.2, "humidity": 68, "airQuality": "normal", "animals": 22, "healthRate": 96},
        {"id": 5, "name": "禽舍E区", "status": "online", "temperature": 28.0, "humidity": 64, "airQuality": "good", "animals": 16, "healthRate": 94},
        {"id": 6, "name": "禽舍F区", "status": "online", "temperature": 27.5, "humidity": 60, "airQuality": "good", "animals": 19, "healthRate": 97}
    ]

# Mock 知识库数据
def get_knowledge(category=None, keyword=None):
    knowledge = [
        {"id": 1, "title": "春季防疫要点", "category": "防疫知识", "content": "春季是疫病高发期，需加强疫苗接种和环境消毒。定期检查猪群健康状况，发现异常及时隔离治疗。", "tags": "春季,疫苗,防疫"},
        {"id": 2, "title": "猪瘟防控指南", "category": "防疫知识", "content": "猪瘟是高度传染性疾病，一旦发现疑似病例需立即上报。严格执行生物安全措施，禁止外来人员随意进入猪场。", "tags": "猪瘟,防控,生物安全"},
        {"id": 3, "title": "牛舍环境管理", "category": "饲养管理", "content": "保持牛舍通风良好，定期清理粪便。合理控制饲养密度，每头牛至少需要3-4平方米的空间。", "tags": "牛舍,环境,密度"},
        {"id": 4, "title": "鸡舍温度控制", "category": "饲养管理", "content": "雏鸡适宜温度为35°C左右，每周下降2-3°C，直到达到20-25°C。保持温度稳定，避免温差过大。", "tags": "鸡舍,温度,雏鸡"},
        {"id": 5, "title": "饲料营养配比", "category": "饲养管理", "content": "根据不同生长阶段调整饲料配方，保证蛋白质、维生素和矿物质的均衡摄入。定期检查饲料质量，防止霉变。", "tags": "饲料,营养,配比"},
        {"id": 6, "title": "常见疾病诊治", "category": "疾病防治", "content": "定期观察动物精神状态、食欲和粪便情况。发现异常及时请兽医诊断，避免滥用药物。", "tags": "疾病,诊治,兽医"}
    ]
    
    filtered = knowledge
    if category:
        filtered = [k for k in filtered if k['category'] == category]
    if keyword:
        filtered = [k for k in filtered if keyword.lower() in k['title'].lower() or 
                    keyword.lower() in k['content'].lower() or
                    keyword.lower() in k['tags'].lower()]
    
    return filtered

# AI 分析结果缓存
latest_analysis = {
    "animal": "牛",
    "confidence": 0.92,
    "alert_level": "低",
    "advice": "一切正常，继续观察"
}

analysis_history = [
    {"id": 1, "animal": "牛", "confidence": 0.92, "alert_level": "低", "time": "2024-01-15 10:30"},
    {"id": 2, "animal": "牛", "confidence": 0.88, "alert_level": "低", "time": "2024-01-15 09:30"},
    {"id": 3, "animal": "猪", "confidence": 0.95, "alert_level": "低", "time": "2024-01-15 08:30"},
    {"id": 4, "animal": "牛", "confidence": 0.78, "alert_level": "中", "time": "2024-01-14 16:30"},
    {"id": 5, "animal": "鸡", "confidence": 0.91, "alert_level": "低", "time": "2024-01-14 15:30"}
]

# ========== API 路由 ==========

@app.route('/api/auth', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == MOCK_USER['username'] and password == MOCK_USER['password']:
        return jsonify({
            'token': f'mock-token-{MOCK_USER["id"]}-{datetime.datetime.now().timestamp()}',
            'user': {
                'username': MOCK_USER['username'],
                'name': MOCK_USER['name']
            }
        })
    return jsonify({'error': '账号或密码错误'}), 401

@app.route('/api/user/me', methods=['GET'])
def get_current_user():
    """获取当前用户信息"""
    return jsonify({
        'username': MOCK_USER['username'],
        'name': MOCK_USER['name']
    })

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    """获取仪表盘统计"""
    return jsonify(get_dashboard_stats())

@app.route('/api/dashboard/notifications', methods=['GET'])
def dashboard_notifications():
    """获取通知列表"""
    return jsonify(get_notifications())

@app.route('/api/dashboard/cameras', methods=['GET'])
def dashboard_cameras():
    """获取摄像头列表"""
    return jsonify(get_cameras())

@app.route('/api/warning', methods=['GET'])
def warning_list():
    """获取预警列表"""
    keyword = request.args.get('keyword')
    level = request.args.get('level')
    status = request.args.get('status')
    return jsonify(get_warnings(keyword, level, status))

@app.route('/api/warning/<int:warning_id>', methods=['PUT'])
def update_warning(warning_id):
    """更新预警状态"""
    data = request.get_json()
    status = data.get('status')
    if status in ['待处理', '处理中', '已处理']:
        return jsonify({'success': True, 'message': '状态更新成功'})
    return jsonify({'success': False, 'message': '无效的状态值'}), 400

@app.route('/api/warning/ai-suitable', methods=['GET'])
def ai_suitable_warnings():
    """获取适合AI处理的预警"""
    warnings = get_warnings()['data']
    suitable = [w for w in warnings if w['level'] in ['low', 'medium']]
    return jsonify({"data": suitable, "total": len(suitable)})

@app.route('/api/warning/<int:warning_id>/handle-with-ai', methods=['POST'])
def handle_warning_with_ai(warning_id):
    """使用AI处理预警"""
    return jsonify({
        "success": True,
        "analysisId": f"AI_{warning_id}_{int(datetime.datetime.now().timestamp())}",
        "result": "AI处理完成",
        "recommendation": "建议加强日常巡检"
    })

@app.route('/api/warning/ai-stats', methods=['GET'])
def ai_stats():
    """获取AI预警统计"""
    return jsonify({
        "totalWarnings": 12,
        "aiHandled": 3,
        "pendingWarnings": 3,
        "aiAccuracy": 92.5,
        "avgProcessingTime": 0.85
    })

@app.route('/api/warning/trend', methods=['GET'])
def warning_trend():
    """获取预警趋势"""
    days = int(request.args.get('days', 30))
    return jsonify({
        "trend": "下降",
        "changeRate": -15.3,
        "predictedNextMonth": 12,
        "historicalData": [
            {"date": "01-01", "count": 8}, {"date": "01-05", "count": 6},
            {"date": "01-10", "count": 5}, {"date": "01-15", "count": 4}
        ]
    })

@app.route('/api/warning/ai-config', methods=['GET'])
def ai_config():
    """获取AI配置"""
    return jsonify({
        "enabled": True,
        "autoHandleLowLevel": True,
        "notificationEnabled": True,
        "confidenceThreshold": 0.85
    })

@app.route('/api/monitor', methods=['GET'])
def monitor_list():
    """获取监控列表"""
    return jsonify(get_monitors())

@app.route('/api/monitor/<int:monitor_id>', methods=['GET'])
def monitor_detail(monitor_id):
    """获取单个监控详情"""
    monitors = get_monitors()
    monitor = next((m for m in monitors if m['id'] == monitor_id), None)
    if monitor:
        monitor['aiAnalysisStatus'] = 'completed' if monitor['status'] == 'online' else 'pending'
        return jsonify(monitor)
    return jsonify({'error': '监控设备不存在'}), 404

@app.route('/api/monitor/stats', methods=['GET'])
def monitor_stats():
    """获取监控统计"""
    monitors = get_monitors()
    online_count = sum(1 for m in monitors if m['status'] == 'online')
    total_animals = sum(m['animals'] for m in monitors)
    avg_health_rate = sum(m['healthRate'] for m in monitors) / len(monitors)
    
    return jsonify({
        "onlineCount": online_count,
        "totalCount": len(monitors),
        "totalAnimals": total_animals,
        "avgHealthRate": round(avg_health_rate, 1)
    })

@app.route('/api/monitor/history', methods=['GET'])
def monitor_history():
    """获取监控历史数据"""
    camera_id = request.args.get('cameraId')
    days = int(request.args.get('days', 7))
    
    return jsonify({
        "cameraId": camera_id,
        "days": days,
        "temperature": [28.5, 28.3, 28.7, 29.0, 28.8, 28.4, 28.6],
        "humidity": [65, 64, 66, 67, 65, 63, 64]
    })

@app.route('/api/monitor/control', methods=['POST'])
def monitor_control():
    """控制监控设备"""
    data = request.get_json()
    camera_id = data.get('cameraId')
    action = data.get('action')
    
    actions = ['ptz_left', 'ptz_right', 'ptz_up', 'ptz_down', 'zoom_in', 'zoom_out', 'reset']
    if action in actions:
        return jsonify({'success': True, 'message': f'执行{action}成功'})
    return jsonify({'success': False, 'message': '无效的操作'}), 400

@app.route('/api/monitor/ai-analysis/<int:camera_id>', methods=['GET'])
def ai_analysis(camera_id):
    """获取AI视觉分析状态"""
    return jsonify({
        "cameraId": camera_id,
        "analysisStatus": "running",
        "lastAnalysis": "2024-01-15 10:30:00",
        "detectedAnimals": 20,
        "healthStatus": "normal",
        "confidence": 0.92
    })

@app.route('/api/monitor/config/<int:camera_id>', methods=['GET'])
def monitor_config(camera_id):
    """获取摄像头配置"""
    return jsonify({
        "cameraId": camera_id,
        "name": f"摄像头{camera_id}",
        "temperatureThreshold": {"min": 15, "max": 35},
        "humidityThreshold": {"min": 40, "max": 80},
        "animalType": "牛",
        "detectionEnabled": True
    })

@app.route('/api/monitor/config/<int:camera_id>', methods=['PUT'])
def update_monitor_config(camera_id):
    """更新摄像头配置"""
    data = request.get_json()
    return jsonify({'success': True, 'message': '配置更新成功'})

@app.route('/api/knowledge', methods=['GET'])
def knowledge_list():
    """获取知识库列表"""
    category = request.args.get('category')
    keyword = request.args.get('keyword')
    return jsonify(get_knowledge(category, keyword))

@app.route('/api/knowledge/<int:knowledge_id>', methods=['GET'])
def knowledge_detail(knowledge_id):
    """获取单条知识"""
    knowledge = get_knowledge()
    item = next((k for k in knowledge if k['id'] == knowledge_id), None)
    if item:
        return jsonify(item)
    return jsonify({'error': '知识条目不存在'}), 404

@app.route('/api/knowledge', methods=['POST'])
def create_knowledge():
    """创建知识条目"""
    data = request.get_json()
    return jsonify({
        'success': True,
        'id': 100,
        'message': '创建成功'
    })

@app.route('/api/knowledge/<int:knowledge_id>', methods=['PUT'])
def update_knowledge(knowledge_id):
    """更新知识条目"""
    data = request.get_json()
    return jsonify({'success': True, 'message': '更新成功'})

@app.route('/api/knowledge/<int:knowledge_id>', methods=['DELETE'])
def delete_knowledge(knowledge_id):
    """删除知识条目"""
    return jsonify({'success': True, 'message': '删除成功'})

@app.route('/api/poverty-ai/stats', methods=['GET'])
def poverty_ai_stats():
    """获取成本节约统计"""
    return jsonify({
        "traditionalCost": 120000,
        "aiCost": 36000,
        "costReduction": 70,
        "sensorReplacementCount": 15,
        "roiPeriod": 6
    })

@app.route('/api/poverty-ai/analyze', methods=['POST'])
def poverty_ai_analyze():
    """执行AI分析"""
    return jsonify({
        "analysisId": f"ANALYSIS_{int(datetime.datetime.now().timestamp())}",
        "recommendation": "当前养殖环境良好，建议继续保持现有管理措施",
        "confidence": 0.94
    })

@app.route('/api/poverty-ai/performance', methods=['GET'])
def poverty_ai_performance():
    """获取AI性能"""
    return jsonify({
        "totalAnalysis": 156,
        "avgResponseTime": 0.85,
        "accuracy": 93.2,
        "uptime": 99.8
    })

@app.route('/api/poverty-ai/edge-status', methods=['GET'])
def edge_status():
    """获取边缘计算状态"""
    return jsonify({
        "nodesOnline": 4,
        "nodesTotal": 5,
        "avgCpuUsage": 45.2,
        "avgMemoryUsage": 62.8,
        "networkLatency": 12
    })

@app.route('/api/latest', methods=['GET'])
def get_latest_analysis():
    """获取最新分析结果"""
    return jsonify(latest_analysis)

@app.route('/api/history', methods=['GET'])
def get_analysis_history():
    """获取历史分析记录"""
    return jsonify(analysis_history[:20])

@app.route('/api/ai/advice', methods=['POST'])
def ai_advice():
    """获取养殖建议"""
    data = request.get_json()
    query = data.get('query', '')
    animal_type = data.get('animal_type', '')
    context = data.get('context', '')
    
    # 如果没有配置AI API Key，返回模拟建议
    if not AI_API_KEY:
        advice = f"针对{animal_type}的{query}问题，建议：\n\n1. 请及时观察动物的精神状态和食欲情况\n2. 检查饲养环境是否符合要求\n3. 如有异常，请及时联系兽医进行诊断\n4. 定期做好防疫和消毒工作"
        return jsonify({'advice': advice})
    
    # 尝试调用AI（简化版）
    try:
        advice = f"根据您的问题「{query}」，结合「{context}」的情况，为您提供以下建议：\n\n1. 立即检查{animal_type}的健康状况，测量体温\n2. 确保饲养环境通风良好、温度适宜\n3. 提供充足的清洁饮水和营养饲料\n4. 观察动物的行为变化，如有异常及时隔离\n5. 建议咨询专业兽医进行进一步诊断"
        return jsonify({'advice': advice})
    except Exception as e:
        return jsonify({'advice': f"AI建议生成失败：{str(e)}"})

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """AI智能对话"""
    data = request.get_json()
    messages = data.get('messages', [])
    
    # 如果没有配置AI API Key，返回模拟回复
    if not AI_API_KEY:
        user_message = messages[-1]['content'] if messages else ''
        reply = f"感谢您的提问！关于「{user_message}」，我理解您的需求。建议您：\n\n1. 仔细观察动物的日常行为\n2. 保持饲养环境的清洁卫生\n3. 定期进行健康检查\n4. 如有需要，请联系专业兽医"
        return jsonify({'reply': reply})
    
    # 尝试调用AI（简化版）
    try:
        user_message = messages[-1]['content'] if messages else ''
        reply = f"您好！针对您提到的「{user_message}」问题，为您提供以下建议：\n\n1. 首先确认问题的具体表现和严重程度\n2. 检查相关的饲养管理措施是否到位\n3. 参考知识库中的相关内容\n4. 必要时寻求专业技术支持"
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'reply': f"AI回复失败：{str(e)}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
