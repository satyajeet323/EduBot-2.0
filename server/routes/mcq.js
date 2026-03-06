const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/mcq/generate
// @desc    Generate 10 MCQ questions for a subject
// @access  Private
router.post('/generate', [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { subject, difficulty = 'intermediate' } = req.body;

  const prompt = `Generate exactly 10 UNIQUE and DIFFERENT multiple choice questions about ${subject} at ${difficulty} level.

IMPORTANT: Each question MUST be completely different from the others. Do NOT repeat questions or create similar variations.

Format each question EXACTLY as follows:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]

Q2: [Question text]
...and so on for all 10 questions.

Requirements:
- All 10 questions must be UNIQUE and cover DIFFERENT topics within ${subject}
- Make questions practical, relevant, and educational
- Ensure correct answers are accurate
- Provide clear explanations
- Avoid repetition or similar questions`;

  try {
    console.log('Generating MCQ questions for:', subject, 'at', difficulty, 'level');
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini API Response received, length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));
    
    const questions = parseGeminiMCQResponse(text);
    
    console.log('Parsed questions count:', questions.length);
    
    if (questions.length < 10) {
      console.error('Not enough questions parsed. Got:', questions.length);
      console.error('Full response:', text);
      
      // Fallback: Generate sample questions if parsing fails
      const fallbackQuestions = generateFallbackQuestions(subject, 10);
      
      return res.json({
        status: 'success',
        data: {
          questions: fallbackQuestions,
          subject,
          difficulty,
          totalQuestions: 10,
          fallback: true
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        questions: questions.slice(0, 10),
        subject,
        difficulty,
        totalQuestions: 10
      }
    });
  } catch (error) {
    console.error('MCQ Generation Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Fallback: Return sample questions on error
    const fallbackQuestions = generateFallbackQuestions(subject, 10);
    
    return res.json({
      status: 'success',
      data: {
        questions: fallbackQuestions,
        subject,
        difficulty,
        totalQuestions: 10,
        fallback: true
      }
    });
  }
}));

