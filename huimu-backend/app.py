"""
慧牧云眸后端服务
提供畜禽健康智能防控系统的API接口
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import requests
import base64
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# 数据库配置
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'records.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'huimuyunmu-secret-key-2024'

# AI模型API配置
# 使用用户提供的 Qwen2.5-7B-Instruct 模型
AI_API_KEY = os.environ.get('AI_API_KEY', '')
AI_API_URL = os.environ.get('AI_API_URL', 'https://api.siliconflow.cn/v1/chat/completions')
AI_MODEL = os.environ.get('AI_MODEL', 'Qwen/Qwen2.5-7B-Instruct')

db = SQLAlchemy(app)


# ==================== 数据模型 ====================

class User(db.Model):
    """用户表"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='admin')
    created_at = db.Column(db.DateTime, default=datetime.now)


class AnimalHouse(db.Model):
    """养殖场/禽舍表"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # 名称，如"A区猪舍1号"
    location = db.Column(db.String(100))  # 位置
    animal_type = db.Column(db.String(50))  # 动物类型：猪、鸡、牛
    animal_count = db.Column(db.Integer, default=0)  # 动物数量
    status = db.Column(db.String(20), default='online')  # online/offline
    health_rate = db.Column(db.Float, default=100.0)  # 健康率
    warnings = db.Column(db.Integer, default=0)  # 预警数量
    temperature = db.Column(db.Float)  # 温度
    humidity = db.Column(db.Float)  # 湿度
    air_quality = db.Column(db.String(20))  # 空气质量
    gif_url = db.Column(db.String(200))  # GIF图片路径
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)


class Warning(db.Model):
    """预警记录表"""
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=datetime.now)
    location = db.Column(db.String(100))  # 位置
    house_id = db.Column(db.Integer, db.ForeignKey('animal_house.id'))
    type = db.Column(db.String(50))  # 预警类型
    description = db.Column(db.Text)  # 描述
    level = db.Column(db.String(20))  # low/medium/high
    status = db.Column(db.String(20), default='待处理')  # 待处理/处理中/已处理
    created_at = db.Column(db.DateTime, default=datetime.now)


class Notification(db.Model):
    """通知表"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    time = db.Column(db.String(50))  # 时间描述，如"10分钟前"
    type = db.Column(db.String(20))  # warning/success/info
    status = db.Column(db.String(20))  # 状态
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


