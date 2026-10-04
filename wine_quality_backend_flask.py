import numpy as np
from flask import Flask, request, render_template, jsonify
import joblib

app = Flask(__name__)

# Load model
obj = joblib.load("wine_quality.joblib")
model = obj["model"]
columns = obj["columns"]


@app.route("/")
def welcome():
    return render_template("index.html")


@app.route("/cols", methods=["GET"])
def cols():
    return jsonify(list(columns))


@app.route("/predict", methods=["POST"])
def predict():

    try:
        values = []

        for column in columns:
            value = request.form.get(column, type=float)

            if value is None:
                return jsonify({
                    "error": f"Missing value for {column}"
                }), 400

            values.append(value)

        X = np.array([values])

        prediction = model.predict(X)[0]

        return jsonify({
            "prediction": float(prediction)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )