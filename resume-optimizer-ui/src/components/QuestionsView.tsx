import { useNavigate, useLocation, Navigate } from "react-router-dom";
import React from 'react';
import { resumeOptimization } from "../api";
import { MessageSquare } from "lucide-react";

function QuestionsView()
{
    const navigate = useNavigate();
    // state from navigate function 
    const location = useLocation();

    const [loading, setLoading] = React.useState(false);
    const [answers, setAnswers] = React.useState<Record<string, string>>({});

    if(!location.state || !location.state.threadId){
        return <Navigate to="/" replace />;
    }

    const { threadId, questions } = location.state;

    console.log("Questions from location state", questions);

    const handleAnswerChange = (question: string, answer: string) => {
        setAnswers(prev => ({...prev, [question]: answer}))
    }

    const handleSubmitAnswers = async () =>{
        setLoading(true)
        try{
            const data = await resumeOptimization(threadId, answers);

            if(data.status === 'completed')
            {
                navigate('/results', {
                    state: {
                        workExperience: data.optimized_work_experience,
                        professionalSummary: data.optimized_professional_summary
                    }
                })
            }
        }
        catch(error)
        {
            console.error("Error submitting ansers : ", error);
            setLoading(false)
        }
    }

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-800">
                    <MessageSquare size={20} className="text-blue-600" /> 
                    Clarifying Questions
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                    The AI needs a bit more context about your experience to optimize your resume perfectly.
                </p>
                
                <div className="space-y-6">
                    {questions.map((question: string, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-800 mb-2">{question}</label>
                        <textarea 
                        rows={3}
                        placeholder="Type your answer here..."
                        value={answers[question] || ''}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                        />
                    </div>
                    ))}
                    
                    <button 
                    onClick={handleSubmitAnswers}
                    disabled={loading || Object.keys(answers).length === 0}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium mt-6 shadow-sm"
                    >
                    {loading ? 'Resuming Optimization...' : 'Submit Answers & Finish'}
                    </button>
                </div>
            </div>
        );
    }


export default QuestionsView;