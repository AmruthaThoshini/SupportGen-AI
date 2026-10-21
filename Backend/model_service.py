
import os
import requests

COLAB_API_URL = os.getenv("SUPPORTGEN_COLAB_URL", "").rstrip("/")
API_KEY = os.getenv("SUPPORTGEN_API_KEY", "")


def is_model_loaded():
    """Check whether the model running in Colab is available."""
    if not COLAB_API_URL or not API_KEY:
        return False

    try:
        response = requests.get(
            f"{COLAB_API_URL}/health",
            timeout=10,
        )
        response.raise_for_status()
        return response.json().get("model_loaded", False)
    except (requests.RequestException, ValueError):
        return False


def predict_support_message(message):
    """Send a customer message to the fine-tuned model in Colab."""
    if not isinstance(message, str) or not message.strip():
        raise ValueError("Customer message cannot be empty.")

    if not COLAB_API_URL or not API_KEY:
        raise RuntimeError(
            "Colab API URL or API key is not configured."
        )

    response = requests.post(
        f"{COLAB_API_URL}/predict",
        headers={"X-API-Key": API_KEY},
        json={"message": message.strip()},
        timeout=300,
    )

    if response.status_code == 400:
        raise ValueError("The Colab API rejected the request.")

    response.raise_for_status()

    result = response.json()

    required_fields = {
        "category",
        "intent",
        "suggested_reply",
    }

    if (
        not isinstance(result, dict)
        or set(result.keys()) != required_fields
        or not all(
            isinstance(result[field], str)
            and result[field].strip()
            for field in required_fields
        )
    ):
        raise ValueError("Colab returned an invalid prediction.")

    return result
