import React from 'react';
import SyllabusTemplate from '../../components/SyllabusTemplate';

const JavaSyllabus = () => {
  const subjectData = {
    title: 'Java Programming',
    description: 'Complete syllabus and study materials for Java Programming',
    content: (
      <div>
        <h2>Java Programming Syllabus</h2>
        
        <h3>📚 Beginner Level</h3>
        <ul>
          <li><strong>Java Fundamentals</strong>
            <ul>
              <li>Introduction to Java</li>
              <li>JDK, JRE, and JVM</li>
              <li>Variables and Data Types</li>
              <li>Operators and Expressions</li>
            </ul>
          </li>
          <li><strong>Control Structures</strong>
            <ul>
              <li>Conditional Statements</li>
              <li>Looping Statements</li>
              <li>Switch Case</li>
            </ul>
          </li>
        </ul>

        <h3>🎯 Intermediate Level</h3>
        <ul>
          <li><strong>Object-Oriented Programming</strong>
            <ul>
              <li>Classes and Objects</li>
              <li>Constructors and Methods</li>
              <li>Inheritance and Polymorphism</li>
              <li>Abstraction and Interfaces</li>
            </ul>
          </li>
          <li><strong>Exception Handling</strong>
            <ul>
              <li>Try-Catch Blocks</li>
              <li>Throw and Throws</li>
              <li>Custom Exceptions</li>
            </ul>
          </li>
        </ul>

        <h3>🚀 Advanced Level</h3>
        <ul>
          <li><strong>Collections Framework</strong>
            <ul>
              <li>List, Set, and Map Interfaces</li>
              <li>ArrayList, LinkedList, HashSet</li>
              <li>HashMap and TreeMap</li>
              <li>Iterators and Comparators</li>
            </ul>
          </li>
          <li><strong>Multithreading</strong>
            <ul>
              <li>Thread Life Cycle</li>
              <li>Creating Threads</li>
              <li>Synchronization</li>
              <li>Thread Pools</li>
            </ul>
          </li>
        </ul>

        <h3>📋 Practical Projects</h3>
        <ul>
          <li>Banking Application</li>
          <li>Library Management System</li>
          <li>Multi-threaded Applications</li>
          <li>JDBC Database Connectivity</li>
        </ul>

        <h3>🔧 Advanced Technologies</h3>
        <ul>
          <li>Java Swing (GUI)</li>
          <li>JDBC Database Connectivity</li>
          <li>Java Servlets and JSP</li>
          <li>Spring Framework Basics</li>
        </ul>
      </div>
    )
  };

  return <SyllabusTemplate subjectData={subjectData} />;
};

export default JavaSyllabus;