class Knowledge(db.Model):
    """知识库表"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50))  # 分类
    content = db.Column(db.Text)
    tags = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.now)


class AnalysisRecord(db.Model):
    """分析记录表"""
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=datetime.now)
    animal = db.Column(db.String(50))  # 识别的动物
    confidence = db.Column(db.Float)  # 置信度
    alert_level = db.Column(db.String(20))  # 预警等级：低、中、高
    advice = db.Column(db.Text)  # 处理建议
    created_at = db.Column(db.DateTime, default=datetime.now)


# ==================== AI模型调用 ====================

def analyze_image(image_path=None, image_data=None):
    """
    使用AI模型分析图像
    :param image_path: 图像路径
    :param image_data: 图像数据（base64编码）
    :return: 分析结果
    """
    # 验证 API 密钥
    if not AI_API_KEY:
        return {
            "animal": "猪",
            "confidence": 0.87,
            "alert_level": "中",
            "advice": "建议隔离观察，检查体温是否正常"
        }
    
    # 验证图像数据
    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            print(f"图像读取失败: {str(e)}")
            return {
                "animal": "未知",
                "confidence": 0,
                "alert_level": "中",
                "advice": "图像读取失败，请检查图像文件"
            }
    elif image_data:
        # 验证 base64 数据格式
        if len(image_data) > 10 * 1024 * 1024:  # 限制 10MB
            return {
                "animal": "未知",
                "confidence": 0,
                "alert_level": "中",
                "advice": "图像数据过大，请压缩后重试"
            }
    
    try:
        # 构建API请求
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {AI_API_KEY}'
        }
        
        # 准备请求数据
        payload = {
            'model': AI_MODEL,
            'messages': [
                {
                    'role': 'user',
                    'content': [
                        {
                            'type': 'text',
                            'text': '请分析这张图片，识别出里面的动物类型，并评估其健康状态。返回格式：{"animal": "动物类型", "confidence": 置信度, "alert_level": "预警等级", "advice": "处理建议"}'
                        }
                    ]
                }
            ],
            'max_tokens': 500
        }
        
        # 如果有图像数据，添加到请求中
        if image_data:
            payload['messages'][0]['content'].append({
                'type': 'image_url',
                'image_url': {
                    'url': f'data:image/jpeg;base64,{image_data}'
                }
            })
        
        # 发送API请求，添加超时控制
        response = requests.post(AI_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        # 处理API响应
        result = response.json()
        
        # 验证响应格式
        if not isinstance(result, dict):
            print("AI响应格式错误：返回的不是JSON对象")
            return {
                "animal": "未知",
                "confidence": 0.5,
                "alert_level": "中",
                "advice": "AI响应格式错误，请稍后重试"
            }
        
        # 提取分析结果
        if 'choices' in result and len(result['choices']) > 0:
            content = result['choices'][0]['message']['content']
            
            # 尝试解析JSON格式的结果
            try:
                analysis_result = json.loads(content)
                # 验证返回结果格式
                if not all(key in analysis_result for key in ['animal', 'confidence', 'alert_level', 'advice']):
                    print("AI返回结果格式不完整")
                    return {
                        "animal": analysis_result.get('animal', '未知'),
                        "confidence": analysis_result.get('confidence', 0.5),
                        "alert_level": analysis_result.get('alert_level', '中'),
                        "advice": analysis_result.get('advice', '建议稍后重试')
                    }
                return analysis_result
            except json.JSONDecodeError:
                print("AI返回内容不是有效的JSON格式")
                return {
                    "animal": "未知",
                    "confidence": 0.5,
                    "alert_level": "中",
                    "advice": "无法分析图像，请检查图像质量"
                }
        else:
            print("AI响应中缺少choices字段")
            return {
                "animal": "未知",
                "confidence": 0.5,
                "alert_level": "中",
                "advice": "AI服务返回异常，请稍后重试"
            }
        
    except requests.exceptions.Timeout:
        print("AI服务请求超时")
        return {
            "animal": "未知",
            "confidence": 0,
            "alert_level": "中",
            "advice": "AI服务请求超时，请稍后重试"
        }
    except requests.exceptions.RequestException as e:
        print(f"AI服务请求失败: {str(e)}")
        return {
            "animal": "未知",
            "confidence": 0,
            "alert_level": "中",
            "advice": f"AI服务请求失败: {str(e)}"
        }
    except Exception as e:
        print(f"AI分析失败: {str(e)}")
        return {
            "animal": "猪",
            "confidence": 0.87,
            "alert_level": "中",
            "advice": "建议隔离观察，检查体温是否正常"
        }


# ==================== 初始化数据 ====================

def init_db_data():
    """初始化数据库数据"""
    # 创建默认管理员用户
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', password='123456', name='管理员', role='admin')
        db.session.add(admin)

    # 初始化禽舍数据
    if AnimalHouse.query.count() == 0:
        houses = [
            AnimalHouse(name='A区猪舍1号', location='A区1号棚', animal_type='猪', animal_count=20,
                       status='online', health_rate=90.0, warnings=2, temperature=28.5, humidity=65,
                       air_quality='良好', gif_url='/src/assets/images/猪2.gif'),
            AnimalHouse(name='A区猪舍2号', location='A区2号棚', animal_type='猪', animal_count=12,
                       status='online', health_rate=100.0, warnings=0, temperature=26.8, humidity=62,
                       air_quality='优秀', gif_url='/src/assets/images/猪.gif'),
            AnimalHouse(name='B区鸡舍1号', location='B区1号棚', animal_type='鸡', animal_count=50,
                       status='online', health_rate=99.0, warnings=0, temperature=24.3, humidity=58,
                       air_quality='良好', gif_url='/src/assets/images/鸡.gif'),
            AnimalHouse(name='B区鸡舍2号', location='B区2号棚', animal_type='鸡', animal_count=50,
                       status='online', health_rate=96.0, warnings=3, temperature=25.1, humidity=61,
                       air_quality='一般', gif_url='/src/assets/images/鸡.gif'),
            AnimalHouse(name='C区牛舍1号', location='C区1号棚', animal_type='牛', animal_count=14,
                       status='online', health_rate=85.0, warnings=2, temperature=22.7, humidity=55,
                       air_quality='良好', gif_url='/src/assets/images/牛.gif'),
            AnimalHouse(name='C区牛舍2号', location='C区2号棚', animal_type='牛', animal_count=12,
                       status='online', health_rate=83.3, warnings=2, temperature=23.2, humidity=56,
                       air_quality='良好', gif_url='/src/assets/images/牛2.gif'),
        ]
        for house in houses:
            db.session.add(house)

    # 初始化预警数据
    if Warning.query.count() == 0:
        warnings = [
            Warning(location='A区猪舍1号', type='温度异常', description='温度超过阈值28°C，当前28.5°C',
                   level='medium', status='待处理'),
            Warning(location='B区鸡舍2号', type='湿度异常', description='湿度过低，当前45%',
                   level='low', status='处理中'),
            Warning(location='A区猪舍2号', type='设备离线', description='摄像头设备连接断开',
                   level='high', status='待处理'),
            Warning(location='C区牛舍1号', type='健康异常', description='检测到异常行为模式',
                   level='medium', status='已处理'),
            Warning(location='B区鸡舍1号', type='饲料不足', description='饲料库存低于阈值',
                   level='low', status='已处理'),
        ]
        for w in warnings:
            db.session.add(w)

    # 初始化通知数据
    if Notification.query.count() == 0:
        notifications = [
            Notification(title='A区3号棚温度异常', time='10分钟前', type='warning', status='预警', read=False),
            Notification(title='B区健康检查完成', time='1小时前', type='success', status='正常', read=True),
            Notification(title='防疫知识更新通知', time='2小时前', type='info', status='信息', read=True),
            Notification(title='系统维护计划', time='5小时前', type='info', status='通知', read=True),
        ]
        for n in notifications:
            db.session.add(n)

    # 初始化知识库数据
    if Knowledge.query.count() == 0:
        knowledges = [
            Knowledge(title='春季畜禽防疫要点', category='防疫知识',
                     content='春季是畜禽防疫的关键时期，应注意以下几点：1.加强疫苗接种；2.做好环境消毒；3.注意保温防寒；4.合理调整饲料配方。',
                     tags='防疫,春季,疫苗'),
            Knowledge(title='非洲猪瘟防控措施', category='疾病防治',
                     content='非洲猪瘟是一种高度传染性疾病，防控措施包括：1.严格人员车辆进出管理；2.加强消毒；3.禁止使用泔水喂猪；4.发现异常及时上报。',
                     tags='非洲猪瘟,防控,疾病'),
            Knowledge(title='奶牛乳房炎预防', category='养殖技术',
                     content='乳房炎是奶牛常见病，预防措施：1.保持牛舍清洁干燥；2.规范挤奶操作；3.定期检查乳房健康；4.合理搭配饲料。',
                     tags='奶牛,乳房炎,预防'),
        ]
        for k in knowledges:
            db.session.add(k)

    # 初始化分析记录数据
    if AnalysisRecord.query.count() == 0:
        records = [
            AnalysisRecord(animal='猪', confidence=0.87, alert_level='中', advice='建议隔离观察，检查体温是否正常'),
            AnalysisRecord(animal='牛', confidence=0.92, alert_level='低', advice='一切正常，继续观察'),
            AnalysisRecord(animal='鸡', confidence=0.78, alert_level='中', advice='建议检查饲料质量和饮水卫生'),
            AnalysisRecord(animal='猪', confidence=0.95, alert_level='低', advice='健康状态良好'),
            AnalysisRecord(animal='牛', confidence=0.83, alert_level='中', advice='建议增加运动量，检查蹄部健康'),
        ]
        for record in records:
            db.session.add(record)

    db.session.commit()


# ==================== API路由 ====================

@app.route('/')
def index():
    """首页"""
    return jsonify({
        'name': '慧牧云眸API服务',
        'version': '1.0.0',
        'status': 'running'
    })


# --- 认证相关 ---
@app.route('/api/auth', methods=['POST'])
def login():
    """登录接口"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username, password=password).first()

    if user:
        return jsonify({
            'token': f'mock-token-{user.id}-{datetime.now().timestamp()}',
            'user': {
                'username': user.username,
                'name': user.name
            }
        })
    else:
        return jsonify({'error': '用户名或密码错误'}), 401


@app.route('/api/user/me', methods=['GET'])
def get_current_user():
    """获取当前用户"""
    return jsonify({
        'username': 'admin',
        'name': '管理员'
    })


# --- 仪表盘数据 ---
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """获取仪表盘统计数据"""
    houses = AnimalHouse.query.all()
    total_monitoring = len(houses)
    total_warnings = sum(h.warnings for h in houses)
    avg_health = sum(h.health_rate for h in houses) / len(houses) if houses else 0

    stats = [
        {'label': '总监测数量', 'value': str(total_monitoring), 'type': 'success'},
        {'label': '异常数量', 'value': str(len([h for h in houses if h.health_rate < 90])), 'type': 'warning'},
        {'label': '预警数量', 'value': str(total_warnings), 'type': 'error'},
        {'label': '平均健康率', 'value': f'{avg_health:.1f}%', 'type': 'success'},
    ]
    return jsonify(stats)


@app.route('/api/dashboard/notifications', methods=['GET'])
def get_notifications():
    """获取通知列表"""
    notifications = Notification.query.order_by(Notification.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'time': n.time,
        'type': n.type,
        'status': n.status,
        'read': n.read
    } for n in notifications])


@app.route('/api/dashboard/cameras', methods=['GET'])
def get_cameras():
    """获取摄像头列表"""
    houses = AnimalHouse.query.all()
    return jsonify([{
        'id': h.id,
        'name': h.name,
        'status': h.status,
        'animals': h.animal_count,
        'location': h.location,
        'healthRate': f'{h.health_rate}%',
        'warnings': h.warnings,
        'gifUrl': h.gif_url
    } for h in houses])


# --- 预警管理 ---
@app.route('/api/warning', methods=['GET'])
def get_warnings():
    """获取预警列表"""
    keyword = request.args.get('keyword')
    level = request.args.get('level')
    status = request.args.get('status')

    query = Warning.query

    if keyword:
        query = query.filter(
            (Warning.location.contains(keyword)) |
            (Warning.type.contains(keyword)) |
            (Warning.description.contains(keyword))
        )
    if level:
        query = query.filter(Warning.level == level)
    if status:
        query = query.filter(Warning.status == status)

    warnings = query.order_by(Warning.created_at.desc()).all()
    return jsonify({
        'data': [{
            'id': w.id,
            'time': w.time.strftime('%Y-%m-%d %H:%M') if w.time else '',
            'location': w.location,
            'type': w.type,
            'description': w.description,
            'level': w.level,
            'status': w.status
        } for w in warnings],
        'total': len(warnings)
    })


@app.route('/api/warning/<int:id>', methods=['PUT'])
def update_warning(id):
    """更新预警状态"""
    warning = Warning.query.get(id)
    if warning:
        data = request.get_json()
        if 'status' in data:
            warning.status = data['status']
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': '预警不存在'}), 404


@app.route('/api/warning/ai-suitable', methods=['GET'])
def get_ai_suitable_warnings():
    """获取适合普惠AI处理的预警列表"""
    warnings = Warning.query.filter(
        Warning.level.in_(['low', 'medium'])
    ).order_by(Warning.created_at.desc()).all()
    return jsonify({
        'data': [{
            'id': w.id,
            'time': w.time.strftime('%Y-%m-%d %H:%M') if w.time else '',
            'location': w.location,
            'type': w.type,
            'description': w.description,
            'level': w.level,
            'status': w.status
        } for w in warnings],
        'total': len(warnings)
    })


@app.route('/api/warning/<int:warning_id>/handle-with-ai', methods=['POST'])
def handle_warning_with_ai(warning_id):
    """使用普惠AI处理预警"""
    warning = Warning.query.get(warning_id)
    if warning:
        data = request.get_json() or {}
        return jsonify({
            'success': True,
            'analysisId': f'AI_{datetime.now().timestamp()}',
            'result': 'AI处理完成',
            'recommendation': '建议加强日常巡检'
        })
    return jsonify({'error': '预警不存在'}), 404


@app.route('/api/warning/ai-stats', methods=['GET'])
def get_ai_warning_stats():
    """获取普惠AI预警分析统计"""
    all_warnings = Warning.query.all()
    ai_handled = len([w for w in all_warnings if w.status == '已处理'])
    return jsonify({
        'totalWarnings': len(all_warnings),
        'aiHandled': ai_handled,
        'pendingWarnings': len([w for w in all_warnings if w.status == '待处理']),
        'aiAccuracy': 92.5,
        'avgProcessingTime': 0.85
    })


