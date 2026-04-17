import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { RefreshCw, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
        >
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function SectionCard({ title, content }: { title: string; content: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h3>
                <CopyButton text={content} />
            </div>
            <div className="px-6 py-5 text-left prose prose-sm prose-gray max-w-none
                prose-headings:text-gray-900 prose-headings:font-semibold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-strong:text-gray-900">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
}

function ResultsView() {
    const navigate = useNavigate();
    const location = useLocation();

    if (!location.state) return <Navigate to="/" replace />;

    const { workExperience, professionalSummary } = location.state;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
            <div className="text-center pb-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Optimized Resume</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Your resume sections have been rewritten for the target role.
                </p>
            </div>

            {professionalSummary && (
                <SectionCard title="Professional Summary" content={professionalSummary} />
            )}

            {workExperience && (
                <SectionCard title="Work Experience" content={workExperience} />
            )}

            <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 active:scale-[0.99] transition-all font-medium text-sm shadow-sm mt-2"
            >
                <RefreshCw size={14} />
                Start New Optimization
            </button>
        </div>
    );
}

export default ResultsView;