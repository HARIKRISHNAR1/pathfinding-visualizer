from flask import Flask, render_template

app = Flask(__name__)

ROWS = 10
COLS = 15

@app.route("/")
def home():
    return render_template("index.html", ROWS=ROWS, COLS=COLS)

if __name__ == "__main__":
    app.run(debug=True)