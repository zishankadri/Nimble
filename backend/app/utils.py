from marble_img_generator import generate_marble_image
from flask import current_app
import os

def random_marble_image(filename="marble.png"):
    ''' Generate marble image for the project '''
    img = generate_marble_image()
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)  # Ensure upload folder exists
    full_path = os.path.join(upload_folder, filename)
    img.save(full_path)
    return f'uploads/{filename}'
