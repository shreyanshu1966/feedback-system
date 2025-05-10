import React from 'react';

const SubjectSelector = ({ subjects, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Subject</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Choose a subject...</option>
        {subjects.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectSelector;
