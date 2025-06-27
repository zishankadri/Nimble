import { useState, useRef, useEffect } from 'react';
import { Trash2, TimerReset, CircleCheckBig, EllipsisVertical} from 'lucide-react';
const DropdownMenu = ({ onDelete, onComplete, onEditTimer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="aspect-square rounded-full w-8 text-xl text-gray-400 hover:bg-white/5 focus:outline-none flex items-center justify-center"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <EllipsisVertical className='size-5' />
      </button>

      {isOpen && (
        <div className="dropdown">
          <div className="py-1">
            <button
              onClick={() => {
                onComplete();
                setIsOpen(false);
              }}
              className="dropdown-item !text-green-400 hover:!bg-green-400/20"
            >
              <CircleCheckBig className="size-4"/>
              Mark as complete
            </button>
            <button
              onClick={() => {
                onEditTimer();
                setIsOpen(false);
              }}
              className="dropdown-item"
            >
              <TimerReset className="size-4"/>
              Edit Timer 
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this project?')) {
                  onDelete();
                }
                setIsOpen(false);
              }}
              className="dropdown-item !text-red-300 hover:!bg-red-400/20"
            >
              <Trash2 className="size-4" />
              Delete project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;