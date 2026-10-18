
from flask import Blueprint, render_template, request
from werkzeug.utils import secure_filename

from app.predict import predict_pneumonia


main = Blueprint("main", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@main.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@main.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return render_template(
            "index.html",
            error="Please select a chest X-ray image."
        ), 400

    image = request.files["image"]

    if not image.filename:
        return render_template(
            "index.html",
            error="No image selected. Please upload an image."
        ), 400

    if not allowed_file(image.filename):
        return render_template(
            "index.html",
            error="Upload a JPG, JPEG, or PNG image."
        ), 400

    filename = secure_filename(image.filename)

    try:
        result = predict_pneumonia(image.stream)

        return render_template(
            "result.html",
            result=result,
            prediction=result["prediction"],
            confidence=result["confidence"],
            filename=filename,
        )

    except FileNotFoundError:
        return render_template(
            "index.html",
            error=(
                "Trained model not found. Place "
                "pneumonia_model.keras in the project root folder."
            )
        ), 500

    except Exception:
        return render_template(
            "index.html",
            error=(
                "Could not process the image. Check the model "
                "and its preprocessing configuration."
            )
        ), 500
