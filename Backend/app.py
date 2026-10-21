
from flask import Flask, jsonify, request
from flask_cors import CORS

from model_service import (
    predict_support_message,
    is_model_loaded,
)

app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    return jsonify({
        "status": "running",
        "project": "SupportGen AI",
        "model_loaded": is_model_loaded(),
    })


@app.post("/api/predict")
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Please send a valid JSON request."
        }), 400

    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify({
            "error": "Please enter a customer message."
        }), 400

    if len(message) > 5000:
        return jsonify({
            "error": "Message must be 5000 characters or fewer."
        }), 400

    try:
        result = predict_support_message(message)
        return jsonify(result), 200

    except FileNotFoundError:
        return jsonify({
            "error": "Trained adapter not found. Save and download the model adapter first."
        }), 503

    except ValueError:
        app.logger.exception("Invalid model response")
        return jsonify({
            "error": "The model returned an invalid response. Please try again."
        }), 502

    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": "Prediction failed. Check the backend terminal."
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )
