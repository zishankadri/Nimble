from flask import Blueprint, render_template, request, redirect, url_for
from sqlalchemy import func

from flask import jsonify
from datetime import datetime, timezone

from .models import  Project, Task, db

from .utils import random_marble_image

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return redirect(url_for('project.home'))