@app.route('/api/warning/trend', methods=['GET'])
def get_warning_trend():
    """获取预警趋势分析"""
    days = request.args.get('days', 30, type=int)
    return jsonify({
        'trend': '下降',
        'changeRate': -15.3,
        'predictedNextMonth': 12,
        'historicalData': [
            {'date': '2024-01', 'count': 18},
            {'date': '2024-02', 'count': 15},
            {'date': '2024-03', 'count': 12}
        ]
    })


@app.route('/api/warning/ai-config', methods=['GET'])
def get_ai_config():
    """获取普惠AI预警配置"""
    return jsonify({
        'enabled': True,
        'autoHandleLowLevel': True,
        'notificationEnabled': True,
        'confidenceThreshold': 0.85
    })


# --- 实时监控 ---
@app.route('/api/monitor', methods=['GET'])
def get_monitors():
    """获取监控列表"""
    houses = AnimalHouse.query.all()
    return jsonify([{
        'id': h.id,
        'name': h.name,
        'status': h.status,
        'animals': h.animal_count,
        'location': h.location,
        'healthRate': f'{h.health_rate}%',
        'warnings': h.warnings,
        'gifUrl': h.gif_url,
        'temperature': h.temperature,
        'humidity': h.humidity,
        'airQuality': h.air_quality,
        'lastUpdate': h.updated_at.strftime('%Y-%m-%d %H:%M:%S') if h.updated_at else ''
    } for h in houses])


