export interface ClarifyingQuestionsResponse {
    status: "waiting_on_user";
    thread_id: string;
    clarifying_questions: string[];
    message: string;
}

export interface OptimizedResumeResponse {
    status: "completed";
    thread_id: string;
    optimized_work_experience: string | null;
    optimized_professional_summary: string | null;
}

export type APIResponse = ClarifyingQuestionsResponse | OptimizedResumeResponse;

export interface AppState {
    step: 'UPLOAD' | 'QUESTIONS' | 'RESULTS';
    threadId: string | null;
    questions: string[];
    answers: Record<string, string>;
    results: {
        workExperience: string | null;
        professionalSummary: string | null;
    } | null;
    loading: boolean;
}
