from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
from bson.objectid import ObjectId
import jwt
import hashlib

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.compliment_jungle

SECRET_KEY = 'compliment_jungle'



# @app.route('/login')
# def render_login_page():
#    return render_template('login.html')

# @app.route('/signup')
# def render_signup_page():
#    return render_template('signup.html')

# @app.route('/habit')
# def render_habit_page():
#    return render_template('habit.html')

# @app.route('/award')
# def render_award_page():
#    return render_template('award.html')


# ~ 회원 기능 ~
# 회원가입 API
@app.route('/signup', methods=['POST'])
def signup():

    email = request.form['email']
    password = request.form['password']
    nickname = request.form['nickname']
    image_num = request.form['image_num']
  
    # 비밀번호 해싱
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

    # 이메일 중복 확인
    existing_nickname = db.user.find_one({"email": email})

    if existing_nickname:
        return jsonify({'result': 'fail', 'msg': "이미 존재하는 email 입니다."})

    # 신규 사용자 정보 등록
    db.user.insert_one({'email': email, 'password': password_hash, 'nickname': nickname, 'image_num' : int(image_num)})
    
    return jsonify({'result': 'success', 'msg': '회원가입이 완료되었습니다.'})

# 로그인 API
@app.route('/login', methods=['POST'])
def login():

    email = request.form['email']
    password = request.form['password']

    # 이메일, 비밀번호 오류 확인
    user = db.user.find_one({'email': email})
    if not user:
        return jsonify({'result': 'fail', 'msg': '회원가입이 필요합니다.'})
    
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    if user['password'] != password_hash:
        return jsonify({'result': 'fail', 'msg': '비밀번호가 올바르지 않습니다.'})

    #  사용자 인증
    result = db.user.find_one({'email': email, 'password': password_hash})
    result['_id'] = str(result['_id'])

    if result:
        # 토큰 생성 및 반환
        expire_time = datetime.now(timezone.utc) + timedelta(hours=1)
        payload = {'_id': result['_id'], 'expire_time': expire_time.strftime("%Y-%m-%d %H:%M:%S")}
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        print(expire_time.timestamp())
        return jsonify({'result': 'success', 'token': token, 'expire_time': expire_time.strftime("%Y-%m-%d %H:%M:%S")})
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 틀렸습니다.'})

# 해당 서비스는 모든 기능에 로그인을 요하기 때문에, 모든 기능에 토큰을 디코딩하여 _id (user_id) 를 저장하는 과정이 필요하다.
    
# ~ 비즈니스 로직 ~
# 습관 생성
@app.route('/habits', methods=['POST'])
def post_habit():

    token = request.cookies.get('token')
    print(token)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_info = db.user.find_one({'_id': ObjectId(payload['_id'])})
    
    except jwt.exceptions.DecodeError:
        return jsonify({'result': 'fail', 'msg': '로그인 정보가 존재하지 않습니다.'})
    except jwt.ExpiredSignatureError:
        return jsonify({'result': 'fail', 'msg': '로그인 시간이 만료되었습니다.'})

    name = request.form['name']
    tag = request.form['tag']
    goal = request.form['goal']

    habit = {
        'user_id': str(user_info['_id']),
        'name': name,
        'tag': tag,
        'goal': int(goal),
        'count': int(0),
        'accomplishment': False,
        'create_date': datetime.now(timezone.utc)
    }

    result = db.habits.insert_one(habit)
    
    # 저장한 후에 생성된 _id를 가져와서 문자열로 변환하여 클라이언트에 전달
    habit['_id'] = str(result.inserted_id)

    return jsonify({'result': 'success', "data": habit})

# 습관 조회
@app.route('/habits', methods=['GET'])
def get_habits():

    token = request.cookies.get('token')
    print(token)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_info = db.user.find_one({'_id': ObjectId(payload['_id'])})
    
    except jwt.exceptions.DecodeError:
        return jsonify({'result': 'fail', 'msg': '로그인 정보가 존재하지 않습니다.'})
    except jwt.ExpiredSignatureError:
        return jsonify({'result': 'fail', 'msg': '로그인 시간이 만료되었습니다.'})

    habits = list(db.habits.find({'user_id': str(user_info['_id']), 'accomplishment': False}).sort("create_date", -1))

    for habit in habits:
        habit['_id'] = str(habit['_id'])

    return jsonify({'result': 'success', 'data': habits})

# 습관 삭제
@app.route('/habits/<_id>', methods=['POST'])
def delete_habit(_id):

    token = request.cookies.get('token')
    print(token)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_info = db.user.find_one({'_id': ObjectId(payload['_id'])})
    
    except jwt.exceptions.DecodeError:
        return jsonify({'result': 'fail', 'msg': '로그인 정보가 존재하지 않습니다.'})
    except jwt.ExpiredSignatureError:
        return jsonify({'result': 'fail', 'msg': '로그인 시간이 만료되었습니다.'})

    db.habits.delete_one({'user_id': str(user_info['_id']),'_id': ObjectId(_id)})

    return jsonify({'result': 'success'})

# 습관 누적 횟수 증가
@app.route('/habits/count/<_id>', methods=['POST'])
def post_habit_count(_id):

    habit = db.habits.find_one({'_id': ObjectId(_id)})

    if habit['count'] >= habit['goal']:
        return jsonify({'result': 'fail', 'msg': '이미 목표 횟수에 도달했습니다.'})
    
    else:
        db.habits.update_one({'_id': ObjectId(_id)}, {'$set': {'count': habit['count'] + 1}})
        update_habit = db.habits.find_one({'_id': ObjectId(_id), 'accomplishment': False})
    
        if update_habit['count'] == update_habit['goal']:
            db.habits.update_one({'_id': ObjectId(_id)}, {'$set': {'accomplishment': True}})

    data = [{"count": update_habit['count']}]

    return jsonify({'result': 'success', 'data': data})

# 명예의 전당 조회
@app.route('/awards', methods=['GET'])
def get_awards():

    awards = db.habits.find({'accomplishment': True})

    data = []

    for habit in awards:
        
        habit['_id'] = str(habit['_id'])
        compliments = []
        
        for i in range(0, 5):
            compliment_num = len(list(db.compliments.find({'habit_id': str(habit['_id']), 'icon_num': i})))
            
            if compliment_num != 0:
                compliments.append({'icon_num': i, 'compliment_num': compliment_num})
        
        data.append({'habit': habit, 'compliments': compliments})

    return jsonify({'result': 'success', "data": data})

# 칭찬 생성
@app.route('/compliments', methods=['POST'])
def post_compliment():

    habit_id = request.form['_id']
    icon_num = request.form['icon_num']

    compliment = {
        'user_id': 1,
        'habit_id': habit_id,
        'icon_num': int(icon_num)
    }

    db.compliments.insert_one(compliment)

    data = []

    habit = db.habits.find_one({'_id': ObjectId(habit_id), 'accomplishment': True})
    habit['_id'] = str(habit['_id'])

    compliments = []

    for i in range(0, 5):
        compliment_num = len(list(db.compliments.find({'habit_id': str(habit['_id']), 'icon_num': i})))
        
        if compliment_num != 0:
            compliments.append({'icon_num': i, 'compliment_num': compliment_num})
    
    data.append({'habit': habit, 'compliments': compliments})

    return jsonify({'result': 'success', 'data': data})

# 칭찬 조회
@app.route('/compliments/<_id>', methods=['GET'])
def get_compliment(_id):

    compliment = db.compliments.find_one({'habit_id': _id, 'accomplishment': True})
    compliment['_id'] = str(compliment['_id'])

    return jsonify({'result': 'success', 'data': compliment})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)