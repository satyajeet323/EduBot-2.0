import React from 'react';
import SyllabusTemplate from '../../components/SyllabusTemplate';

const PythonSyllabus = () => {
  const subjectData = {
    title: 'Python Programming',
    description: 'Complete syllabus and study materials for Python Programming',
    content: (
      <div>
        <h2>Python Programming Syllabus</h2>
        
        <h3>📚 Beginner Level</h3>
        <ul>
          <li><strong>Python Basics</strong>
            <ul>
              <li>Introduction to Python</li>
              <li>Variables and Data Types</li>
              <li>Operators and Expressions</li>
              <li>Input and Output Operations</li>
            </ul>
          </li>
          <li><strong>Control Structures</strong>
            <ul>
              <li>Conditional Statements (if, elif, else)</li>
              <li>Looping Statements (for, while)</li>
              <li>Break, Continue, and Pass</li>
            </ul>
          </li>
        </ul>

        <h3>🎯 Intermediate Level</h3>
        <ul>
          <li><strong>Data Structures</strong>
            <ul>
              <li>Lists, Tuples, and Dictionaries</li>
              <li>Sets and Arrays</li>
              <li>List Comprehensions</li>
            </ul>
          </li>
          <li><strong>Functions and Modules</strong>
            <ul>
              <li>Function Definition and Calling</li>
              <li>Parameters and Arguments</li>
              <li>Lambda Functions</li>
              <li>Modules and Packages</li>
            </ul>
          </li>
        </ul>

        <h3>🚀 Advanced Level</h3>
        <ul>
          <li><strong>Object-Oriented Programming</strong>
            <ul>
              <li>Classes and Objects</li>
              <li>Inheritance and Polymorphism</li>
              <li>Encapsulation and Abstraction</li>
              <li>Magic Methods</li>
            </ul>
          </li>
          <li><strong>Advanced Topics</strong>
            <ul>
              <li>Exception Handling</li>
              <li>File Handling</li>
              <li>Regular Expressions</li>
              <li>Database Connectivity</li>
            </ul>
          </li>
        </ul>

        <h3>📋 Practical Projects</h3>
        <ul>
          <li>Calculator Application</li>
          <li>Student Management System</li>
          <li>Web Scraping Project</li>
          <li>Data Analysis with Pandas</li>
        </ul>

        <h3>🔧 Libraries & Frameworks</h3>
        <ul>
          <li>NumPy and Pandas</li>
          <li>Matplotlib and Seaborn</li>
          <li>Django/Flask</li>
          <li>Requests and BeautifulSoup</li>
        </ul>
      </div>
    )
  };

  return <SyllabusTemplate subjectData={subjectData} />;
};

export default PythonSyllabus;