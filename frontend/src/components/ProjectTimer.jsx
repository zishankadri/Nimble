import useTimer from '../hooks/useTimer';
import { CirclePlay, CirclePause } from 'lucide-react';
import { useRef } from 'react';


const ProjectTimer = ({ 
  initialSeconds,
  projectId,
  readOnly,
  setReadOnly,
}) => {
  
  const timerRef = useRef(null);
  const saveButtonRef = useRef(null);

	const {
		sec, setSec, inputValue, setInputValue, running, start, stop, save,
  } = useTimer(initialSeconds, projectId, readOnly)

  const exitEdit = async () => {
    setReadOnly(true);
    await save(timerRef.current.value);
  }
  
  return (
    <div className="flex items-center gap-4">
      <input
        ref={timerRef}
        type="text"
        value={inputValue}
        readOnly={readOnly}
        onChange={(e) => setInputValue(e.target.value)}
        // onDoubleClick={(e) => {
        //   window.getSelection().removeAllRanges();
        //   setReadOnly(false);
        // }}
        onBlur={exitEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.target.blur();
          }
        }}
        className={`timer-input w-34 text-xl font-medium ${readOnly ? '' : 'editable-input'}`}
      />

      {readOnly ? ( 
        running? (
          <button 
            onClick={stop} 
            disabled={!running}
            id='stopTimerBtn'> 
              <CirclePause className='size-9 text-green-400' />
          </button>
        ) : (
          <button 
            onClick={start} 
            disabled={running}
            id='startTimerBtn'> 
              <CirclePlay className='size-9 text-green-400' />
          </button>
        )
      ) : null}

      {!readOnly && (
        <button 
        ref={saveButtonRef}
        onClick={exitEdit}
        className="btn-primary">
            Save
        </button>
      )}

    </div>
  );
};

export default ProjectTimer;