// @route   POST /api/mcq/submit
// @desc    Submit MCQ exam and calculate score
// @access  Private
router.post('/submit', [
  body('subject').notEmpty(),
  body('answers').isArray().withMessage('Answers must be an array'),
  body('totalQuestions').isInt({ min: 1 }),
  body('timeTaken').optional().isInt({ min: 0 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { subject, answers, totalQuestions, timeTaken } = req.body;
  const user = req.user;

  const correctCount = answers.filter(a => a.isCorrect).length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  
  // Calculate points based on score
  let pointsEarned = 0;
  if (score >= 90) pointsEarned = 50;
  else if (score >= 80) pointsEarned = 40;
  else if (score >= 70) pointsEarned = 30;
  else if (score >= 60) pointsEarned = 20;
  else if (score >= 50) pointsEarned = 10;

  // Update user progress
  user.progress.totalQuestions += totalQuestions;
  user.progress.correctAnswers += correctCount;
  user.progress.points += pointsEarned;
  user.progress.questionsToday += totalQuestions;

  // Update level based on points
  const oldLevel = user.level;
  if (user.progress.points >= 1000) user.level = 5;
  else if (user.progress.points >= 500) user.level = 4;
  else if (user.progress.points >= 250) user.level = 3;
  else if (user.progress.points >= 100) user.level = 2;
  else user.level = 1;

  const leveledUp = user.level > oldLevel;

  // Add to quiz history
  user.quizHistory.push({
    subject,
    score: correctCount,
    totalQuestions,
    task: `MCQ Exam - ${subject}`,
    performanceScore: Math.min(5, Math.ceil(score / 20)),
    pointsAwarded: pointsEarned,
    meta: { timeTaken, difficulty: 'intermediate' }
  });

  await user.save();

  res.json({
    status: 'success',
    data: {
      score,
      correctCount,
      totalQuestions,
      pointsEarned,
      totalPoints: user.progress.points,
      level: user.level,
      leveledUp,
      accuracy: user.accuracyPercentage
    }
  });
}));

function parseGeminiMCQResponse(text) {
  const questions = [];
  
  // Try multiple parsing strategies
  
  // Strategy 1: Split by Q1:, Q2:, etc.
  let questionBlocks = text.split(/Q\d+:/i).filter(block => block.trim());
  
  // Strategy 2: If strategy 1 fails, try splitting by numbered questions like "1.", "2.", etc.
  if (questionBlocks.length < 2) {
    questionBlocks = text.split(/\n\d+\.\s+/).filter(block => block.trim());
  }
  
  // Strategy 3: If still failing, try splitting by double newlines
  if (questionBlocks.length < 2) {
    questionBlocks = text.split(/\n\n+/).filter(block => block.trim() && block.includes('A)'));
  }

  console.log('Question blocks found:', questionBlocks.length);

  questionBlocks.forEach((block, index) => {
    try {
      const lines = block.trim().split('\n').filter(l => l.trim());
      
      if (lines.length < 5) return; // Need at least question + 4 options
      
      let questionText = lines[0].trim();
      // Remove any leading numbers or special chars
      questionText = questionText.replace(/^\d+[\.\)]\s*/, '').trim();
      
      const options = [];
      let correctAnswer = '';
      let explanation = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Match options: A), A., a), a., (A), etc.
        const optionMatch = line.match(/^[\(\[]?([A-Da-d])[\)\.\]]\s*(.+)/);
        if (optionMatch) {
          const optionId = optionMatch[1].toUpperCase();
          const optionText = optionMatch[2].trim();
          if (optionText && !options.find(o => o.id === optionId)) {
            options.push({
              id: optionId,
              text: optionText
            });
          }
        } 
        // Match correct answer
        else if (line.match(/^(CORRECT|ANSWER|Correct Answer):/i)) {
          const answerMatch = line.match(/[A-Da-d]/);
          if (answerMatch) {
            correctAnswer = answerMatch[0].toUpperCase();
          }
        } 
        // Match explanation
        else if (line.match(/^(EXPLANATION|Explanation):/i)) {
          explanation = line.replace(/^(EXPLANATION|Explanation):\s*/i, '').trim();
        }
        // Continue explanation on next lines
        else if (explanation && !line.match(/^[A-Da-d][\)\.]/) && !line.match(/^Q\d+/i)) {
          explanation += ' ' + line;
        }
      }

      // Validate we have all required parts
      if (questionText && options.length === 4 && correctAnswer) {
        questions.push({
          id: questions.length + 1,
          question: questionText,
          options: options.slice(0, 4), // Ensure only 4 options
          correctAnswer,
          explanation: explanation || 'No explanation provided.'
        });
      } else {
        console.log(`Skipping incomplete question ${index + 1}:`, {
          hasQuestion: !!questionText,
          optionsCount: options.length,
          hasCorrectAnswer: !!correctAnswer
        });
      }
    } catch (err) {
      console.error('Error parsing question block:', err);
    }
  });

  return questions;
}

