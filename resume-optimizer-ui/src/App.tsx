import './App.css'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import UploadView from './components/UploadView';
import QuestionsView from './components/QuestionsView';
import ResultsView from './components/ResultsView';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 p-8 font-sans">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">AI Resume Optimizer</h1>
            <p className="text-gray-600 mt-2">Powered by LangGraph & FastAPI</p>
          </header>
          <Routes>
            <Route path="/" element={<UploadView />} />
            <Route path="/questions" element={<QuestionsView />} />
            <Route path="/results" element={<ResultsView />} />
            {/* Catch-all route to redirect invalid URLs back to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
