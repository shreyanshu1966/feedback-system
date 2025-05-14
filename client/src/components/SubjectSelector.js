import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Lock, BookOpen, Code, Pencil, Clock, Beaker, Sparkles } from 'lucide-react';

const SubjectSelector = ({ subjects, value, onChange, disabled = false, onAddSubject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newCriteria, setNewCriteria] = useState(['']);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleSelectSubject = (subjectId) => {
    if (disabled) return;
    onChange({ target: { value: subjectId } });
    setIsOpen(false);
  };

  // Add subject modal handlers
  const handleAddCriteriaField = () => setNewCriteria([...newCriteria, '']);
  const handleCriteriaChange = (idx, val) => {
    const updated = [...newCriteria];
    updated[idx] = val;
    setNewCriteria(updated);
  };
  const handleRemoveCriteria = (idx) => {
    if (newCriteria.length === 1) return;
    setNewCriteria(newCriteria.filter((_, i) => i !== idx));
  };
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || newCriteria.some(c => !c.trim())) return;
    const id = onAddSubject(newSubjectName.trim(), newCriteria.map(c => c.trim()));
    setShowAddModal(false);
    setNewSubjectName('');
    setNewCriteria(['']);
    setIsOpen(false);
    // Select the new subject
    onChange({ target: { value: id } });
  };

  // Find the currently selected subject
  const selectedSubject = subjects.find(sub => sub.id === value);

  // Get icon based on subject
  const getSubjectIcon = (subjectId) => {
    switch(subjectId) {
      case 'math':
        return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'english':
        return <Pencil className="w-6 h-6 text-indigo-500" />;
      case 'coding':
        return <Code className="w-6 h-6 text-green-500" />;
      case 'history':
        return <Clock className="w-6 h-6 text-amber-500" />;
      case 'science':
        return <Beaker className="w-6 h-6 text-purple-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Subject selection button */}
      <button
        type="button"
        className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-800 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          {selectedSubject ? (
            <>
              {/* Optionally add icon here */}
              <span>{selectedSubject.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Select subject...</span>
          )}
        </span>
        <ChevronDown className="w-5 h-5 ml-2 text-gray-500" />
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-[1000] animate-fadeIn"
          style={{ zIndex: 1000 }}
        >
          <ul className="max-h-60 overflow-y-auto py-2">
            {subjects.map(subject => (
              <li
                key={subject.id}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${value === subject.id ? 'bg-blue-100 font-semibold' : ''}`}
                onClick={() => handleSelectSubject(subject.id)}
                role="option"
                aria-selected={value === subject.id}
              >
                <span>{subject.name}</span>
                {value === subject.id && <Check className="w-4 h-4 text-blue-600" />}
              </li>
            ))}
            <li className="px-4 py-3 cursor-pointer text-blue-600 hover:bg-blue-50 font-medium" onClick={() => setShowAddModal(true)}>
              + Add new subject & rubric
            </li>
          </ul>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative z-[1200]">
            <h3 className="text-lg font-bold mb-4">Add New Subject & Custom Rubric</h3>
            <form onSubmit={handleAddSubject}>
              <label className="block mb-2 font-medium">Subject Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                required
              />
              <label className="block mb-2 font-medium">Rubric Criteria</label>
              {newCriteria.map((crit, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2 focus:ring-2 focus:ring-blue-500"
                    value={crit}
                    onChange={e => handleCriteriaChange(idx, e.target.value)}
                    required
                  />
                  {newCriteria.length > 1 && (
                    <button type="button" className="text-red-500 px-2" onClick={() => handleRemoveCriteria(idx)}>&times;</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-blue-600 font-medium mb-4" onClick={handleAddCriteriaField}>+ Add another criterion</button>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold">Add Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SubjectSelector;
