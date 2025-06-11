from flask import Blueprint, render_template, request, redirect, url_for
from sqlalchemy import func
from flask import jsonify
from datetime import datetime
from app.models import  Project, Task, db
from app.utils import random_marble_image

project_bp = Blueprint('project', __name__)


@project_bp.route('/')
def home():
    all_projects = Project.query.all()
    return render_template('index.html', current_project=None, projects=all_projects)


@project_bp.route('/<int:id>')
def project_detail(id):
    all_projects = Project.query.all()
    project = Project.query.filter_by(id=id).first_or_404()
    tasks = Task.query.filter_by(project_id=id).order_by(Task.order).all()
    return render_template('project_detail.html', 
            current_project=project,
            projects=all_projects,
            tasks=tasks,
        )


@project_bp.route('/add', methods=['POST'])
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


@project_bp.route('/<int:id>/delete', methods=['POST'])
def delete_project(id):
    project = Project.query.filter_by(id=id).first_or_404()
    db.session.delete(project)
    db.session.commit()
    return redirect(url_for('main.home'))



@project_bp.route('/<int:id>/update_name', methods=['POST'])
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


@project_bp.route("/<int:id>/get_timer")
def get_timer(id):
    project = Project.query.get_or_404(id)
    seconds = project.timer_seconds

    if project.timer_running and project.timer_started_at:
        now = datetime.now()
        elapsed_seconds = int((now - project.timer_started_at).total_seconds())
        seconds += elapsed_seconds
    
        # Periodic backup (every 10 minutes) to minimize data loss on crash.
        if elapsed_seconds > 600:  # 10 minutes
            project.timer_seconds += int(elapsed_seconds)
            project.timer_started_at = now
            db.session.commit()

    return jsonify(seconds=seconds, running=project.timer_running)


@project_bp.route("/<int:id>/start_timer", methods=["POST"])
def start_timer(id):
    now = datetime.now()

    # Identify all projects that are currently running (excluding the one we're about to start)
    running_projects_to_stop = Project.query.filter(
        Project.timer_running == True,
        Project.id != id # Exclude the current project, in case it was already running and we're restarting it
    ).all()

    for p in running_projects_to_stop:
        # Calculate the elapsed time in seconds
        elapsed_seconds = (now - p.timer_started_at).total_seconds()

        p.timer_seconds += int(elapsed_seconds)
        p.timer_started_at = None
        p.timer_running = False

    # Get the project we want to start
    project_to_start = Project.query.get_or_404(id)

    # If the project we are starting was already running (e.g., restarting its own timer),
    #    calculate and add its currently accumulated time before resetting and restarting it.
    if project_to_start.timer_running and project_to_start.timer_started_at:
 
        elapsed_for_this_project = (now - project_to_start.timer_started_at).total_seconds()
        
        if elapsed_for_this_project > 0:
            project_to_start.timer_seconds += int(elapsed_for_this_project)
        else:
            print(f"WARNING: Non-positive elapsed time ({elapsed_for_this_project:.2f}s) for project {project_to_start.id} being re-started.")

    # Set the new start time and running status for the current project
    project_to_start.timer_running = True
    project_to_start.timer_started_at = now # Use the consistent current_utc_time

    db.session.commit()
    return '', 204


@project_bp.route("/<int:id>/stop_timer", methods=["POST"])
def stop_timer(id):
    project = Project.query.get_or_404(id)
    if project.timer_running and project.timer_started_at:
        now = datetime.now()

        elapsed = (now - project.timer_started_at).total_seconds()
        
        project.timer_seconds += int(elapsed)
        project.timer_started_at = None
        project.timer_running = False
        db.session.commit()
    return '', 204


# After editing
@project_bp.route('/<int:project_id>/set_timer', methods=['POST'])
def set_project_timer(project_id):
    """
    Sets the timer for a specific project to a new value.
    Expects a JSON payload with 'seconds'.
    """
    try:
        data = request.get_json()
        if not data or 'seconds' not in data:
            return jsonify({"error": "Missing 'seconds' in request body"}), 400

        new_seconds = data['seconds']

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Update the timer_seconds
        project.timer_seconds = new_seconds
        db.session.commit()

        return jsonify({"message": "Timer updated successfully", "new_seconds": new_seconds}), 200

    except Exception as e:
        db.session.rollback() # Rollback in case of an error
        return jsonify({"error": str(e)}), 500

