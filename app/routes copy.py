from flask import Blueprint, render_template, request, redirect, url_for
from .models import  Project, Task, db
from slugify import slugify

from .utils import random_marble_image


main = Blueprint('main', __name__)


@main.route('/')
def home():
    all_projects = Project.query.all()
    all_projects = Project.query.all()
    return render_template('index.html', current_project=None, projects=all_projects)


@main.route('/project/<int:id>')
def project_detail(id):
    all_projects = Project.query.all()
    project = Project.query.filter_by(id=id).first_or_404()

    return render_template('project_detail.html', current_project=project, projects=all_projects)


@main.route('/add', methods=['POST'])
def add_project():
    name = request.form['name']

    # Check if project with same slug already exists
    existing_project = Project.query.filter_by(name=name).first()
    if existing_project:
        return "Project with this name already exists", 400

    # Create new project and add to database
    new_project = Project(name=name)
    db.session.add(new_project)
    db.session.commit()
    new_project.image = random_marble_image(filename=f"{new_project.id}.png")

    # Save the project to the database
    if not new_project.image:
        return "Error generating marble image", 500
    

    db.session.commit()

    return redirect(url_for('main.home'))  # Redirect to projects page


@main.route('/project/<int:id>/delete', methods=['POST'])
def delete_project(id):
    project = Project.query.filter_by(id=id).first_or_404()
    db.session.delete(project)
    db.session.commit()
    return redirect(url_for('main.home'))


from flask import jsonify

@main.route('/project/<int:id>/sync_timer', methods=['POST'])
def sync_timer(id):
    data = request.get_json()
    seconds = data.get('seconds')
    if seconds is None:
        return jsonify({"error": "Missing seconds"}), 400

    print("Syncing timer for project:", id, " ", seconds)

    project = Project.query.filter_by(id=id).first_or_404()
    project.timer_seconds = seconds
    db.session.commit()
    return jsonify({"status": "success"})


@main.route('/project/<int:id>/update_name', methods=['POST'])
def update_project_name(id):
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "Missing name"}), 400
    

    project = Project.query.filter_by(id=id).first_or_404()

    if project.name == name:
        return jsonify({"status": "success", "message": "No changes made"}), 200
    
    project.name = name
    db.session.commit()
    return jsonify({"status": "success"})




# In your main blueprint
@main.route('/project/<int:project_id>/create_task', methods=['POST'])
def create_task(project_id):
    title = request.form['title']
    task = Task(title=title, project_id=project_id)
    db.session.add(task)
    db.session.commit()
    return redirect(url_for('main.project_detail', id=project_id))

@main.route('/task/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.completed = not task.completed
    db.session.commit()
    return redirect(url_for('main.project_detail', id=task.project_id))

@main.route('/task/<int:task_id>/delete', methods=['POST'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for('main.project_detail', id=task.project_id))


@main.route('/task/<int:task_id>/highlight', methods=['POST'])
def toggle_highlight(task_id):
    task = Task.query.get_or_404(task_id)
    task.highlighted = not task.highlighted
    db.session.commit()
    return redirect(url_for('main.project_detail', id=task.project_id))
