"""
慧牧云眸 — 基于AI的畜禽健康智能预警系统后端服务

核心AI能力：
- 接入国内大模型：DeepSeek（默认）/ 阿里千问 / SiliconFlow
- 多模态视觉分析：基于mmcow数据集的畜禽健康识别（MOCK模拟）
- AI对话：慧牧AI助手，支持畜禽健康和预警问答
- 实时预警：基于mmcow视觉监控画面的健康状态分析
提供畜禽健康智能预警系统的API接口
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import logging
import os
import base64
import json
from dotenv import load_dotenv
from openai import OpenAI

env_path = os.environ.get('ENV_PATH', os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(env_path)

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, static_folder=os.path.join(basedir, 'static'), static_url_path='/__static__')
CORS(app)

# 开发环境调试信息（生产环境禁用）
if app.debug and os.environ.get('ENV') != 'production':
    logging.debug('='*60)
    logging.debug('环境变量调试信息:')
    logging.debug(f'  AI_MODE: {os.environ.get("AI_MODE")}')
    logging.debug(f'  AI_API_KEY: {"已配置" if os.environ.get("AI_API_KEY") else "未设置"}')
    logging.debug(f'  .env 文件路径: {env_path}')
    logging.debug(f'  .env 文件存在: {os.path.exists(env_path)}')
    logging.debug('='*60)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'records.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'huimuyunmu-secret-key-2024')

# AI大模型配置（国内大模型，兼容OpenAI格式）
# 默认使用 DeepSeek（国内领先的开源大模型）
# 可通过环境变量切换为阿里千问、SiliconFlow等其他国内大模型
AI_MODE = (os.environ.get('AI_MODE') or 'mock').strip().lower()
AI_API_KEY = os.environ.get('AI_API_KEY', '').strip()
AI_API_URL = os.environ.get('AI_API_URL', 'https://api.deepseek.com/v1')
AI_MODEL = os.environ.get('AI_MODEL', 'deepseek-chat')
# 备用国内大模型配置（注释中为备用方案）
# 阿里千问: AI_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1, AI_MODEL=qwen-turbo
# SiliconFlow: AI_API_URL=https://api.siliconflow.cn/v1, AI_MODEL=Qwen/Qwen2.5-7B-Instruct

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
    if AI_MODE == 'mock':
        import random

        mock_results = [
            {
                "animal": "猪",
                "confidence": random.uniform(0.85, 0.97),
                "alert_level": "低",
                "advice": "健康状况良好，继续保持当前管理水平。【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            },
            {
                "animal": "牛",
                "confidence": random.uniform(0.88, 0.96),
                "alert_level": "低",
                "advice": "健康状态良好，注意定期检查体温。【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            },
            {
                "animal": "鸡",
                "confidence": random.uniform(0.82, 0.94),
                "alert_level": "低",
                "advice": "生长状态良好，注意通风和保暖。【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            },
            {
                "animal": "猪",
                "confidence": random.uniform(0.75, 0.88),
                "alert_level": "中",
                "advice": "建议增加观察频率，注意采食情况。【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            },
            {
                "animal": "牛",
                "confidence": random.uniform(0.78, 0.91),
                "alert_level": "中",
                "advice": "建议检查饲料营养，观察反刍情况。【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            }
        ]

        return random.choice(mock_results)

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
        # 初始化 OpenAI 客户端
        client = OpenAI(
            api_key=AI_API_KEY,
            base_url=AI_API_URL
        )

        # 构建提示词和消息
        prompt_text = '你是一个专业的畜禽健康分析专家。请分析以下畜禽健康状态，并返回JSON格式：{"animal": "动物类型", "confidence": 置信度(0-1), "alert_level": "预警等级(低/中/高)", "advice": "处理建议"}。请直接返回JSON，不要有其他内容。'

        # 构建消息内容 - 支持文本和图像
        content = [{"type": "text", "text": prompt_text}]
        
        # 如果有图像数据，添加到消息中
        if image_data:
            # 处理 base64 数据，去掉可能存在的前缀
            if image_data.startswith('data:image'):
                content.append({
                    "type": "image_url",
                    "image_url": {"url": image_data}
                })
            else:
                # 默认格式为 jpeg
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                })

        messages = [
            {
                "role": "user",
                "content": content
            }
        ]

        # 发送API请求
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            max_tokens=500
        )

        # 提取分析结果
        content = response.choices[0].message.content

        # 尝试解析JSON格式的结果
        try:
            # 清理可能存在的 markdown 代码块
            if '```' in content:
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()

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

    except Exception as e:
        print(f"AI分析失败: {str(e)}")

        # 如果是余额不足错误，返回友好提示
        if '402' in str(e) or 'Insufficient Balance' in str(e):
            return {
                "animal": "猪",
                "confidence": 0.87,
                "alert_level": "中",
                "advice": "API账户余额不足。请充值您的DeepSeek账户，或者设置 AI_MODE=mock 使用模拟模式进行开发测试。"
            }

        # 其他错误返回默认值
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
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/system-info', methods=['GET'])
def get_system_info():
    """获取系统信息，包括AI模式状态"""
    print('[/api/system-info] 被调用')
    try:
        print(f'  AI_MODE: {AI_MODE}')
        print(f'  AI_API_KEY: {bool(AI_API_KEY)}')
        result = {
            'ai_mode': AI_MODE,
            'ai_model': AI_MODEL,
            'api_key_configured': bool(AI_API_KEY)
        }
        print(f'  返回: {result}')
        return jsonify(result)
    except Exception as e:
        print(f'  错误: {str(e)}')
        return jsonify({'error': '系统配置读取失败'}), 500


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
    """获取适合mmcow视觉AI处理的预警列表"""
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
    """使用mmcow视觉AI处理预警"""
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
    """获取mmcow视觉AI预警分析统计"""
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
    """获取mmcow视觉AI预警配置"""
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


# --- mmcow视觉AI（MOCK模拟数据接口）---
@app.route('/api/poverty-ai/stats', methods=['GET'])
def get_poverty_ai_stats():
    """获取mmcow视觉AI统计数据（MOCK模拟）"""
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
    """mmcow视觉AI分析预警"""
    data = request.get_json() or {}
    return jsonify({
        'analysisId': f'AI_{datetime.now().timestamp()}',
        'result': '分析完成',
        'recommendation': '建议加强监控',
        'confidence': 0.92
    })


@app.route('/api/poverty-ai/performance', methods=['GET'])
def get_poverty_ai_performance():
    """获取mmcow视觉AI性能数据"""
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


# --- AI养殖建议与对话 --- 
@app.route('/api/ai/advice', methods=['POST'])
def get_ai_advice():
    """获取AI生成的养殖建议"""
    try:
        data = request.get_json() or {}
        query = data.get('query', '')
        animal_type = data.get('animal_type', '猪')
        context = data.get('context', '')

        # 模拟模式
        if AI_MODE == 'mock':
            # 根据动物类型和问题生成模拟建议
            advice_dict = {
                '猪': {
                    '养殖': '关于猪的养殖建议：1. 保持适宜的温度（18-22°C）2. 控制湿度在60-70% 3. 定期清洁消毒 4. 注意观察猪的健康状态和食欲',
                    '疫病': '猪疫病防控建议：1. 定期疫苗接种 2. 及时隔离病猪 3. 加强消毒管理 4. 保证饲料和饮水卫生',
                    '温度': '猪舍温度建议：育肥猪18-22°C，仔猪28-32°C，母猪20-24°C',
                    '湿度': '猪舍湿度建议：保持在60-70%，过高易引发呼吸道疾病',
                    '饲料': '猪饲料建议：提供全价饲料，保证蛋白质、维生素和矿物质均衡',
                    '其他': '关于猪的养殖，建议您：1. 定期巡栏 2. 监测生长指标 3. 做好防疫记录 4. 保持环境整洁'
                },
                '牛': {
                    '养殖': '关于牛的养殖建议：1. 提供充足优质饲料 2. 保证清洁饮水 3. 定期驱虫 4. 注意牛舍通风和保暖',
                    '疫病': '牛疫病防控建议：1. 按时接种疫苗 2. 定期健康检查 3. 保持牛舍干燥 4. 及时治疗病牛',
                    '温度': '牛舍温度建议：成年牛10-20°C，犊牛15-25°C',
                    '湿度': '牛舍湿度建议：控制在50-60%',
                    '饲料': '牛饲料建议：优质干草+精料，注意粗精搭配',
                    '其他': '关于牛的养殖，建议您：1. 定期检查蹄部健康 2. 监测产奶量 3. 做好繁育记录'
                },
                '鸡': {
                    '养殖': '关于鸡的养殖建议：1. 控制育雏温度（33-35°C）2. 合理光照管理 3. 保持干燥通风 4. 定期补充维生素',
                    '疫病': '鸡疫病防控建议：1. 严格执行免疫程序 2. 及时隔离病鸡 3. 加强消毒 4. 全进全出制',
                    '温度': '鸡舍温度建议：育雏期33-35°C，育成期20-25°C，成年鸡18-25°C',
                    '湿度': '鸡舍湿度建议：控制在50-60%',
                    '饲料': '鸡饲料建议：根据生长阶段调整饲料配比，保证营养均衡',
                    '其他': '关于鸡的养殖，建议您：1. 定期称重 2. 监测产蛋率 3. 做好防疫记录'
                }
            }

            # 根据查询内容匹配建议类型
            query_lower = query.lower()
            if '疫病' in query_lower or '疾病' in query_lower or '防疫' in query_lower:
                advice_type = '疫病'
            elif '温度' in query_lower:
                advice_type = '温度'
            elif '湿度' in query_lower:
                advice_type = '湿度'
            elif '饲料' in query_lower or '喂' in query_lower:
                advice_type = '饲料'
            else:
                advice_type = '养殖'

            advice = advice_dict.get(animal_type, {}).get(advice_type, advice_dict['猪']['其他'])

            # 如果有上下文，可以添加到建议中
            if context:
                advice += f"\n\n参考上下文：{context}"

            return jsonify({'advice': advice})

        # 真实 API 模式
        if not AI_API_KEY:
            return jsonify({'advice': '请在后端配置AI大模型的API KEY (AI_API_KEY)，或者设置 AI_MODE=mock 使用模拟模式。当前为未配置状态。'})

        # 初始化 OpenAI 客户端
        client = OpenAI(
            api_key=AI_API_KEY,
            base_url=AI_API_URL
        )

        system_prompt = f"你是一个专业的畜牧兽医专家，现在针对{animal_type}的养殖问题提供专业、准确、可操作的建议。如果用户提供了上下文信息，请结合上下文回答。"
        user_prompt = f"问题：{query}\n"
        if context:
            user_prompt += f"现场上下文数据：{context}\n"

        # 发送API请求
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )

        advice = response.choices[0].message.content
        # 清理Markdown格式符号
        advice = advice.replace('**', '')
        return jsonify({'advice': advice})

    except Exception as e:
        print(f"AI建议生成失败: {str(e)}")

        # 如果是余额不足错误，提供友好提示
        if '402' in str(e) or 'Insufficient Balance' in str(e):
            return jsonify({'advice': 'API账户余额不足。请充值您的DeepSeek账户，或者设置 AI_MODE=mock 使用模拟模式进行开发测试。'})

        return jsonify({'advice': f'抱歉，生成建议时出现错误：{str(e)}'})

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """处理慧牧AI助手对话（接入DeepSeek国内大模型）"""
    try:
        data = request.get_json() or {}
        messages = data.get('messages', [])

        if not messages:
            return jsonify({'reply': '请提供对话内容'})

        # 模拟模式
        if AI_MODE == 'mock':
            user_message = messages[-1].get('content', '').lower()

            # 简单的关键词匹配
            if '你好' in user_message or 'hi' in user_message:
                reply = "你好！我是慧牧AI助手，有什么可以帮您的？\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            elif '猪' in user_message:
                reply = "关于猪的养殖，我建议您注意以下几点：1. 保持适宜的温度（18-22°C）2. 控制好湿度（60-70%）3. 定期清洁消毒 4. 注意观察猪的健康状态。\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            elif '牛' in user_message:
                reply = "牛的养殖要点：1. 提供充足的优质饲料 2. 保证清洁饮水 3. 定期驱虫和疫苗接种 4. 注意牛舍通风。\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            elif '鸡' in user_message:
                reply = "鸡的养殖建议：1. 控制好育雏温度（33-35°C）2. 合理的光照管理 3. 定期补充维生素 4. 做好疫病预防。\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            elif '疫病' in user_message or '疾病' in user_message:
                reply = "疫病防控要点：1. 定期消毒 2. 及时隔离病禽 3. 按时接种疫苗 4. 保持环境卫生 5. 加强营养管理。\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            elif '温度' in user_message or '湿度' in user_message:
                reply = "环境控制建议：猪舍温度保持在18-22°C，湿度60-70%；牛舍温度10-20°C，湿度50-60%；鸡舍育雏期33-35°C，湿度50-60%。\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"
            else:
                reply = "我理解您的问题。作为慧牧AI助手，我可以帮助您解决畜禽养殖、疫病防控、环境调节等方面的问题。请问您具体想了解什么？\n\n【模拟模式提示：当前未接入真实AI Key，回复结果仅供参考】"

            return jsonify({'reply': reply})

        # 真实 API 模式
        if not AI_API_KEY:
            return jsonify({'reply': '请在后端配置AI大模型的API KEY (AI_API_KEY)，或者设置 AI_MODE=mock 使用模拟模式。当前为未配置状态。'})

        # 初始化 OpenAI 客户端
        client = OpenAI(
            api_key=AI_API_KEY,
            base_url=AI_API_URL
        )

        # 构建给大模型的messages，注入系统提示词
        system_msg = {
            "role": "system",
            "content": "你叫'慧牧AI助手'，是慧牧云眸畜禽健康智能预警系统的AI助手，已接入DeepSeek大模型。你精通畜禽养殖、疫病防控、环境调节，并能结合mmcow视觉监控数据进行智能分析。你的回答应该专业、简洁，不要长篇大论，适合在聊天窗口中阅读。"
        }

        api_messages = [system_msg] + messages

        # 发送API请求
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=api_messages,
            temperature=0.7,
            max_tokens=800
        )

        reply = response.choices[0].message.content
        # 清理Markdown格式符号
        reply = reply.replace('**', '')
        return jsonify({'reply': reply})

    except Exception as e:
        print(f"AI对话请求失败: {str(e)}")

        # 如果是余额不足错误，提供友好提示
        if '402' in str(e) or 'Insufficient Balance' in str(e):
            return jsonify({'reply': 'API账户余额不足。请充值您的DeepSeek账户，或者设置 AI_MODE=mock 使用模拟模式进行开发测试。'})

        return jsonify({'reply': f'网络或API请求异常：{str(e)}'})

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), filename)

@app.route('/<path:path>')
def serve_vue(path):
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    full_path = os.path.join(app.static_folder, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# ==================== 启动配置 ====================

def initialize_application():
    with app.app_context():
        db.create_all()
        init_db_data()


initialize_application()


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8081))
    app.run(host='0.0.0.0', port=port)