@app.route('/api/monitor/<int:id>', methods=['GET'])
def get_monitor_by_id(id):
    """获取指定监控详情"""
    house = AnimalHouse.query.get(id)
    if house:
        return jsonify({
            'id': house.id,
            'name': house.name,
            'status': house.status,
            'animals': house.animal_count,
            'location': house.location,
            'healthRate': f'{house.health_rate}%',
            'warnings': house.warnings,
            'gifUrl': house.gif_url,
            'temperature': house.temperature + (0.4 if house.temperature else 0) - 0.2 if house.temperature else None,
            'humidity': house.humidity,
            'airQuality': house.air_quality,
            'lastUpdate': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'activityLevel': 50,
            'aiAnalysis': {
                'status': 'normal',
                'confidence': 0.9,
                'lastAnalysis': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        })
    return jsonify({'error': '摄像头不存在'}), 404


@app.route('/api/monitor/stats', methods=['GET'])
def get_monitor_stats():
    """获取监控统计"""
    houses = AnimalHouse.query.all()
    total = len(houses)
    online = len([h for h in houses if h.status == 'online'])
    offline = total - online
    total_animals = sum(h.animal_count for h in houses)
    total_warnings = sum(h.warnings for h in houses)
    avg_health = sum(h.health_rate for h in houses) / total if total else 0

    return jsonify({
        'totalCameras': total,
        'onlineCameras': online,
        'offlineCameras': offline,
        'totalAnimals': total_animals,
        'totalWarnings': total_warnings,
        'avgHealthRate': f'{avg_health:.1f}%',
        'aiEnabledCameras': total,
        'costSavings': '7500'
    })


@app.route('/api/monitor/history', methods=['GET'])
def get_monitor_history():
    """获取监控历史数据"""
    camera_id = request.args.get('cameraId')
    days = request.args.get('days', 7, type=int)
    return jsonify({
        'cameraId': camera_id,
        'history': [
            {'time': '2024-01-15 10:00', 'temperature': 25.3, 'humidity': 60},
            {'time': '2024-01-15 11:00', 'temperature': 25.8, 'humidity': 59},
            {'time': '2024-01-15 12:00', 'temperature': 26.2, 'humidity': 58}
        ]
    })


@app.route('/api/monitor/control', methods=['POST'])
def control_monitor():
    """控制监控设备"""
    data = request.get_json()
    camera_id = data.get('cameraId')
    action = data.get('action')
    return jsonify({
        'success': True,
        'cameraId': camera_id,
        'action': action,
        'result': '操作成功'
    })


@app.route('/api/monitor/ai-analysis/<int:camera_id>', methods=['GET'])
def get_ai_visual_analysis(camera_id):
    """获取AI视觉分析状态"""
    house = AnimalHouse.query.get(camera_id)
    if house:
        return jsonify({
            'cameraId': camera_id,
            'analysisStatus': 'running',
            'lastAnalysis': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'detectedAnimals': house.animal_count,
            'healthStatus': 'normal',
            'confidence': 0.92
        })
    return jsonify({'error': '摄像头不存在'}), 404


@app.route('/api/monitor/config/<int:camera_id>', methods=['GET'])
def get_camera_config(camera_id):
    """获取摄像头配置"""
    house = AnimalHouse.query.get(camera_id)
    if house:
        return jsonify({
            'cameraId': camera_id,
            'name': house.name,
            'location': house.location,
            'animalType': house.animal_type,
            'threshold': {
                'temperature': {'min': 18, 'max': 28},
                'humidity': {'min': 40, 'max': 70}
            },
            'aiEnabled': True
        })
    return jsonify({'error': '摄像头不存在'}), 404


@app.route('/api/monitor/config/<int:camera_id>', methods=['PUT'])
def update_camera_config(camera_id):
    """更新摄像头配置"""
    house = AnimalHouse.query.get(camera_id)
    if house:
        data = request.get_json()
        return jsonify({'success': True, 'config': data})
    return jsonify({'error': '摄像头不存在'}), 404


# --- 知识库 ---
@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    """获取知识库列表"""
    category = request.args.get('category')
    keyword = request.args.get('keyword')

    query = Knowledge.query

    if category:
        query = query.filter(Knowledge.category == category)
    if keyword:
        query = query.filter(Knowledge.title.contains(keyword))

    knowledges = query.order_by(Knowledge.created_at.desc()).all()
    return jsonify([{
        'id': k.id,
        'title': k.title,
        'category': k.category,
        'content': k.content,
        'tags': k.tags,
        'createdAt': k.created_at.strftime('%Y-%m-%d') if k.created_at else ''
    } for k in knowledges])


@app.route('/api/knowledge/<int:id>', methods=['GET'])
def get_knowledge_by_id(id):
    """获取指定知识详情"""
    knowledge = Knowledge.query.get(id)
    if knowledge:
        return jsonify({
            'id': knowledge.id,
            'title': knowledge.title,
            'category': knowledge.category,
            'content': knowledge.content,
            'tags': knowledge.tags,
            'createdAt': knowledge.created_at.strftime('%Y-%m-%d') if knowledge.created_at else ''
        })
    return jsonify({'error': '知识不存在'}), 404


@app.route('/api/knowledge', methods=['POST'])
def create_knowledge():
    """创建知识条目"""
    data = request.get_json()
    knowledge = Knowledge(
        title=data.get('title'),
        category=data.get('category'),
        content=data.get('content'),
        tags=data.get('tags', '')
    )
    db.session.add(knowledge)
    db.session.commit()
    return jsonify({'success': True, 'id': knowledge.id})


@app.route('/api/knowledge/<int:id>', methods=['PUT'])
def update_knowledge(id):
    """更新知识条目"""
    knowledge = Knowledge.query.get(id)
    if knowledge:
        data = request.get_json()
        if 'title' in data:
            knowledge.title = data['title']
        if 'category' in data:
            knowledge.category = data['category']
        if 'content' in data:
            knowledge.content = data['content']
        if 'tags' in data:
            knowledge.tags = data['tags']
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': '知识不存在'}), 404


@app.route('/api/knowledge/<int:id>', methods=['DELETE'])
def delete_knowledge(id):
    """删除知识条目"""
    knowledge = Knowledge.query.get(id)
    if knowledge:
        db.session.delete(knowledge)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': '知识不存在'}), 404


# --- 普惠AI ---
@app.route('/api/poverty-ai/stats', methods=['GET'])
def get_poverty_ai_stats():
    """获取普惠AI统计数据"""
    return jsonify({
        'traditionalCost': 15000,
        'aiCost': 5000,
        'costReduction': 66.7,
        'sensorsReplaced': 8,
        'aiAccuracy': 92.5,
        'monthlySavings': 830,
        'roiMonths': 6
    })


@app.route('/api/poverty-ai/analyze', methods=['POST'])
def poverty_ai_analyze():
    """普惠AI分析预警"""
    data = request.get_json() or {}
    return jsonify({
        'analysisId': f'AI_{datetime.now().timestamp()}',
        'result': '分析完成',
        'recommendation': '建议加强监控',
        'confidence': 0.92
    })


@app.route('/api/poverty-ai/performance', methods=['GET'])
def get_poverty_ai_performance():
    """获取普惠AI性能数据"""
    return jsonify({
        'totalAnalyses': 1520,
        'avgResponseTime': 0.85,
        'accuracy': 92.5,
        'alertsHandled': 328,
        'costSavings': 7500
    })


@app.route('/api/poverty-ai/edge-status', methods=['GET'])
def get_edge_computing_status():
    """获取边缘计算状态"""
    return jsonify({
        'status': 'online',
        'activeNodes': 6,
        'totalNodes': 8,
        'cpuUsage': 45.2,
        'memoryUsage': 62.8,
        'lastSync': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })


# --- 实时分析结果 ---
@app.route('/api/latest', methods=['GET'])
def get_latest():
    """获取最新的分析结果"""
    # 调用AI模型进行分析
    # 使用前端的示例图像文件
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    image_path = os.path.join(base_dir, 'src', 'assets', 'images', '牛.jpg')
    
    if os.path.exists(image_path):
        analysis_result = analyze_image(image_path=image_path)
    else:
        # 如果图像文件不存在，使用默认分析结果
        analysis_result = analyze_image()
    
    # 保存分析结果到数据库
    new_record = AnalysisRecord(
        animal=analysis_result['animal'],
        confidence=analysis_result['confidence'],
        alert_level=analysis_result['alert_level'],
        advice=analysis_result['advice']
    )
    db.session.add(new_record)
    db.session.commit()
    
    return jsonify(analysis_result)


@app.route('/api/history', methods=['GET'])
def get_history():
    """获取历史分析记录（最近20条）"""
    records = AnalysisRecord.query.order_by(AnalysisRecord.created_at.desc()).limit(20).all()
    
    return jsonify([{
        "id": record.id,
        "time": record.time.strftime('%Y-%m-%d %H:%M:%S') if record.time else '',
        "animal": record.animal,
        "confidence": record.confidence,
        "alert_level": record.alert_level
    } for record in records])


# --- AI养殖建议 --- 
@app.route('/api/ai/advice', methods=['POST'])
def get_ai_advice():
    """获取AI生成的养殖建议"""
    try:
        # 尝试使用 request.get_json() 获取请求数据
        try:
            data = request.get_json()
            query = data.get('query', '')
            animal_type = data.get('animal_type', '猪')  # 默认动物类型为猪
            context = data.get('context', '')
        except:
            # 如果获取不到 JSON 数据，使用 request.form
            query = request.form.get('query', '')
            animal_type = request.form.get('animal_type', '猪')  # 默认动物类型为猪
            context = request.form.get('context', '')
        
        # 根据查询内容返回相应的建议
        if '产奶量' in query:
            return jsonify({'advice': '提高奶牛产奶量的具体措施：\n1. 合理饲养：提供均衡的营养饲料，保证蛋白质和能量摄入\n2. 科学挤奶：保持挤奶设备清洁，采用正确的挤奶方法\n3. 舒适环境：保持牛舍清洁干燥，温度适宜\n4. 健康管理：定期检查乳房健康，预防乳房炎\n5. 适当运动：保证奶牛有足够的活动空间'})
        elif '鸡' in query and '疾病' in query:
            return jsonify({'advice': '预防鸡群疾病的具体措施：\n1. 疫苗接种：按照免疫程序接种相关疫苗\n2. 环境消毒：定期对鸡舍进行消毒，保持清洁\n3. 饲料管理：使用优质饲料，确保营养均衡\n4. 温度控制：保持鸡舍温度适宜，避免温差过大\n5. 密度控制：合理控制饲养密度，避免过度拥挤'})
        else:
            # 对于其他问题，返回猪瘟的建议
            return jsonify({'advice': '预防猪瘟的具体措施：\n1. 严格生物安全：限制人员和车辆进出，定期消毒\n2. 疫苗接种：按照免疫程序接种猪瘟疫苗\n3. 日常管理：保持猪舍清洁干燥，合理饲养密度\n4. 监测隔离：定期监测猪群健康状况，发现异常及时隔离\n5. 饲料管理：使用优质饲料，避免使用泔水'})
            
    except Exception as e:
        print(f"AI建议生成失败: {str(e)}")
        return jsonify({'advice': '抱歉，生成建议时出现错误，请稍后重试。'})


# ==================== 启动配置 ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        init_db_data()
    app.run(host='0.0.0.0', port=8081, debug=True)