export function humanizeTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    // Pad with leading zeros if less than 10 for minutes and seconds when hours are present
    const formattedM = (h > 0 && m < 10) ? `0${m}` : m;
    const formattedS = (s < 10) ? `0${s}` : s;

    if (h > 0) return `${h}h ${formattedM}m ${formattedS}s`;
    if (m > 0) return `${m}m ${formattedS}s`;
    return `${s}s`; // No padding for seconds alone as it's typically just a number
}

export function dehumanizeTime(timeString) {
    if (typeof timeString !== 'string') return null;

    const parts = timeString.trim().split(/\s+/);
    let seconds = 0;

    for (const part of parts) {
        if (/^\d+h$/.test(part)) {
            seconds += parseInt(part) * 3600;
        } else if (/^\d+m$/.test(part)) {
            seconds += parseInt(part) * 60;
        } else if (/^\d+s$/.test(part)) {
            seconds += parseInt(part);
        } else {
            return null;
        }
    }

    return seconds;
}