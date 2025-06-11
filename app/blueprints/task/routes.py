from flask import Blueprint, render_template, request, redirect, url_for
from sqlalchemy import func
from flask import jsonify
from app.models import  Project, Task, db

task_bp = Blueprint('task', __name__)


# In your main blueprint
@task_bp.route('/<int:project_id>/create_task', methods=['POST'])
def create_task(project_id):
    title = request.form['title']
    task = Task(title=title, project_id=project_id)
    db.session.add(task)
    db.session.commit()
    return redirect(url_for('project.project_detail', id=project_id))


@task_bp.route('/task/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    """
    Toggles the completion status of a task.
    """
    task = Task.query.get_or_404(task_id)
    task.completed = not task.completed
    db.session.commit()
    return redirect(url_for('project.project_detail', id=task.project_id))


@task_bp.route('/task/<int:task_id>/delete', methods=['POST'])
def delete_task(task_id):
    """
    Deletes a task.
    """
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for('project.project_detail', id=task.project_id))


@task_bp.route('/task/<int:task_id>/highlight', methods=['POST'])
def toggle_highlight(task_id):
    """ 
    Toggles the highlight status of a task.
    """
    task = Task.query.get_or_404(task_id)
    task.highlighted = not task.highlighted
    db.session.commit()
    return redirect(url_for('project.project_detail', id=task.project_id))


@task_bp.route('/update-task/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    """
    Updates specific attributes (title, status, order) of a task based on the provided data.
    Uses PATCH for partial updates.
    """
    data = request.get_json()

    # Find the task by its ID
    task = Task.query.get(task_id)

    # Return 404 if the task is not found
    if not task:
        return jsonify({"message": "Task not found"}), 404

    # Update only the fields that are present in the request data
    if 'title' in data:
        task.title = data['title']
    if 'status' in data:
        task.status = data['status']
    if 'order' in data:
        task.order = data['order']

    try:
        db.session.commit()
        # Return 200 OK for successful update (you can also return the updated task)
        return jsonify({"message": "Task updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        # Handle potential database errors
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500