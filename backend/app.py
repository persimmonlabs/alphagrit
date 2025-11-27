from flask import Flask

app = Flask(__name__)

@app.route('/api/hello')
def hello_world():
    return {'message': 'Hello from Python backend!'}

if __name__ == '__main__':
    app.run(debug=True)
