import React from 'react';
import SyllabusTemplate from '../../components/SyllabusTemplate';

const CSyllabus = () => {
  const subjectData = {
    title: 'C Programming',
    description: 'Complete syllabus and study materials for C Programming',
    content: (
      <div>
        <h2>C Programming Syllabus</h2>
        
        <h3>📚 Beginner Level</h3>
        <ul>
          <li><strong>C Language Fundamentals</strong>
            <ul>
              <li>Introduction to C Programming</li>
              <li>Structure of C Program</li>
              <li>Variables and Data Types</li>
              <li>Constants and Literals</li>
            </ul>
          </li>
          <li><strong>Operators and Expressions</strong>
            <ul>
              <li>Arithmetic Operators</li>
              <li>Relational and Logical Operators</li>
              <li>Bitwise Operators</li>
              <li>Operator Precedence</li>
            </ul>
          </li>
        </ul>

        <h3>🎯 Intermediate Level</h3>
        <ul>
          <li><strong>Control Structures</strong>
            <ul>
              <li>Conditional Statements (if, switch)</li>
              <li>Looping Statements (for, while, do-while)</li>
              <li>Break and Continue</li>
              <li>Goto Statement</li>
            </ul>
          </li>
          <li><strong>Functions and Arrays</strong>
            <ul>
              <li>Function Definition and Calling</li>
              <li>Function Prototypes</li>
              <li>Arrays and Strings</li>
              <li>Multi-dimensional Arrays</li>
            </ul>
          </li>
        </ul>

        <h3>🚀 Advanced Level</h3>
        <ul>
          <li><strong>Pointers and Memory Management</strong>
            <ul>
              <li>Pointer Basics</li>
              <li>Pointer Arithmetic</li>
              <li>Pointers and Arrays</li>
              <li>Dynamic Memory Allocation</li>
            </ul>
          </li>
          <li><strong>Structures and File Handling</strong>
            <ul>
              <li>Structures and Unions</li>
              <li>File Operations</li>
              <li>File I/O Functions</li>
              <li>Error Handling</li>
            </ul>
          </li>
        </ul>

        <h3>📋 Practical Projects</h3>
        <ul>
          <li>Calculator Program</li>
          <li>Student Database System</li>
          <li>File Management System</li>
          <li>Data Structures Implementation</li>
        </ul>

        <h3>🔧 Advanced Concepts</h3>
        <ul>
          <li>Preprocessor Directives</li>
          <li>Command Line Arguments</li>
          <li>Memory Management Techniques</li>
          <li>Data Structures and Algorithms</li>
        </ul>

        <h3>🎯 Real-world Applications</h3>
        <ul>
          <li>System Programming</li>
          <li>Embedded Systems</li>
          <li>Game Development</li>
          <li>Operating System Development</li>
        </ul>
      </div>
    )
  };

  return <SyllabusTemplate subjectData={subjectData} />;
};

export default CSyllabus;