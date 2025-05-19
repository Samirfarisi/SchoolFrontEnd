import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';
import QuizQuestion from './QuizQuestion';
import './quiz.css';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const Quiz = ({ quizId, onComplete, courseId }) => {
    const { user } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizAttempt, setQuizAttempt] = useState(null);
    const [quizResults, setQuizResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timer, setTimer] = useState(null);

    // Fetch quiz data (using mock data for now)
    useEffect(() => {
        const loadQuiz = async () => {
            setLoading(true);
            try {
                // Use mock data instead of API call
                const mockQuiz = {
                    id: quizId,
                    title: quizId === 1 ? 'Quiz sur l\'optique géométrique' : 'Évaluation finale sur l\'optique',
                    description: quizId === 1 
                        ? 'Testez vos connaissances sur les principes fondamentaux de l\'optique géométrique'
                        : 'Évaluation complète sur le cours d\'optique géométrique',
                    time_limit: quizId === 1 ? 10 : 15,
                    passing_score: quizId === 1 ? 70 : 60,
                    questions: [
                        {
                            id: 1,
                            question_text: 'Quel est le principe de propagation rectiligne de la lumière?',
                            question_type: 'multiple_choice',
                            points: 2,
                            order: 1,
                            explanation: 'En optique géométrique, la lumière se propage en ligne droite dans un milieu homogène.',
                            answers: [
                                {
                                    id: 1,
                                    answer_text: 'La lumière se propage uniquement en ligne droite',
                                    order: 1
                                },
                                {
                                    id: 2,
                                    answer_text: 'La lumière se propage en ligne droite dans un milieu homogène',
                                    order: 2
                                },
                                {
                                    id: 3,
                                    answer_text: 'La lumière ne peut jamais changer de direction',
                                    order: 3
                                },
                                {
                                    id: 4,
                                    answer_text: 'La lumière se propage toujours à la même vitesse',
                                    order: 4
                                }
                            ]
                        },
                        {
                            id: 2,
                            question_text: 'Quelle est la loi de la réflexion?',
                            question_type: 'multiple_choice',
                            points: 2,
                            order: 2,
                            explanation: 'L\'angle d\'incidence est égal à l\'angle de réflexion.',
                            answers: [
                                {
                                    id: 5,
                                    answer_text: 'L\'angle d\'incidence est égal à l\'angle de réfraction',
                                    order: 1
                                },
                                {
                                    id: 6,
                                    answer_text: 'L\'angle d\'incidence est égal à l\'angle de réflexion',
                                    order: 2
                                },
                                {
                                    id: 7,
                                    answer_text: 'L\'angle d\'incidence est toujours de 90 degrés',
                                    order: 3
                                },
                                {
                                    id: 8,
                                    answer_text: 'L\'angle de réflexion dépend de la longueur d\'onde',
                                    order: 4
                                }
                            ]
                        },
                        {
                            id: 3,
                            question_text: 'Est-ce que la vitesse de la lumière est la même dans tous les milieux?',
                            question_type: 'true_false',
                            points: 1,
                            order: 3,
                            explanation: 'La vitesse de la lumière varie selon le milieu. Elle est maximale dans le vide et diminue dans d\'autres milieux comme l\'eau ou le verre.',
                            answers: [
                                {
                                    id: 9,
                                    answer_text: 'Vrai',
                                    order: 1
                                },
                                {
                                    id: 10,
                                    answer_text: 'Faux',
                                    order: 2
                                }
                            ]
                        }
                    ]
                };
                
                setQuiz(mockQuiz);
                
                // Start timer if there's a time limit
                if (mockQuiz.time_limit) {
                    setTimeRemaining(mockQuiz.time_limit * 60); // Convert minutes to seconds
                }
                
                /* Commented out API call due to connection issues
                const response = await api.get(`/quizzes/${quizId}`);
                setQuiz(response.data);
                
                // Start timer if there's a time limit
                if (response.data.time_limit) {
                    setTimeRemaining(response.data.time_limit * 60); // Convert minutes to seconds
                }
                */
            } catch (err) {
                console.error('Error loading quiz:', err);
                setError('Failed to load quiz. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();

        // Cleanup
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [quizId]);

    // Start quiz attempt
    useEffect(() => {
        const startQuizAttempt = async () => {
            if (!quiz || quizAttempt) return;
            
            try {
                // Mock data for quiz attempt
                const mockAttempt = {
                    id: 1,
                    quiz_id: quizId,
                    user_id: 1,
                    score: 0,
                    total_points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
                    percentage: 0,
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                    completed_at: null,
                    time_spent: 0
                };
                
                setQuizAttempt(mockAttempt);
                
                // Initialize timer if there's a time limit
                if (quiz.time_limit) {
                    const intervalId = setInterval(() => {
                        setTimeRemaining(prevTime => {
                            if (prevTime <= 1) {
                                clearInterval(intervalId);
                                submitQuiz(); // Auto-submit when time is up
                                return 0;
                            }
                            return prevTime - 1;
                        });
                    }, 1000);
                    
                    setTimer(intervalId);
                }
                
                /* Commented out API call due to connection issues
                const response = await api.post(`/quizzes/${quizId}/start`);
                setQuizAttempt(response.data.attempt);
                */
            } catch (err) {
                console.error('Error starting quiz attempt:', err);
                setError('Failed to start quiz. Please try again later.');
            }
        };

        if (quiz && !quizAttempt && !quizResults) {
            startQuizAttempt();
        }
    }, [quiz, quizAttempt, quizId, quizResults]);

    // Format time remaining
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    // Handle answer selection
    const handleAnswerSelect = async (questionId, answerId) => {
        if (submitting || quizResults) return;

        // Update local state
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));

        // Local processing - no server calls needed with mock data
        setSubmitting(true);
        // Simulate network delay
        setTimeout(() => {
            setSubmitting(false);
        }, 500);
        
        /* Commented out API call due to connection issues
        // Submit answer to server
        try {
            setSubmitting(true);
            await api.post(`/quiz-attempts/${quizAttempt.id}/submit-answer`, {
                question_id: questionId,
                answer_id: answerId
            });
        } catch (err) {
            console.error('Error submitting answer:', err);
            // Continue anyway - we'll sync up when the quiz is completed
        } finally {
            setSubmitting(false);
        }
        */
    };

    // Handle text response for short answer questions
    const handleTextResponse = async (questionId, textResponse) => {
        if (submitting || quizResults) return;

        // Update local state
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: textResponse
        }));

        // Submit answer to server
        try {
            setSubmitting(true);
            await api.post(`/quiz-attempts/${quizAttempt.id}/submit-answer`, {
                question_id: questionId,
                text_response: textResponse
            });
        } catch (err) {
            console.error('Error submitting answer:', err);
            // Continue anyway - we'll sync up when the quiz is completed
        } finally {
            setSubmitting(false);
        }
    };

    // Navigate to next question
    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    // Navigate to previous question
    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // Submit quiz
    const submitQuiz = async () => {
        if (!quizAttempt || submitting || quizResults) return;

        try {
            setSubmitting(true);
            
            // Calculate results locally with mock data
            let score = 0;
            let totalPoints = 0;
            
            // Correct answers for our mock quiz
            const correctAnswers = {
                1: 2, // Question 1, correct answer ID is 2
                2: 6, // Question 2, correct answer ID is 6
                3: 10 // Question 3, correct answer ID is 10 (Faux/False)
            };
            
            // Calculate score based on user answers
            Object.entries(userAnswers).forEach(([questionId, answerId]) => {
                const qId = parseInt(questionId);
                const question = quiz.questions.find(q => q.id === qId);
                
                if (question) {
                    totalPoints += question.points;
                    if (correctAnswers[qId] === answerId) {
                        score += question.points;
                    }
                }
            });
            
            // Calculate percentage
            const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
            
            // Create mock results
            const mockResults = {
                score: score,
                total_points: totalPoints,
                percentage: percentage,
                passed: percentage >= quiz.passing_score,
                attempt: {
                    ...quizAttempt,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    score: score,
                    total_points: totalPoints,
                    percentage: percentage
                }
            };
            
            // Simulate network delay
            setTimeout(() => {
                setQuizResults(mockResults);
                
                // Clear timer if it exists
                if (timer) {
                    clearInterval(timer);
                    setTimer(null);
                }
                
                // Call onComplete callback if provided
                if (onComplete) {
                    onComplete(mockResults);
                }
                
                setSubmitting(false);
            }, 1000);
            
            /* Commented out API call due to connection issues
            const response = await api.post(`/quiz-attempts/${quizAttempt.id}/complete`);
            setQuizResults(response.data);
            
            // Clear timer if it exists
            if (timer) {
                clearInterval(timer);
                setTimer(null);
            }
            
            // Call onComplete callback if provided
            if (onComplete) {
                onComplete(response.data);
            }
            */
        } catch (err) {
            console.error('Error completing quiz:', err);
            setError('Failed to submit quiz. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="quiz-error">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    if (quizResults) {
        // Quiz Results View
        return (
            <div className="quiz-results">
                <h2>Quiz Results</h2>
                <div className="result-summary">
                    <div className="result-stat">
                        <span className="stat-label">Score:</span>
                        <span className="stat-value">{quizResults.score} / {quizResults.total_points}</span>
                    </div>
                    <div className="result-stat">
                        <span className="stat-label">Percentage:</span>
                        <span className="stat-value">{Math.round(quizResults.percentage)}%</span>
                    </div>
                    <div className="result-stat">
                        <span className="stat-label">Status:</span>
                        <span className={`stat-value ${quizResults.passed ? 'passed' : 'failed'}`}>
                            {quizResults.passed ? 'Passed' : 'Failed'}
                        </span>
                    </div>
                </div>

                <div className="quiz-feedback">
                    {quizResults.passed ? (
                        <div className="success-message">
                            <h3>Congratulations!</h3>
                            <p>You've successfully completed this quiz.</p>
                        </div>
                    ) : (
                        <div className="failure-message">
                            <h3>Not quite there yet</h3>
                            <p>You didn't reach the passing score. Consider reviewing the course material and trying again.</p>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button 
                        className="primary-button"
                        onClick={() => window.location.href = `/courses?courseId=${courseId}`}
                    >
                        Return to Course
                    </button>
                </div>
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="quiz-error">
                <h3>No Questions Available</h3>
                <p>This quiz doesn't have any questions yet.</p>
                <button onClick={() => window.location.href = `/courses?courseId=${courseId}`}>
                    Return to Course
                </button>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const hasAnsweredCurrent = userAnswers[currentQuestion.id] !== undefined;
    const answeredQuestionsCount = Object.keys(userAnswers).length;
    const totalQuestionsCount = quiz.questions.length;
    const progressPercentage = (answeredQuestionsCount / totalQuestionsCount) * 100;

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h2>{quiz.title}</h2>
                {timeRemaining !== null && (
                    <div className="timer">
                        Time Remaining: {formatTime(timeRemaining)}
                    </div>
                )}
            </div>

            <div className="quiz-progress">
                <div className="progress-text">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    {answeredQuestionsCount > 0 && (
                        <span> ({answeredQuestionsCount} answered)</span>
                    )}
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="quiz-content">
                <QuizQuestion 
                    question={currentQuestion}
                    selectedAnswer={userAnswers[currentQuestion.id]}
                    onAnswerSelect={(answerId) => handleAnswerSelect(currentQuestion.id, answerId)}
                    onTextResponse={(text) => handleTextResponse(currentQuestion.id, text)}
                    disabled={submitting || quizResults !== null}
                />
            </div>

            <div className="quiz-navigation">
                <button
                    className="nav-button prev"
                    onClick={prevQuestion}
                    disabled={isFirstQuestion || submitting}
                >
                    Previous
                </button>
                
                {!isLastQuestion ? (
                    <button
                        className="nav-button next"
                        onClick={nextQuestion}
                        disabled={submitting}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        className="submit-button"
                        onClick={submitQuiz}
                        disabled={submitting || answeredQuestionsCount < totalQuestionsCount}
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                )}
            </div>

            {answeredQuestionsCount < totalQuestionsCount && isLastQuestion && (
                <div className="quiz-warning">
                    Please answer all questions before submitting.
                </div>
            )}
        </div>
    );
};

Quiz.propTypes = {
    quizId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onComplete: PropTypes.func,
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default Quiz;
