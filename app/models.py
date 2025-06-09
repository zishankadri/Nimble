from . import db

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image = db.Column(db.String(200))  # store image filename or path
    
    # All these columns should be defined ONCE inside the class
    timer_seconds = db.Column(db.Integer, default=0)
    timer_running = db.Column(db.Boolean, default=False)
    timer_started_at = db.Column(db.DateTime, nullable=True) # THIS IS CORRECT!
    
    tasks = db.relationship('Task', backref='project', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"Project('{self.name}', '{self.id}')"



class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    highlighted = db.Column(db.Boolean, default=False)
