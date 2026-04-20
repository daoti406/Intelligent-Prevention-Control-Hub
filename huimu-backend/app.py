"""
慧牧云眸后端服务
提供畜禽健康智能防控系统的API接口
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# 数据库配置
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'records.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'huimuyunmu-secret-key-2024'

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


# ==================== 启动配置 ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        init_db_data()
    app.run(host='0.0.0.0', port=8081, debug=True)