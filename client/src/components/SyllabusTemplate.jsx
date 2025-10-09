import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Printer } from 'lucide-react';

const SyllabusTemplate = ({ subjectData }) => {
  const { subject } = useParams();

  if (!subjectData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subject not found</h2>
          <Link to="/subjects" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Subjects
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/subjects"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{subjectData.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{subjectData.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Print Syllabus"
              >
                <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => alert('Download feature coming soon!')}
                className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Download Syllabus"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Syllabus Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {subjectData.content}
          </div>
        </div>

        {/* Practice Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Ready to practice {subjectData.title}?
          </h3>
          <Link
            to={`/questions?subject=${subject}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Start Practice Session
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SyllabusTemplate;