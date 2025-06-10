# Nimble

**Nimble** is a personal productivity app built to help me manage my projects, track time, and analyze how my time is spent. It simplifies project tracking and gives insights into daily work patterns.

## Features

- 🗂️ **Project Management** — Add, edit, and manage projects.
- ⏱️ **Time Tracking** — Start/stop timers for tasks or manually log time.
- 📊 **Time Analysis** — View breakdowns of where time is spent across projects.
- ✅ **Task Organization** — Create and manage to-dos within projects.
- 📅 **Daily Summary** — Quick glance at how your day was used.

## Tech Stack

- Backend: Python / Flask
- Frontend: HTML, TailwindCSS, JavaScript
- Database: SQLite (for now)

## Installation

```bash
git clone https://github.com/yourusername/nimble.git
cd nimble
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
npx tailwindcss -i ./tailwind.css -o .app/static/css/style.css
flask run
