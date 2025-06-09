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
    db.init_app(app)
    
    migrate = Migrate(app, db)

    from .routes import main
    app.register_blueprint(main)

    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB max


    return app