import { useEffect, useRef, useState, useCallback } from 'react';
import { humanizeTime, dehumanizeTime } from '../utils/helpers';
import { updateProjectTimer } from '../utils/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const useTimer = (
	initialSeconds,
	projectId,
	readOnly,
) => {
	const [sec, setSec] = useState(initialSeconds);
	const [inputValue, setInputValue] = useState(humanizeTime(initialSeconds));
	const [running, setRunning] = useState(false);
	const intervalRef = useRef(null);

	useEffect(() => {
		setSec(initialSeconds);
		setInputValue(humanizeTime(initialSeconds));
	}, [initialSeconds]);

	useEffect(() => {
		if (readOnly) setInputValue(humanizeTime(sec));
	}, [sec, readOnly]);

  	const fetchAndUpdate = useCallback(() => {
		const url = `${BACKEND_URL}/project/${projectId}/get_timer`;
	
		fetch(url)
			.then(res => res.json())
			.then(data => {
				setSec(data.seconds);
	
				setRunning(data.running);
	
				if (data.running && !intervalRef.current) {
					// Only start the interval if the server says it's running AND
					// our local interval isn't already active.
					startInterval();
				} else if (!data.running && intervalRef.current) {
					// If server says it's not running, but our local interval is, stop it.
					// This handles cases where another tab/user stops the timer.
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			});
  	}, [projectId]);

	const startInterval = useCallback(() => {
		if (intervalRef.current) return;
		setRunning(true);
		intervalRef.current = setInterval(fetchAndUpdate, 1000);
	}, [fetchAndUpdate]);
	
	const stopInterval = useCallback(() => {
		if (!intervalRef.current) return;
		clearInterval(intervalRef.current);
		intervalRef.current = null;
	}, []);

	useEffect(() => {
		// Clean up old timer
		stopInterval()

		// Reset state for the new project
		setSec(initialSeconds);
		setInputValue(humanizeTime(initialSeconds));
		fetchAndUpdate(); // fresh fetch for new project
		
		return () => {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		};
	}, [projectId]);

	const start = () => {
		const url = `${BACKEND_URL}/project/${projectId}/start_timer`;
		
		fetch(url, { method: "POST" })
			.then(() => {
				startInterval();
			})
			.catch(error => console.error('Error starting timer:', error));
	};

	const stop = () => {
		const url = `${BACKEND_URL}/project/${projectId}/stop_timer`;

		fetch(url, { method: "POST" })
			.then(() => {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
				setRunning(false);
			})
			.catch(error => console.error('Error stopping timer:', error));
	};

	const save = async (newTime) => {
		const newSec = dehumanizeTime(newTime);

		if (newSec !== null) {
			setSec(newSec);
			await updateProjectTimer(projectId, newSec); // Update the database
		} else {
			// TODO: Message strict error
			// setInputValue(humanizeTime(sec)); // fallback
		}
	};

	return {
		sec,
		setSec,
		inputValue,
		setInputValue,
		running,
		start,
		stop,
		save,
	};
};

export default useTimer;