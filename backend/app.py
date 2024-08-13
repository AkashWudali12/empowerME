from flask import Flask, jsonify, request
from flask_cors import CORS
import redis
import os
import secrets
import json
from dotenv import load_dotenv
from pinecone import Pinecone
from pprint import pprint
from empowerMeDB_sql_commands import COMMANDS

# current on heroku ps:scale web=0 --app empower-me, to turn on run heroku ps:scale web=1 --app empower-me   

app = Flask(__name__)

# Correct CORS setup
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


load_dotenv()


api_key = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=api_key)
index = pc.Index("empower-me")

r = redis.Redis(
    host='redis-15054.c240.us-east-1-3.ec2.redns.redis-cloud.com',
    port=15054,
    password=os.environ["REDIS_PASSWORD"])

sql_executer = COMMANDS()

def generate_session_token():
    return secrets.token_hex(32)

def store_session_in_redis(session_token, user_id):
    r.set(session_token, user_id, ex=3600)

def get_session_data(session_token):
    value = r.get(session_token)
    if value:
        return value.decode('utf-8')
    return ""

@app.route('/')
def home():
    return "Welcome to the Flask App!"

@app.route('/login', methods=['POST'])
def checkLogin():
    data = request.get_json()
    patientId = data["pid"]

    response = index.fetch(ids=[patientId], namespace="patientsInfo")

    # Check if the ID exists in the specified namespace
    if patientId in response['vectors']:
        sessionToken = generate_session_token()
        store_session_in_redis(sessionToken, patientId)
        response = {"loginStatus": "success", "sessionToken": sessionToken}
        return jsonify(response), 200
    else:
        response = {"loginStatus": "error", "sessionToken": ""}
        return jsonify(response), 400

@app.route("/check_session", methods=['POST'])
def checkSession():
    try:
        data = request.get_json()
        sessionToken = data["sessionToken"]
        pid = get_session_data(sessionToken)
        if pid:
            return jsonify({"pid": pid}), 200
        else:
            return jsonify({"error": "token expired"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/get_user_data", methods=['POST'])
def getUserData():
    try:
        data = request.get_json()
        idLst, namespace = data["idLst"], data["namespace"]

        userData = index.fetch(ids=idLst, namespace=namespace)

        toRet = []
        if userData:
            for key in userData["vectors"]:
                toAdd = json.loads(userData["vectors"][key]["metadata"]["info"])
                toAdd["id"] = key
                toRet.append(json.dumps(toAdd))
            return jsonify({"userInfo": toRet}), 200
        else:
            return jsonify({"userInfo": []}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400

@app.route("/get_matches_from_id", methods=['POST'])
def getMatchesFromID():
    try:
        data = request.get_json()
        patientId, k, namespace = data["query"], data["k"], data["namespace"]
        exclude = [patientId] + sql_executer.getIds(start=patientId, column="connections") + \
        sql_executer.getIds(start=patientId, column="pending_connections") + sql_executer.getIds(start=patientId, column="rejected_connections")
        top_k_matches = index.query(
            namespace=namespace,
            id=patientId,
            top_k=k,
            include_values=True,
            filter={
                "id": {"$nin": exclude}  
            }
        )
        matches = [match["id"] for match in top_k_matches["matches"]]
        return jsonify({"matches":matches}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400

@app.route("/get_matches_from_vector", methods=['POST'])
def getMatchesFromVector():
    try:
        data = request.get_json()
        vector, k, namespace = data["query"], data["k"], data["namespace"]
        exclude = []
        top_k_matches = index.query(
            namespace=namespace,
            vector=vector,
            top_k=k,
            include_values=True,
            filter={
                "id": {"$nin": exclude}  
            }
        )
        matches = [match["id"] for match in top_k_matches["matches"]]
        return jsonify({"matches":matches}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400

@app.route("/add_user_to_sql", methods=['POST'])
def addUserToSQL():
    data = request.get_json()
    userId = data["id"]
    try:
        if not sql_executer.getIds(start=userId, column="id"):
            sql_executer.addUserWithId(user_id=userId)
            return jsonify({"status":"success"}), 200
        else:
            return jsonify({"status":"success"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status":"failure with error"}), 400

@app.route("/send_connection_in_sql", methods=['POST'])
def sendConnection():
    data = request.get_json()
    sender_id, receiver_id = data["sender_id"], data["receiver_id"]
    try:
        if not sql_executer.getIds(start=sender_id, column="id"):
            sql_executer.addUserWithId(user_id=sender_id)
        if not sql_executer.getIds(start=receiver_id, column="id"):
            sql_executer.addUserWithId(user_id=receiver_id)
        sql_executer.sendConnection(sender_id=sender_id, receiver_id=receiver_id)
        return jsonify({"status":"success"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status":"failure with error"}), 400

@app.route("/handle_connection_request", methods=['POST'])
def handleRequest():
    data = request.get_json()
    status, sender_id, receiver_id = data["status"], data["sender_id"], data["receiver_id"]
    try:
        if not sql_executer.getIds(start=sender_id, column="id"):
            sql_executer.addUserWithId(user_id=sender_id)
        if not sql_executer.getIds(start=receiver_id, column="id"):
            sql_executer.addUserWithId(user_id=receiver_id)
        sql_executer.handleRequest(status=status, sender_id=sender_id, receiver_id=receiver_id)
        return jsonify({"status":"success"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status":"failure with error"}), 400

@app.route("/get_ids_from_column", methods=['POST'])
def getIdsFromCol():
    data = request.get_json()
    userId, column = data["id"], data["column"]

    print("Col:", column)

    try:
        toRet = sql_executer.getIds(start=userId, column=column)
        return jsonify({"ids":toRet}), 200
    except Exception as e:
        print(e)
        return jsonify({"status":"failure with error"}), 400



if __name__ == '__main__':
    app.run(debug=True)