import React from "react";
import { useNavigate } from "react-router-dom";
import { startOptimization } from "../api";
import { Upload } from "lucide-react";


function UploadView() {
    const navigate = useNavigate();
    const [file, setFile] = React.useState<File | null>(null)
    const [role, setRole] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const handleStart = async () => {
        if(!file || !role) return;
        setLoading(true);

        try {
            const data = await startOptimization(file, role);

            console.log(data);

            if(data.status === 'waiting_on_user'){
                navigate('/questions', {
                    state: {
                        threadId: data.thread_id,
                        questions: data.clarifying_questions
                    }
                })
            } else {
                navigate('/results', {
                    state: {
                        workExperience: data.optimized_work_experience,
                        professionalSummary: data.optimized_professional_summary
                    }
                });
            }
        }
        catch(error)
        {
            console.log("Error starting optimization: ",error);
            setLoading(false);
        }
    };

   return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <Upload size={20} className="text-blue-600" /> 
        Upload Details
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-dashed border-gray-300 rounded-md bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
          <input 
            type="text" 
            placeholder="e.g., Senior Backend Developer" 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={handleStart}
          disabled={loading || !file || !role}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium mt-4"
        >
          {loading ? 'Parsing Resume...' : 'Start Optimization'}
        </button>
      </div>
    </div>
  );
}

export default UploadView;