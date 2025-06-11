from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from . import jinja_filters

db = SQLAlchemy()
from flask_migrate import Migrate



def create_app():
    app = Flask(__name__)
    
    # Custom jinja filters
    app.jinja_env.filters['format_seconds'] = jinja_filters.format_seconds

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    migrate = Migrate(app, db)

    from .routes import main
    app.register_blueprint(main)

    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB max

    # Registering blueprints
    from .blueprints.project.routes import project_bp
    from .blueprints.task.routes import task_bp

    app.register_blueprint(project_bp, url_prefix='/project')
    app.register_blueprint(task_bp, url_prefix='/task')

    return app