function generateFallbackQuestions(subject, count = 10) {
  const questionBank = {
    'computer-network': [
      {
        question: 'What does TCP stand for in networking?',
        options: [
          { id: 'A', text: 'Transmission Control Protocol' },
          { id: 'B', text: 'Transfer Control Protocol' },
          { id: 'C', text: 'Transport Connection Protocol' },
          { id: 'D', text: 'Transmission Connection Protocol' }
        ],
        correctAnswer: 'A',
        explanation: 'TCP stands for Transmission Control Protocol, which is a connection-oriented protocol.'
      },
      {
        question: 'Which layer of the OSI model is responsible for routing?',
        options: [
          { id: 'A', text: 'Data Link Layer' },
          { id: 'B', text: 'Network Layer' },
          { id: 'C', text: 'Transport Layer' },
          { id: 'D', text: 'Session Layer' }
        ],
        correctAnswer: 'B',
        explanation: 'The Network Layer (Layer 3) is responsible for routing packets across networks.'
      },
      {
        question: 'What is the default port number for HTTP?',
        options: [
          { id: 'A', text: '21' },
          { id: 'B', text: '22' },
          { id: 'C', text: '80' },
          { id: 'D', text: '443' }
        ],
        correctAnswer: 'C',
        explanation: 'HTTP uses port 80 by default, while HTTPS uses port 443.'
      },
      {
        question: 'What does IP stand for in networking?',
        options: [
          { id: 'A', text: 'Internet Protocol' },
          { id: 'B', text: 'Internal Protocol' },
          { id: 'C', text: 'Internet Process' },
          { id: 'D', text: 'Internal Process' }
        ],
        correctAnswer: 'A',
        explanation: 'IP stands for Internet Protocol, which is used for addressing and routing packets.'
      },
      {
        question: 'Which protocol is used for secure web browsing?',
        options: [
          { id: 'A', text: 'HTTP' },
          { id: 'B', text: 'FTP' },
          { id: 'C', text: 'HTTPS' },
          { id: 'D', text: 'SMTP' }
        ],
        correctAnswer: 'C',
        explanation: 'HTTPS (HTTP Secure) uses SSL/TLS encryption for secure web communication.'
      },
      {
        question: 'What is the maximum size of an IPv4 address?',
        options: [
          { id: 'A', text: '16 bits' },
          { id: 'B', text: '32 bits' },
          { id: 'C', text: '64 bits' },
          { id: 'D', text: '128 bits' }
        ],
        correctAnswer: 'B',
        explanation: 'IPv4 addresses are 32 bits long, typically written as four octets (e.g., 192.168.1.1).'
      },
      {
        question: 'Which device operates at the Network Layer?',
        options: [
          { id: 'A', text: 'Hub' },
          { id: 'B', text: 'Switch' },
          { id: 'C', text: 'Router' },
          { id: 'D', text: 'Bridge' }
        ],
        correctAnswer: 'C',
        explanation: 'Routers operate at Layer 3 (Network Layer) and make routing decisions based on IP addresses.'
      },
      {
        question: 'What does DNS stand for?',
        options: [
          { id: 'A', text: 'Domain Name System' },
          { id: 'B', text: 'Domain Network Service' },
          { id: 'C', text: 'Digital Name System' },
          { id: 'D', text: 'Digital Network Service' }
        ],
        correctAnswer: 'A',
        explanation: 'DNS (Domain Name System) translates domain names to IP addresses.'
      },
      {
        question: 'Which protocol is connectionless?',
        options: [
          { id: 'A', text: 'TCP' },
          { id: 'B', text: 'UDP' },
          { id: 'C', text: 'HTTP' },
          { id: 'D', text: 'FTP' }
        ],
        correctAnswer: 'B',
        explanation: 'UDP (User Datagram Protocol) is connectionless and does not guarantee delivery.'
      },
      {
        question: 'What is the purpose of a subnet mask?',
        options: [
          { id: 'A', text: 'To encrypt data' },
          { id: 'B', text: 'To divide IP networks into subnetworks' },
          { id: 'C', text: 'To compress data' },
          { id: 'D', text: 'To authenticate users' }
        ],
        correctAnswer: 'B',
        explanation: 'A subnet mask is used to divide an IP network into smaller subnetworks.'
      },
      {
        question: 'Which layer handles error detection and correction?',
        options: [
          { id: 'A', text: 'Physical Layer' },
          { id: 'B', text: 'Data Link Layer' },
          { id: 'C', text: 'Network Layer' },
          { id: 'D', text: 'Application Layer' }
        ],
        correctAnswer: 'B',
        explanation: 'The Data Link Layer (Layer 2) handles error detection and correction.'
      },
      {
        question: 'What is the default port for HTTPS?',
        options: [
          { id: 'A', text: '80' },
          { id: 'B', text: '443' },
          { id: 'C', text: '8080' },
          { id: 'D', text: '3306' }
        ],
        correctAnswer: 'B',
        explanation: 'HTTPS uses port 443 by default for secure web communication.'
      },
      {
        question: 'What does MAC stand for in networking?',
        options: [
          { id: 'A', text: 'Media Access Control' },
          { id: 'B', text: 'Machine Access Code' },
          { id: 'C', text: 'Memory Access Control' },
          { id: 'D', text: 'Multiple Access Control' }
        ],
        correctAnswer: 'A',
        explanation: 'MAC stands for Media Access Control, a unique identifier for network interfaces.'
      },
      {
        question: 'Which topology connects all devices to a central hub?',
        options: [
          { id: 'A', text: 'Bus Topology' },
          { id: 'B', text: 'Ring Topology' },
          { id: 'C', text: 'Star Topology' },
          { id: 'D', text: 'Mesh Topology' }
        ],
        correctAnswer: 'C',
        explanation: 'Star topology connects all devices to a central hub or switch.'
      },
      {
        question: 'What is the purpose of ARP?',
        options: [
          { id: 'A', text: 'To resolve IP addresses to MAC addresses' },
          { id: 'B', text: 'To route packets' },
          { id: 'C', text: 'To encrypt data' },
          { id: 'D', text: 'To compress files' }
        ],
        correctAnswer: 'A',
        explanation: 'ARP (Address Resolution Protocol) resolves IP addresses to MAC addresses.'
      }
    ],
    'database-management': [
      {
        question: 'What does SQL stand for?',
        options: [
          { id: 'A', text: 'Structured Query Language' },
          { id: 'B', text: 'Simple Query Language' },
          { id: 'C', text: 'Standard Query Language' },
          { id: 'D', text: 'Sequential Query Language' }
        ],
        correctAnswer: 'A',
        explanation: 'SQL stands for Structured Query Language, used for managing relational databases.'
      },
      {
        question: 'Which SQL command is used to retrieve data from a database?',
        options: [
          { id: 'A', text: 'GET' },
          { id: 'B', text: 'SELECT' },
          { id: 'C', text: 'RETRIEVE' },
          { id: 'D', text: 'FETCH' }
        ],
        correctAnswer: 'B',
        explanation: 'SELECT is the SQL command used to query and retrieve data from database tables.'
      },
      {
        question: 'What is a primary key?',
        options: [
          { id: 'A', text: 'A key that opens the database' },
          { id: 'B', text: 'A unique identifier for a record' },
          { id: 'C', text: 'A foreign key reference' },
          { id: 'D', text: 'An index column' }
        ],
        correctAnswer: 'B',
        explanation: 'A primary key uniquely identifies each record in a database table.'
      },
      {
        question: 'Which SQL clause is used to filter results?',
        options: [
          { id: 'A', text: 'FILTER' },
          { id: 'B', text: 'WHERE' },
          { id: 'C', text: 'HAVING' },
          { id: 'D', text: 'SELECT' }
        ],
        correctAnswer: 'B',
        explanation: 'The WHERE clause is used to filter records based on specified conditions.'
      },
      {
        question: 'What does ACID stand for in databases?',
        options: [
          { id: 'A', text: 'Atomicity, Consistency, Isolation, Durability' },
          { id: 'B', text: 'Access, Control, Integrity, Data' },
          { id: 'C', text: 'Authentication, Consistency, Isolation, Data' },
          { id: 'D', text: 'Atomicity, Control, Integrity, Durability' }
        ],
        correctAnswer: 'A',
        explanation: 'ACID represents the four key properties of database transactions.'
      },
      {
        question: 'Which command is used to add new data to a table?',
        options: [
          { id: 'A', text: 'ADD' },
          { id: 'B', text: 'INSERT' },
          { id: 'C', text: 'UPDATE' },
          { id: 'D', text: 'CREATE' }
        ],
        correctAnswer: 'B',
        explanation: 'INSERT is used to add new rows of data into a database table.'
      },
      {
        question: 'What is normalization in databases?',
        options: [
          { id: 'A', text: 'Making data normal' },
          { id: 'B', text: 'Organizing data to reduce redundancy' },
          { id: 'C', text: 'Encrypting data' },
          { id: 'D', text: 'Backing up data' }
        ],
        correctAnswer: 'B',
        explanation: 'Normalization is the process of organizing data to minimize redundancy and dependency.'
      },
      {
        question: 'Which JOIN returns all records from both tables?',
        options: [
          { id: 'A', text: 'INNER JOIN' },
          { id: 'B', text: 'LEFT JOIN' },
          { id: 'C', text: 'RIGHT JOIN' },
          { id: 'D', text: 'FULL OUTER JOIN' }
        ],
        correctAnswer: 'D',
        explanation: 'FULL OUTER JOIN returns all records from both tables, with NULLs where there is no match.'
      },
      {
        question: 'What is an index in a database?',
        options: [
          { id: 'A', text: 'A table of contents' },
          { id: 'B', text: 'A data structure that improves query speed' },
          { id: 'C', text: 'A backup file' },
          { id: 'D', text: 'A user permission' }
        ],
        correctAnswer: 'B',
        explanation: 'An index is a data structure that improves the speed of data retrieval operations.'
      },
      {
        question: 'Which SQL command removes all records from a table?',
        options: [
          { id: 'A', text: 'DELETE' },
          { id: 'B', text: 'DROP' },
          { id: 'C', text: 'TRUNCATE' },
          { id: 'D', text: 'REMOVE' }
        ],
        correctAnswer: 'C',
        explanation: 'TRUNCATE removes all records from a table quickly without logging individual row deletions.'
      },
      {
        question: 'What is a foreign key?',
        options: [
          { id: 'A', text: 'A key from another country' },
          { id: 'B', text: 'A field that links to a primary key in another table' },
          { id: 'C', text: 'An encrypted key' },
          { id: 'D', text: 'A backup key' }
        ],
        correctAnswer: 'B',
        explanation: 'A foreign key is a field that creates a link between two tables by referencing a primary key.'
      },
      {
        question: 'Which SQL function returns the number of rows?',
        options: [
          { id: 'A', text: 'SUM()' },
          { id: 'B', text: 'COUNT()' },
          { id: 'C', text: 'AVG()' },
          { id: 'D', text: 'MAX()' }
        ],
        correctAnswer: 'B',
        explanation: 'COUNT() returns the number of rows that match a specified condition.'
      },
      {
        question: 'What does DDL stand for?',
        options: [
          { id: 'A', text: 'Data Definition Language' },
          { id: 'B', text: 'Data Description Language' },
          { id: 'C', text: 'Database Definition Language' },
          { id: 'D', text: 'Data Development Language' }
        ],
        correctAnswer: 'A',
        explanation: 'DDL (Data Definition Language) includes commands like CREATE, ALTER, and DROP.'
      },
      {
        question: 'Which clause is used to sort query results?',
        options: [
          { id: 'A', text: 'SORT BY' },
          { id: 'B', text: 'ORDER BY' },
          { id: 'C', text: 'GROUP BY' },
          { id: 'D', text: 'ARRANGE BY' }
        ],
        correctAnswer: 'B',
        explanation: 'ORDER BY is used to sort the result set in ascending or descending order.'
      },
      {
        question: 'What is a view in SQL?',
        options: [
          { id: 'A', text: 'A physical table' },
          { id: 'B', text: 'A virtual table based on a query' },
          { id: 'C', text: 'A backup copy' },
          { id: 'D', text: 'A user interface' }
        ],
        correctAnswer: 'B',
        explanation: 'A view is a virtual table created by a stored query that can be used like a regular table.'
      }
    ],
    'python': [
      {
        question: 'Which keyword is used to define a function in Python?',
        options: [
          { id: 'A', text: 'function' },
          { id: 'B', text: 'def' },
          { id: 'C', text: 'func' },
          { id: 'D', text: 'define' }
        ],
        correctAnswer: 'B',
        explanation: 'The "def" keyword is used to define functions in Python.'
      },
      {
        question: 'What is the output of: print(type([]))?',
        options: [
          { id: 'A', text: '<class \'list\'>' },
          { id: 'B', text: '<class \'array\'>' },
          { id: 'C', text: '<class \'tuple\'>' },
          { id: 'D', text: '<class \'dict\'>' }
        ],
        correctAnswer: 'A',
        explanation: '[] creates an empty list in Python, so type([]) returns <class \'list\'>.'
      },
      {
        question: 'Which data type is immutable in Python?',
        options: [
          { id: 'A', text: 'List' },
          { id: 'B', text: 'Dictionary' },
          { id: 'C', text: 'Tuple' },
          { id: 'D', text: 'Set' }
        ],
        correctAnswer: 'C',
        explanation: 'Tuples are immutable, meaning their values cannot be changed after creation.'
      },
      {
        question: 'What does PEP 8 define?',
        options: [
          { id: 'A', text: 'Python syntax rules' },
          { id: 'B', text: 'Python style guide' },
          { id: 'C', text: 'Python version' },
          { id: 'D', text: 'Python libraries' }
        ],
        correctAnswer: 'B',
        explanation: 'PEP 8 is the style guide for Python code, defining coding conventions.'
      },
      {
        question: 'Which method is used to add an element to a list?',
        options: [
          { id: 'A', text: 'add()' },
          { id: 'B', text: 'append()' },
          { id: 'C', text: 'insert()' },
          { id: 'D', text: 'push()' }
        ],
        correctAnswer: 'B',
        explanation: 'The append() method adds an element to the end of a list.'
      },
      {
        question: 'What is the correct way to create a dictionary?',
        options: [
          { id: 'A', text: 'd = []' },
          { id: 'B', text: 'd = ()' },
          { id: 'C', text: 'd = {}' },
          { id: 'D', text: 'd = <>' }
        ],
        correctAnswer: 'C',
        explanation: 'Curly braces {} are used to create an empty dictionary in Python.'
      },
      {
        question: 'Which operator is used for floor division?',
        options: [
          { id: 'A', text: '/' },
          { id: 'B', text: '//' },
          { id: 'C', text: '%' },
          { id: 'D', text: '**' }
        ],
        correctAnswer: 'B',
        explanation: 'The // operator performs floor division, returning the integer part of the division.'
      },
      {
        question: 'What is a lambda function?',
        options: [
          { id: 'A', text: 'A named function' },
          { id: 'B', text: 'An anonymous function' },
          { id: 'C', text: 'A class method' },
          { id: 'D', text: 'A built-in function' }
        ],
        correctAnswer: 'B',
        explanation: 'A lambda function is a small anonymous function defined with the lambda keyword.'
      },
      {
        question: 'Which module is used for regular expressions?',
        options: [
          { id: 'A', text: 'regex' },
          { id: 'B', text: 're' },
          { id: 'C', text: 'regexp' },
          { id: 'D', text: 'pattern' }
        ],
        correctAnswer: 'B',
        explanation: 'The "re" module provides regular expression matching operations in Python.'
      },
      {
        question: 'What does the "self" parameter represent?',
        options: [
          { id: 'A', text: 'The class itself' },
          { id: 'B', text: 'The instance of the class' },
          { id: 'C', text: 'A global variable' },
          { id: 'D', text: 'A static method' }
        ],
        correctAnswer: 'B',
        explanation: 'The "self" parameter refers to the instance of the class in Python methods.'
      },
      {
        question: 'Which statement is used to handle exceptions?',
        options: [
          { id: 'A', text: 'catch' },
          { id: 'B', text: 'except' },
          { id: 'C', text: 'error' },
          { id: 'D', text: 'handle' }
        ],
        correctAnswer: 'B',
        explanation: 'The "except" statement is used to catch and handle exceptions in Python.'
      },
      {
        question: 'What is the output of: print(3 ** 2)?',
        options: [
          { id: 'A', text: '6' },
          { id: 'B', text: '9' },
          { id: 'C', text: '5' },
          { id: 'D', text: '8' }
        ],
        correctAnswer: 'B',
        explanation: 'The ** operator is used for exponentiation, so 3 ** 2 equals 9.'
      },
      {
        question: 'Which method converts a string to lowercase?',
        options: [
          { id: 'A', text: 'toLower()' },
          { id: 'B', text: 'lowercase()' },
          { id: 'C', text: 'lower()' },
          { id: 'D', text: 'caseLower()' }
        ],
        correctAnswer: 'C',
        explanation: 'The lower() method returns a copy of the string converted to lowercase.'
      },
      {
        question: 'What is list comprehension?',
        options: [
          { id: 'A', text: 'A way to understand lists' },
          { id: 'B', text: 'A concise way to create lists' },
          { id: 'C', text: 'A list method' },
          { id: 'D', text: 'A list property' }
        ],
        correctAnswer: 'B',
        explanation: 'List comprehension provides a concise way to create lists based on existing lists.'
      },
      {
        question: 'Which keyword is used to import modules?',
        options: [
          { id: 'A', text: 'include' },
          { id: 'B', text: 'require' },
          { id: 'C', text: 'import' },
          { id: 'D', text: 'use' }
        ],
        correctAnswer: 'C',
        explanation: 'The "import" keyword is used to import modules in Python.'
      }
    ]
  };

  // Get subject-specific questions or use computer-network as default
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '-');
  let availableQuestions = questionBank[subjectKey] || questionBank['computer-network'];
  
  // Shuffle the questions to get random selection
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  
  // Take only the number of questions needed
  const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
  
  // If we need more questions than available, generate variations
  const questions = [];
  for (let i = 0; i < count; i++) {
    const template = selectedQuestions[i % selectedQuestions.length];
    questions.push({
      id: i + 1,
      question: template.question,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation
    });
  }
  
  return questions;
}

module.exports = router;
