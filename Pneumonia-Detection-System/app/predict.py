
from pathlib import Path

import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model


# Project root folder
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "pneumonia_model.keras"

# Change this if your model was trained on another image size
IMG_SIZE = (224, 224)

_model = None


def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Trained model not found at: {MODEL_PATH}"
            )

        _model = load_model(MODEL_PATH)

    return _model


def predict_pneumonia(image_file):
    model = get_model()

    # Read and preprocess the X-ray
    with Image.open(image_file) as img:
        image = img.convert("RGB")
        image = image.resize(IMG_SIZE)
        image_array = np.asarray(image, dtype=np.float32)

    # Assumes model training used pixel values scaled to 0–1
    image_array = image_array / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    output = np.asarray(model.predict(image_array, verbose=0))

    if output.size != 1:
        raise ValueError(
            "Expected a binary classification model with one output."
        )

    score = float(output.reshape(-1)[0])

    if not np.isfinite(score) or not 0 <= score <= 1:
        raise ValueError(
            "Model output must be a valid probability between 0 and 1."
        )

    # Assumption: 0 = NORMAL, 1 = PNEUMONIA
    if score >= 0.5:
        label = "PNEUMONIA"
        confidence = score * 100
    else:
        label = "NORMAL"
        confidence = (1 - score) * 100

    return {
        "prediction": label,
        "confidence": round(confidence, 2),
        "score": round(score, 4),
    }
