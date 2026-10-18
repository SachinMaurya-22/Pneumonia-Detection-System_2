from flask import Flask
from pathlib import Path


def create_app():
    project_root = Path(__file__).resolve().parent.parent

    app = Flask(
        __name__,
        template_folder=str(project_root / "templates"),
        static_folder=str(project_root / "static")
    )

    app.config["SECRET_KEY"] = "pneumonia-detection-dev-key"
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    from app.routes import main
    app.register_blueprint(main)

    return app