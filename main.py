from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import fitz
import uuid

from langgraph.types import Command

from graph import graph

app = FastAPI(title="Resume Optimizer AI agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Helper: PDF Parser
# --------------------------
def extract_text_from_pdf(file_bytes: bytes) -> str :
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# ---------------------------------------------
# Pydantic model for the continuation endpoint
# ---------------------------------------------
class AnswerPayLoad(BaseModel):
    thread_id: str
    answers: Dict[str, str]

# ------------------------
# Endpoints
# ------------------------
@app.post("/api/v1/optimize/start")
async def start_optimization(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    job_description_text: Optional[str] = Form(None)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail = "Only pdf files are supported")
    
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)

    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    initial_state = {
        "original_resume_text": resume_text,
        "target_role": target_role,
        "job_description_text": job_description_text,
        "is_specific_role": bool(job_description_text)
    }

    result_state = graph.invoke(initial_state, config)

    questions = result_state.get("clarifying_questions", [])

    if questions:
        return {
            "status": "waiting_on_user",
            "message": "We found some missing skills. Please answer the clarifying questions to proceed.",
            "thread_id": thread_id,
            "clarifying_questions": questions
        }
    else: 
        return {
            "status": "completed",
            "thread_id": thread_id,
            "optimized_work_experience": result_state.get("optimized_work_experience"),
            "optimized_professional_summary": result_state.get("optimized_professional_summary")
        }
    
@app.post("/api/v1/optimize/resume")
async def resume_optimization(payload: AnswerPayLoad):
    """
        Step 2 : Provide answers to the questions and resume the graph
    """
    config = {"configurable": {"thread_id": payload.thread_id}}

    current_state = graph.get_state(config)

    if not current_state.next:
        raise HTTPException(status_code=400, detail = "No active graph execution found for this thread ID. It may have already completed.")

    final_state = graph.invoke(
        Command(resume={"user_answers": payload.answers}), 
        config
    )

    return {
        "status": "completed",
        "thread_id": payload.thread_id,
        "optimized_work_experience": final_state.get("optimized_work_experience"),
        "optimized_professional_summary": final_state.get("optimized_professional_summary")
    }

