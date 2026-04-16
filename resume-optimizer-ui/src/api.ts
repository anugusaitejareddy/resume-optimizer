import axios from 'axios';
import type {APIResponse}  from './types';

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const startOptimization = async (file: File, role: string, jd?: string) : Promise<APIResponse> => {
    const formData = new FormData();
    formData.append('file', file)
    formData.append('target_role', role)
    if (jd) formData.append('job_description_text', jd);

    const response = await axios.post(`${BASE_URL}/optimize/start`, formData)
    console.log("start optimization --",response.data);
    return response.data
}

export const resumeOptimization = async (threadId: string, answers: Record<string,string>) : Promise<APIResponse> => {
    const response = await axios.post(`${BASE_URL}/optimize/resume`, {
        thread_id: threadId,
        answers: answers
    });
    console.log("resume optimization -- ",response.data);
    return response.data
}