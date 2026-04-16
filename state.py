from typing import TypedDict, List, Dict, Any, Optional
from typing_extensions import Annotated
from langgraph.graph.message import add_messages

class GraphState(TypedDict):
    
    original_resume_text: str
    target_role: str
    job_description_text: Optional[str]

    is_specific_role: bool

    # extracted from db
    extracted_job_requirements: List[str]
    
    # extracted from resume
    extracted_resume_details: Dict[str, Any]

    # analysis & human-in-the-loop
    identified_gaps: List[str]
    clarifying_questions: List[str]
    user_answers: Dict[str,str]

    optimized_work_experience: str
    optimized_professional_summary: str

    messages: Annotated[list, add_messages]