#!/usr/bin/env bash
set -e
trap 'kill $(jobs -p)' EXIT

# Flask ──> http://127.0.0.1:5000
( ./backend/run.py ) &

# React ──> http://127.0.0.1:3000
( cd frontend && npm run dev -- --port 3000 ) &

wait