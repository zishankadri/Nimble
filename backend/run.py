from app import create_app, db
from app.models import Project

app = create_app()

# Create tables on first run
with app.app_context():
    db.create_all()

# if __name__ == '__main__':
    # app.run(debug=True)
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
