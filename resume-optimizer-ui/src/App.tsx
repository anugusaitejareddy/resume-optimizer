import React from 'react';
import './App.css'
import type { AppState } from './types';
import { resumeOptimization, startOptimization } from './api';
import { Upload, MessageSquare, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [state, setState] = React.useState<AppState>({
    step: 'UPLOAD',
    threadId: null,
    questions: [],
    answers: {},
    results: null,
    loading: false
  })

  const [file, setFile] = React.useState<File | null>(null);
  const [role, setRole] = React.useState('')

  const handleStart = async () => {
    if(!file || !role) return;

    setState(prev => ({...prev, loading: true}));

    try {
      const data = await startOptimization(file, role);

      if(data.status === 'waiting_on_user'){
        setState(prev => ({
          ...prev,
          step: 'QUESTIONS',
          threadId: data.thread_id,
          questions: data.clarifying_questions,
          loading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          step: 'RESULTS',
          results: {
            workExperience: data.optimized_work_experience,
            professionalSummary: data.optimized_professional_summary
          },
          loading: false
        }));
      }
    }
    catch (error) {
      console.error("Error starting optimization:",error)
      setState(prev => ({...prev, loading: false}))
    }
  };
  

  const handleAnswerChange = (question : string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [question] : answer
      }
    }));
  };

  const handleSubmitAnswers = async () => {
    if(!state.threadId) return;

    setState(prev => ({...prev, loading:true}));

    try{
      const data = await resumeOptimization(state.threadId, state.answers)

      if(data.status === 'completed'){
        setState(prev => ({
          ...prev,
          step: 'RESULTS',
          results: {
            professionalSummary: data.optimized_professional_summary,
            workExperience: data.optimized_work_experience
          },
          loading: false
        }))
      }
    } catch(error){
      console.error("Error submitting answers: ", error);
      setState(prev => ({...prev, loading: false}))
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">

        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Optimization</h1>
          <p className="text-gray-600 mt-2">Powered by LangGraph and FastAPI</p>
        </header>

        {
          state.step === 'UPLOAD' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Upload size={20} className='text-blue-600'/>
                Upload Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
                  <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-dashed border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                <input 
                  type="text" 
                  name="target_role" id="target_role" 
                  placeholder='eg. senior backend developer'
                  onChange={e => setRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button 
                onClick={handleStart}
                disabled={state.loading || !file || !role }
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium mt-4"
              >
                {state.loading ? 'Parsing Resume' : 'Start Optimization'}
              </button>
            </div>
          )
        }

        {
          state.step === 'QUESTIONS' && (
            <div>
              <h2>Clarifying questions</h2>
              <p>The AI needs a bit more context to optimize your resume perfectly</p>

              <div>
                {
                  state.questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label htmlFor="answer" className="block text-sm font-medium text-gray-800 mb-2">
                        {question}
                      </label>
                      <textarea 
                        rows={3}
                        name="answer" 
                        id="answer" 
                        placeholder="Type your answer here..." 
                        value={state.answers[question] || ''}
                        onChange={e => handleAnswerChange(question, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                      >
                      </textarea>
                    </div>
                  ))}

                  <button
                    onClick={handleSubmitAnswers}
                    disabled = {state.loading || Object.keys(state.answers).length === 0}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium mt-6 shadow-sm"
                  >
                    {state.loading ? 'Resume Optimization ...' : 'Submit Answers & Finish'}
                  </button>
              </div>
            </div>
          )
        }

        {
          state.step === 'RESULTS' && state.results && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                <FileText size={20} className="text-green-600"/>
                  Your Optimized Resume
              </h2>

              <div className="space-y-8">
                {
                  state.results.professionalSummary && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Optimized Professional Summary</h3>
                      <div className="prose prose-blue max-w-none bg-gray-50 p-6 rounded-lg border border-gray-100 text-sm text-left">
                        <ReactMarkdown>{state.results.professionalSummary}</ReactMarkdown>
                      </div>
                    </div>
                  )
                }
                {
                  state.results.workExperience && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Optimized Work Experience</h3>
                      <div className="prose prose-blue max-w-none bg-gray-50 p-6 rounded-lg border border-gray-100 text-sm text-left">
                        <ReactMarkdown>{state.results.workExperience}</ReactMarkdown>
                      </div>
                    </div>
                  )
                }
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-800 text-white py-2.5 rounded-md hover:bg-gray-900 transition-colors font-medium mt-6 shadow-sm"
                >
                  Start New Optimization
                </button>
              </div>

            </div>
          )
        }

      </div>
    </div>
  )

}

export default App
