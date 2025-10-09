import React from 'react';
import SyllabusTemplate from '../../components/SyllabusTemplate';

const DBMSSyllabus = () => {
  const subjectData = {
    title: 'Database Management System',
    description: 'Complete theoretical and practical knowledge of database concepts and implementation',
    content: (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>DBMS Complete Syllabus</h2>
        <p className="lead">Master database design, implementation, and management with practical SQL examples</p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg my-6">
          <h3 className="text-blue-800 dark:text-blue-200">🎯 Learning Objectives</h3>
          <ul className="list-disc list-inside">
            <li>Design normalized database schemas</li>
            <li>Write complex SQL queries and optimize performance</li>
            <li>Implement transaction management and concurrency control</li>
            <li>Administer and secure database systems</li>
          </ul>
        </div>

        <h3>📚 Beginner Level - Database Fundamentals</h3>
        
        <h4>1. Introduction to DBMS</h4>
        <p><strong>Theory:</strong> Database Management Systems organize data efficiently using tables, relationships, and constraints. They provide ACID properties (Atomicity, Consistency, Isolation, Durability) and overcome limitations of file-based systems through data independence and reduced redundancy.</p>
        <p><strong>Practical:</strong> Install MySQL/PostgreSQL, create your first database, and practice basic CRUD operations using both command line and GUI tools.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Create a student database with tables for students, courses, and enrollments. Insert sample data and perform simple queries.
        </div>

        <h4>2. Entity-Relationship Model</h4>
        <p><strong>Theory:</strong> ER modeling represents real-world entities and their relationships graphically. Entities become tables, attributes become columns, and relationships define how tables connect. Cardinality (1:1, 1:N, M:N) determines relationship rules.</p>
        <p><strong>Practical:</strong> Use tools like Lucidchart or Draw.io to create ER diagrams for various business scenarios, then convert them to physical database schemas.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Design an ER diagram for a library system with entities for books, members, loans, and publishers with appropriate relationships.
        </div>

        <h4>3. Relational Algebra</h4>
        <p><strong>Theory:</strong> Relational algebra provides theoretical foundation for database operations using operators like selection (σ), projection (π), join (⨝), union (∪), and difference (−). These operations form the basis for SQL query processing.</p>
        <p><strong>Practical:</strong> Write relational algebra expressions for various query requirements, then implement equivalent SQL queries to understand the translation process.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Express "find students who scored more than 80 in Math" in relational algebra, then write the corresponding SQL query.
        </div>

        <h3>🎯 Intermediate Level - SQL Implementation</h3>
        
        <h4>4. SQL Fundamentals</h4>
        <p><strong>Theory:</strong> Structured Query Language (SQL) includes DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), DCL (GRANT, REVOKE), and TCL (COMMIT, ROLLBACK) statements. Understanding data types, constraints, and operators is essential.</p>
        <p><strong>Practical:</strong> Practice writing complex queries with WHERE clauses, ORDER BY, GROUP BY, HAVING, and various SQL functions for string, numeric, and date operations.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Write a query to find the average salary by department where average is greater than 50000, ordered from highest to lowest.
        </div>

        <h4>5. Joins and Subqueries</h4>
        <p><strong>Theory:</strong> JOIN operations combine data from multiple tables. INNER JOIN returns matching records, LEFT/RIGHT JOIN return all records from one side, FULL JOIN returns all records. Subqueries can be correlated or non-correlated.</p>
        <p><strong>Practical:</strong> Practice different join types on sample databases and compare performance. Use subqueries in SELECT, FROM, and WHERE clauses.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Find employees who earn more than their department average using both join and subquery approaches.
        </div>

        <h4>6. Database Normalization</h4>
        <p><strong>Theory:</strong> Normalization eliminates data redundancy and anomalies through normal forms (1NF, 2NF, 3NF, BCNF). Each normal form addresses specific types of redundancy and dependency issues while maintaining data integrity.</p>
        <p><strong>Practical:</strong> Take unnormalized data through each normal form step by step, creating appropriate tables and relationships at each stage.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Normalize a customer order dataset containing repeating groups and partial dependencies up to 3NF.
        </div>

        <h3>🚀 Advanced Level - Advanced Concepts</h3>
        
        <h4>7. Transaction Management</h4>
        <p><strong>Theory:</strong> Transactions ensure database consistency through ACID properties. Concurrency control manages simultaneous transactions using locking protocols (shared/exclusive locks) and timestamp ordering. Recovery techniques handle system failures.</p>
        <p><strong>Practical:</strong> Implement transactions with different isolation levels and observe how they handle concurrent access and maintain consistency.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Simulate concurrent bank transfers with and without proper transaction handling to demonstrate the need for ACID properties.
        </div>

        <h4>8. Indexing and Query Optimization</h4>
        <p><strong>Theory:</strong> Indexes (B-trees, hash indexes) improve query performance but add overhead for updates. Query optimization involves execution plan analysis, statistics collection, and appropriate index selection for efficient data retrieval.</p>
        <p><strong>Practical:</strong> Use EXPLAIN plans to analyze query performance, create appropriate indexes, and measure performance improvements on large datasets.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Create a million-record table, run queries without indexes, then add indexes and compare execution times and plan changes.
        </div>

        <h4>9. NoSQL Databases</h4>
        <p><strong>Theory:</strong> NoSQL databases (document, key-value, column-family, graph) handle unstructured data and provide horizontal scalability. They sacrifice some ACID properties for performance and flexibility in distributed environments.</p>
        <p><strong>Practical:</strong> Install MongoDB, create document collections, perform CRUD operations, and compare with relational database approaches.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Model product catalog data in both relational (MySQL) and document (MongoDB) formats and compare query approaches.
        </div>

        <h3>📋 Hands-On Laboratory Exercises</h3>
        <ol className="list-decimal list-inside">
          <li><strong>Database Design:</strong> Create normalized database schemas from business requirements</li>
          <li><strong>SQL Programming:</strong> Write complex queries, stored procedures, and functions</li>
          <li><strong>Transaction Practice:</strong> Implement and test ACID properties with concurrent transactions</li>
          <li><strong>Performance Tuning:</strong> Optimize queries using indexes and execution plan analysis</li>
          <li><strong>Backup and Recovery:</strong> Implement database backup strategies and recovery procedures</li>
          <li><strong>Security Implementation:</strong> Configure user privileges and database security measures</li>
          <li><strong>NoSQL Implementation:</strong> Work with MongoDB for document-based data storage</li>
          <li><strong>Database Administration:</strong> Perform routine DBA tasks and maintenance operations</li>
        </ol>

        <h3>🔧 Tools & Technologies</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4>Database Systems:</h4>
            <ul className="list-disc list-inside">
              <li>MySQL</li>
              <li>PostgreSQL</li>
              <li>Oracle Database</li>
              <li>Microsoft SQL Server</li>
              <li>MongoDB</li>
            </ul>
          </div>
          <div>
            <h4>Development Tools:</h4>
            <ul className="list-disc list-inside">
              <li>MySQL Workbench</li>
              <li>pgAdmin</li>
              <li>SQL Server Management Studio</li>
              <li>MongoDB Compass</li>
              <li>DBeaver</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-6">
          <h4 className="text-green-800 dark:text-green-200">💡 Real-World Applications</h4>
          <ul className="list-disc list-inside">
            <li>E-commerce product catalogs and order management</li>
            <li>Banking and financial transaction systems</li>
            <li>Healthcare patient records management</li>
            <li>Social media user data and content storage</li>
            <li>IoT data collection and analysis systems</li>
          </ul>
        </div>
      </div>
    )
  };

  return <SyllabusTemplate subjectData={subjectData} />;
};

export default DBMSSyllabus;