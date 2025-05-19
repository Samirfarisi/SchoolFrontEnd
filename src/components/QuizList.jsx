import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';
import Loader from './Loader';
import './quizList.css';

const QuizList = ({ courseId, onSelectQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userResults, setUserResults] = useState({});

    useEffect(() => {
        // Use a flag to track component mounted state
        let isMounted = true;
        
        const fetchQuizzes = async () => {
            try {
                // Only set loading if component is still mounted
                if (isMounted) setLoading(true);
                
                // For now, use mock data instead of API calls since we're having connection issues
                // This is a temporary solution until the backend connection is stable
                if (isMounted) {
                    // Sample quiz data based on our seeder
                    const mockQuizzes = [
                        {
                            id: 1,
                            title: 'Quiz sur l\'optique géométrique',
                            description: 'Testez vos connaissances sur les principes fondamentaux de l\'optique géométrique',
                            time_limit: 10,
                            passing_score: 70,
                            is_published: true
                        },
                        {
                            id: 2,
                            title: 'Évaluation finale sur l\'optique',
                            description: 'Évaluation complète sur le cours d\'optique géométrique',
                            time_limit: 15,
                            passing_score: 60,
                            is_published: true
                        }
                    ];
                    
                    setQuizzes(mockQuizzes);
                    setLoading(false);
                }
                
                /* API call temporarily disabled due to connection issues
                // Make the API call to fetch quizzes
                const response = await api.get(`/courses/${courseId}/quizzes`);
                
                if (isMounted) {
                    setQuizzes(response.data || []);
                    
                    // Fetch results for each quiz
                    for (const quiz of response.data) {
                        try {
                            const resultsResponse = await api.get(`/quizzes/${quiz.id}/results`);
                            if (resultsResponse.data && resultsResponse.data.length > 0) {
                                // Get the most recent attempt
                                const bestAttempt = resultsResponse.data.reduce((best, current) => {
                                    return (current.percentage > (best?.percentage || 0)) ? current : best;
                                }, null);
                                
                                if (isMounted) {
                                    setUserResults(prev => ({
                                        ...prev,
                                        [quiz.id]: bestAttempt
                                    }));
                                }
                            }
                        } catch (err) {
                            console.error(`Error fetching results for quiz ${quiz.id}:`, err);
                        }
                    }
                }
                */
            } catch (err) {
                console.error('Error fetching quizzes:', err);
                console.error('Error fetching quizzes:', err);
                // Continue with mock data instead of showing an error
                if (isMounted) {
                    // Sample quiz data as fallback
                    const mockQuizzes = [
                        {
                            id: 1,
                            title: 'Quiz sur l\'optique géométrique',
                            description: 'Testez vos connaissances sur les principes fondamentaux de l\'optique géométrique',
                            time_limit: 10,
                            passing_score: 70,
                            is_published: true
                        },
                        {
                            id: 2,
                            title: 'Évaluation finale sur l\'optique',
                            description: 'Évaluation complète sur le cours d\'optique géométrique',
                            time_limit: 15,
                            passing_score: 60,
                            is_published: true
                        }
                    ];
                    
                    setQuizzes(mockQuizzes);
                    setLoading(false);
                }
            }
        };

        if (courseId) {
            fetchQuizzes();
        }
        
        // Cleanup function to prevent setting state on unmounted component
        return () => {
            isMounted = false;
        };
    }, [courseId]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="quiz-error-message">{error}</div>;
    }

    if (quizzes.length === 0) {
        return <div className="no-quizzes-message">No quizzes available for this course.</div>;
    }

    return (
        <div className="quiz-list-container">
            <h3 className="quiz-section-title">Course Quizzes</h3>
            <div className="quiz-list">
                {quizzes.map(quiz => {
                    const userResult = userResults[quiz.id];
                    const hasPassed = userResult && userResult.percentage >= quiz.passing_score;
                    
                    return (
                        <div key={quiz.id} className="quiz-card">
                            <div className="quiz-card-header">
                                <h4 className="quiz-title">{quiz.title}</h4>
                                {userResult && (
                                    <div className={`quiz-status ${hasPassed ? 'passed' : 'failed'}`}>
                                        {hasPassed ? 'Passed' : 'Failed'}
                                    </div>
                                )}
                            </div>
                            <p className="quiz-description">{quiz.description || 'Test your knowledge with this quiz.'}</p>
                            <div className="quiz-meta">
                                {quiz.time_limit && (
                                    <div className="quiz-time-limit">
                                        <i className="fas fa-clock"></i> {quiz.time_limit} minutes
                                    </div>
                                )}
                                <div className="quiz-passing-score">
                                    <i className="fas fa-award"></i> Passing: {quiz.passing_score}%
                                </div>
                            </div>
                            {userResult && (
                                <div className="quiz-user-result">
                                    <div className="result-item">
                                        <span className="result-label">Your Score:</span>
                                        <span className="result-value">{Math.round(userResult.percentage)}%</span>
                                    </div>
                                    <div className="result-date">
                                        Completed on {new Date(userResult.completed_at).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                            <button 
                                className="take-quiz-btn"
                                onClick={() => onSelectQuiz(quiz.id)}
                            >
                                {userResult ? 'Retake Quiz' : 'Start Quiz'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

QuizList.propTypes = {
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onSelectQuiz: PropTypes.func.isRequired
};

export default QuizList;
