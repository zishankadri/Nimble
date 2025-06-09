from flask import Blueprint, render_template, request, redirect, url_for
from .models import  Project, Task, db
from slugify import slugify
from sqlalchemy import func

from .utils import random_marble_image
from datetime import datetime

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
from datetime import datetime, timezone


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

@main.route("/project/<int:id>/get_timer")
def get_timer(id):
    project = Project.query.get_or_404(id)
    seconds = project.timer_seconds

    if project.timer_running and project.timer_started_at:
        now = datetime.now(timezone.utc)

        # Re-introduce the robust timezone check for project.timer_started_at
        if project.timer_started_at.tzinfo is None:
            # If project.timer_started_at is naive, assume it's UTC and make it aware
            # This is the fallback for when the database doesn't give us an aware object
            timer_started_at_aware = project.timer_started_at.replace(tzinfo=timezone.utc)
        else:
            # If it's already aware, convert it to UTC just to be sure (though if DB returns aware, it's likely already UTC)
            timer_started_at_aware = project.timer_started_at.astimezone(timezone.utc)

        seconds += int((now - timer_started_at_aware).total_seconds())

    return jsonify(seconds=seconds, running=project.timer_running)


from datetime import datetime, timezone # Ensure timezone is imported

@main.route("/project/<int:id>/start_timer", methods=["POST"])
def start_timer(id):
    # Get the current time ONCE, from Python, in UTC.
    # This will be used as the "stop time" for all other projects,
    # and the "start time" for the new project, ensuring consistency.
    current_utc_time = datetime.now(timezone.utc)

    # 1. Identify all projects that are currently running (excluding the one we're about to start)
    running_projects_to_stop = Project.query.filter(
        Project.timer_running == True,
        Project.id != id # Exclude the current project, in case it was already running and we're restarting it
    ).all()

    # 2. Iterate through these projects, calculate elapsed time in Python, and update their status
    for p in running_projects_to_stop:
        if p.timer_started_at: # Make sure there's a valid start time
            # Ensure p.timer_started_at is timezone-aware for subtraction,
            # using the robust check you had before (even if models.py is timezone=True,
            # this handles potential edge cases or old data).
            if p.timer_started_at.tzinfo is None:
                started_at_aware = p.timer_started_at.replace(tzinfo=timezone.utc)
            else:
                started_at_aware = p.timer_started_at.astimezone(timezone.utc)

            # Calculate the elapsed time in seconds
            elapsed_seconds = (current_utc_time - started_at_aware).total_seconds()

            # IMPORTANT: Only add positive elapsed time.
            # This prevents negative values from being stored if clock skew or
            # other issues cause a negative duration calculation.
            if elapsed_seconds > 0:
                p.timer_seconds += int(elapsed_seconds)
            else:
                # Optionally log a warning if time went backward or was zero
                print(f"WARNING: Timer for project {p.id} calculated non-positive elapsed time ({elapsed_seconds:.2f}s). Not adding to total.")

            p.timer_started_at = None
            p.timer_running = False
        # Changes to 'p' are tracked by SQLAlchemy because it was queried using .all()

    # 3. Get the project we want to start
    project_to_start = Project.query.get_or_404(id)

    # 4. If the project we are starting was already running (e.g., restarting its own timer),
    #    calculate and add its currently accumulated time before resetting and restarting it.
    if project_to_start.timer_running and project_to_start.timer_started_at:
        if project_to_start.timer_started_at.tzinfo is None:
            started_at_aware_for_current = project_to_start.timer_started_at.replace(tzinfo=timezone.utc)
        else:
            started_at_aware_for_current = project_to_start.timer_started_at.astimezone(timezone.utc)
        
        elapsed_for_this_project = (current_utc_time - started_at_aware_for_current).total_seconds()
        
        if elapsed_for_this_project > 0:
            project_to_start.timer_seconds += int(elapsed_for_this_project)
        else:
            print(f"WARNING: Non-positive elapsed time ({elapsed_for_this_project:.2f}s) for project {project_to_start.id} being re-started.")

    # 5. Set the new start time and running status for the current project
    project_to_start.timer_running = True
    project_to_start.timer_started_at = current_utc_time # Use the consistent current_utc_time

    db.session.commit()
    return '', 204

@main.route("/project/<int:id>/stop_timer", methods=["POST"])
def stop_timer(id):
    project = Project.query.get_or_404(id)
    if project.timer_running and project.timer_started_at:
        now_utc = datetime.now(timezone.utc)

        if project.timer_started_at.tzinfo is None:
            # If project.timer_started_at is naive, assume it's UTC and make it aware
            timer_started_at_aware = project.timer_started_at.replace(tzinfo=timezone.utc)
        else:
            # If it's already aware, convert it to UTC if it's not already
            timer_started_at_aware = project.timer_started_at.astimezone(timezone.utc)

        elapsed = (now_utc - timer_started_at_aware).total_seconds()
        
        project.timer_seconds += int(elapsed)
        project.timer_started_at = None
        project.timer_running = False
        db.session.commit()
    return '', 204



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
