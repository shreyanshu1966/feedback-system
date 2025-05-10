import React from 'react';

const SubjectManager = () => {
  // Define subjects array with "Math," "English," and "Coding"
  const subjects = [
    { id: 'math', name: 'Math', criteria: ['Approach', 'Calculation', 'Presentation'] },
    { id: 'english', name: 'English', criteria: ['Grammar', 'Content', 'Creativity'] },
    { id: 'coding', name: 'Coding', criteria: ['Logic', 'Efficiency', 'Readability'] },
  ];

  // Generate system prompt based on selected subject
  const generateSystemPrompt = (subject) => {
    const subjectInfo = subjects.find((s) => s.id === subject);
    return `You are an expert ${subjectInfo.name} instructor who provides detailed feedback. 
    Evaluate submissions based on these criteria: ${subjectInfo.criteria.join(', ')}. 
    For each criterion, identify the exact part of the student's text that is most relevant (good or needs improvement) and provide the start and end character indices ("highlightSpan": {"start": number, "end": number}) for that part. 
    Provide specific, actionable feedback and suggestions for improvement.
    Format your response as valid JSON with the following structure:
    {
      "score": (overall percentage score),
      "summary": (brief overall assessment),
      "criteriaFeedback": [
        {
          "criterion": (criterion name),
          "score": (percentage score),
          "feedback": (specific feedback for this criterion),
          "highlightSpan": { "start": (number), "end": (number) }
        }
      ],
      "suggestions": [(array of specific improvement suggestions)]
    }
    Important: Always return valid JSON, do not include markdown code blocks.`;
  };

  return { subjects, generateSystemPrompt };
};

export default SubjectManager;
