import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './quiz.css';

const QuizQuestion = ({ 
    question, 
    selectedAnswer, 
    onAnswerSelect, 
    onTextResponse, 
    disabled
}) => {
    const [textResponse, setTextResponse] = useState('');

    const handleTextChange = (e) => {
        setTextResponse(e.target.value);
    };

    const handleTextSubmit = () => {
        if (textResponse.trim() && onTextResponse) {
            onTextResponse(textResponse);
        }
    };

    if (!question) return null;

    return (
        <div className="quiz-question">
            <h3 className="question-text">
                {question.question_text}
                {question.points > 1 && <span className="question-points">({question.points} points)</span>}
            </h3>

            {question.question_type === 'multiple_choice' && (
                <div className="answer-options">
                    {question.answers.map(answer => (
                        <div 
                            key={answer.id} 
                            className={`answer-option ${selectedAnswer === answer.id ? 'selected' : ''}`}
                            onClick={() => {
                                if (!disabled) {
                                    onAnswerSelect(answer.id);
                                }
                            }}
                        >
                            <div className="answer-radio">
                                <div className={`radio-circle ${selectedAnswer === answer.id ? 'checked' : ''}`}>
                                    {selectedAnswer === answer.id && <div className="radio-dot"></div>}
                                </div>
                            </div>
                            <div className="answer-text">
                                {answer.answer_text}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {question.question_type === 'true_false' && (
                <div className="answer-options true-false">
                    <div 
                        className={`answer-option ${selectedAnswer === question.answers[0]?.id ? 'selected' : ''}`}
                        onClick={() => {
                            if (!disabled) {
                                onAnswerSelect(question.answers[0]?.id);
                            }
                        }}
                    >
                        <div className="answer-radio">
                            <div className={`radio-circle ${selectedAnswer === question.answers[0]?.id ? 'checked' : ''}`}>
                                {selectedAnswer === question.answers[0]?.id && <div className="radio-dot"></div>}
                            </div>
                        </div>
                        <div className="answer-text">True</div>
                    </div>
                    <div 
                        className={`answer-option ${selectedAnswer === question.answers[1]?.id ? 'selected' : ''}`}
                        onClick={() => {
                            if (!disabled) {
                                onAnswerSelect(question.answers[1]?.id);
                            }
                        }}
                    >
                        <div className="answer-radio">
                            <div className={`radio-circle ${selectedAnswer === question.answers[1]?.id ? 'checked' : ''}`}>
                                {selectedAnswer === question.answers[1]?.id && <div className="radio-dot"></div>}
                            </div>
                        </div>
                        <div className="answer-text">False</div>
                    </div>
                </div>
            )}

            {question.question_type === 'short_answer' && (
                <div className="short-answer">
                    <textarea
                        value={textResponse || selectedAnswer || ''}
                        onChange={handleTextChange}
                        placeholder="Type your answer here..."
                        disabled={disabled || selectedAnswer}
                        className="short-answer-input"
                    />
                    {!selectedAnswer && (
                        <button 
                            className="submit-answer-btn"
                            onClick={handleTextSubmit}
                            disabled={disabled || !textResponse.trim()}
                        >
                            Save Answer
                        </button>
                    )}
                    {selectedAnswer && (
                        <div className="answer-saved">Answer saved</div>
                    )}
                </div>
            )}

            {question.explanation && selectedAnswer && (
                <div className="question-explanation">
                    <h4>Explanation:</h4>
                    <p>{question.explanation}</p>
                </div>
            )}
        </div>
    );
};

QuizQuestion.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.number.isRequired,
        question_text: PropTypes.string.isRequired,
        question_type: PropTypes.string.isRequired,
        points: PropTypes.number,
        explanation: PropTypes.string,
        answers: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                answer_text: PropTypes.string.isRequired
            })
        ).isRequired
    }).isRequired,
    selectedAnswer: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    onAnswerSelect: PropTypes.func.isRequired,
    onTextResponse: PropTypes.func,
    disabled: PropTypes.bool
};

QuizQuestion.defaultProps = {
    disabled: false
};

export default QuizQuestion;
