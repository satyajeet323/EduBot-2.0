import React from 'react';
import SyllabusTemplate from '../../components/SyllabusTemplate';

const CppSyllabus = () => {
  const subjectData = {
    title: 'C++ Programming',
    description: 'Complete syllabus and study materials for C++ Programming',
    content: (
      <div>
        <h2>C++ Programming Syllabus</h2>
        
        <h3>📚 Beginner Level</h3>
        <ul>
          <li><strong>C++ Basics</strong>
            <ul>
              <li>Introduction to C++</li>
              <li>Variables and Data Types</li>
              <li>Operators and Expressions</li>
              <li>Input/Output Operations</li>
            </ul>
          </li>
          <li><strong>Control Structures</strong>
            <ul>
              <li>Conditional Statements</li>
              <li>Looping Statements</li>
              <li>Switch Case</li>
              <li>Jump Statements</li>
            </ul>
          </li>
        </ul>

        <h3>🎯 Intermediate Level</h3>
        <ul>
          <li><strong>Functions and Arrays</strong>
            <ul>
              <li>Function Definition and Calling</li>
              <li>Function Overloading</li>
              <li>Arrays and Strings</li>
              <li>Pointers and References</li>
            </ul>
          </li>
          <li><strong>Object-Oriented Programming</strong>
            <ul>
              <li>Classes and Objects</li>
              <li>Constructors and Destructors</li>
              <li>Inheritance</li>
              <li>Polymorphism</li>
            </ul>
          </li>
        </ul>

        <h3>🚀 Advanced Level</h3>
        <ul>
          <li><strong>Advanced OOP Concepts</strong>
            <ul>
              <li>Operator Overloading</li>
              <li>Virtual Functions</li>
              <li>Abstract Classes</li>
              <li>Exception Handling</li>
            </ul>
          </li>
          <li><strong>STL and Templates</strong>
            <ul>
              <li>Function Templates</li>
              <li>Class Templates</li>
              <li>STL Containers</li>
              <li>STL Algorithms</li>
            </ul>
          </li>
        </ul>

        <h3>📋 Practical Projects</h3>
        <ul>
          <li>Student Record System</li>
          <li>Banking Application</li>
          <li>Game Development Basics</li>
          <li>Data Structures Implementation</li>
        </ul>

        <h3>🔧 Advanced Topics</h3>
        <ul>
          <li>File Handling</li>
          <li>Multithreading</li>
          <li>Network Programming</li>
          <li>GUI Programming with Qt</li>
        </ul>
      </div>
    )
  };

  return <SyllabusTemplate subjectData={subjectData} />;
};

export default CppSyllabus;