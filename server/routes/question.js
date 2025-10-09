const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Validation rules
const generateQuestionsValidation = [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('topic')
    .notEmpty()
    .withMessage('Topic is required'),
  body('questionType')
    .isIn(['MCQ', 'coding', 'network', 'sql', 'chatbot'])
    .withMessage('Invalid question type'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('count')
    .isInt({ min: 1, max: 20 })
    .withMessage('Count must be between 1 and 20')
];

// @route   POST /api/questions/generate
// @desc    Generate questions using Google Gemini AI
// @access  Private
router.post('/generate', generateQuestionsValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { subject, topic, questionType, difficulty, count = 5 } = req.body;
  const user = req.user;

  try {
    // Create prompt based on question type
    const prompt = createPrompt(subject, topic, questionType, difficulty, count);
    
    // Generate questions using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the generated questions
    const questions = parseGeneratedQuestions(text, questionType);
    
    // Update user progress
    await user.updateProgress(false); // This will be updated when they answer
    
    res.json({
      status: 'success',
      message: 'Questions generated successfully',
      data: {
        questions,
        metadata: {
          subject,
          topic,
          questionType,
          difficulty,
          count: questions.length,
          generatedAt: new Date().toISOString(),
          userId: user._id
        }
      }
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate questions. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// @route   POST /api/questions/validate-answer
// @desc    Validate user answer and provide feedback
// @access  Private
router.post('/validate-answer', [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  body('answer')
    .notEmpty()
    .withMessage('Answer is required'),
  body('questionType')
    .isIn(['MCQ', 'coding', 'network', 'sql', 'chatbot'])
    .withMessage('Invalid question type')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { questionId, answer, questionType, question, correctAnswer } = req.body;
  const user = req.user;

  try {
    let isCorrect = false;
    let feedback = '';
    let explanation = '';

    // Validate answer based on question type
    switch (questionType) {
      case 'MCQ':
        isCorrect = answer === correctAnswer;
        feedback = isCorrect ? 'Correct!' : 'Incorrect.';
        break;
        
      case 'coding':
        // For coding questions, we'll use Gemini to evaluate the code
        const codePrompt = createCodeEvaluationPrompt(question, answer, correctAnswer);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(codePrompt);
        const response = await result.response;
        const evaluation = response.text();
        
        // Parse the evaluation result
        const evaluationResult = parseCodeEvaluation(evaluation);
        isCorrect = evaluationResult.isCorrect;
        feedback = evaluationResult.feedback;
        explanation = evaluationResult.explanation;
        break;
        
      case 'sql':
        // Similar to coding but for SQL queries
        const sqlPrompt = createSQLEvaluationPrompt(question, answer, correctAnswer);
        const sqlResult = await model.generateContent(sqlPrompt);
        const sqlResponse = await sqlResult.response;
        const sqlEvaluation = sqlResponse.text();
        
        const sqlEvaluationResult = parseSQLEvaluation(sqlEvaluation);
        isCorrect = sqlEvaluationResult.isCorrect;
        feedback = sqlEvaluationResult.feedback;
        explanation = sqlEvaluationResult.explanation;
        break;
        
      default:
        isCorrect = false;
        feedback = 'Answer validation not implemented for this question type.';
    }

    // Update user progress
    await user.updateProgress(isCorrect);

    res.json({
      status: 'success',
      data: {
        isCorrect,
        feedback,
        explanation,
        userStats: user.getStats()
      }
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate answer. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Helper function to create prompt for question generation
function createPrompt(subject, topic, questionType, difficulty, count) {
  const basePrompt = `Generate ${count} ${difficulty} level ${questionType} questions for the subject "${subject}" on the topic "${topic}".`;

  switch (questionType) {
    case 'MCQ':
      return `${basePrompt}
      
      Format each question as:
      {
        "id": "unique_id",
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "Explanation of the correct answer"
      }
      
      Return only valid JSON array.`;
      
    case 'coding':
      return `${basePrompt}
      
      Format each question as:
      {
        "id": "unique_id",
        "question": "Coding problem description",
        "language": "python or c",
        "starterCode": "// Starter code here",
        "testCases": [
          {"input": "test_input", "output": "expected_output"}
        ],
        "correctAnswer": "Complete solution code",
        "explanation": "Explanation of the solution"
      }
      
      Return only valid JSON array.`;
      
    case 'sql':
      return `${basePrompt}
      
      Format each question as:
      {
        "id": "unique_id",
        "question": "SQL problem description with table schema",
        "correctAnswer": "SELECT statement",
        "explanation": "Explanation of the SQL query"
      }
      
      Return only valid JSON array.`;
      
    case 'network':
      return `${basePrompt}
      
      Format each question as:
      {
        "id": "unique_id",
        "question": "Network design problem",
        "correctAnswer": "Network configuration or design",
        "explanation": "Explanation of the network design"
      }
      
      Return only valid JSON array.`;
      
    default:
      return basePrompt;
  }
}

// Helper function to parse generated questions
function parseGeneratedQuestions(text, questionType) {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    // Validate and clean questions
    return questions.map((q, index) => ({
      id: q.id || `q_${Date.now()}_${index}`,
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      language: q.language || 'python',
      starterCode: q.starterCode || '',
      testCases: q.testCases || [],
      type: questionType
    }));
  } catch (error) {
    console.error('Error parsing generated questions:', error);
    throw new Error('Failed to parse generated questions');
  }
}

// Helper function to create code evaluation prompt
function createCodeEvaluationPrompt(question, userAnswer, correctAnswer) {
  return `Evaluate the following coding answer:

Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Please evaluate if the user's answer is correct and provide:
1. Is the answer correct? (true/false)
2. Feedback for the user
3. Explanation of the solution

Format your response as JSON:
{
  "isCorrect": true/false,
  "feedback": "Your feedback here",
  "explanation": "Detailed explanation here"
}`;
}

// Helper function to parse code evaluation
function parseCodeEvaluation(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        isCorrect: false,
        feedback: 'Unable to evaluate answer',
        explanation: 'Evaluation failed'
      };
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return {
      isCorrect: result.isCorrect || false,
      feedback: result.feedback || 'No feedback provided',
      explanation: result.explanation || 'No explanation provided'
    };
  } catch (error) {
    return {
      isCorrect: false,
      feedback: 'Error evaluating answer',
      explanation: 'Evaluation failed due to parsing error'
    };
  }
}

// Helper function to create SQL evaluation prompt
function createSQLEvaluationPrompt(question, userAnswer, correctAnswer) {
  return `Evaluate the following SQL answer:

Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Please evaluate if the user's SQL query is correct and provide:
1. Is the answer correct? (true/false)
2. Feedback for the user
3. Explanation of the solution

Format your response as JSON:
{
  "isCorrect": true/false,
  "feedback": "Your feedback here",
  "explanation": "Detailed explanation here"
}`;
}

// Helper function to parse SQL evaluation
function parseSQLEvaluation(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        isCorrect: false,
        feedback: 'Unable to evaluate SQL answer',
        explanation: 'Evaluation failed'
      };
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return {
      isCorrect: result.isCorrect || false,
      feedback: result.feedback || 'No feedback provided',
      explanation: result.explanation || 'No explanation provided'
    };
  } catch (error) {
    return {
      isCorrect: false,
      feedback: 'Error evaluating SQL answer',
      explanation: 'Evaluation failed due to parsing error'
    };
  }
}

module.exports = router; 