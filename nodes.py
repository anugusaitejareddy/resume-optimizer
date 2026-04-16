from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from state import GraphState

from dotenv import load_dotenv

import os

load_dotenv()

#------------------------------------------
# Pydantic models for structured output
#------------------------------------------

class JobRequirements(BaseModel): 
    requirements: List[str] = Field(
        description= "A distinct list of core technical skills, soft skills, and qualifications extracted from the job description."
    )

class WorkExperience(BaseModel):
    company: str = Field(description="Name of the company")
    role: str = Field(description="job title")
    bullets : List[str] = Field(description="List of responsibilities and achievements")

class ResumeDetails(BaseModel):
    skills: List[str] = Field(description="List of all extracted skills.")
    work_experience: List[WorkExperience] = Field(description="Extracted work history")


llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

def fetch_db_details_node(state: GraphState) -> dict:

    general_roles_db = {
        "backend_engineer" : ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Microservices"],
        "frontend_engineer": ["JavaScript", "TypeScript", "React", "HTML/CSS", "State Management"],
        "data_scientist": ["Python", "Machine Learning", "SQL", "Pandas", "Statistical Analysis"]
    }

    target_role = state.get('target_role').strip().lower().replace(" ","_")

    requirements = general_roles_db.get(target_role, ["Communication", "Problem Solving", "Software Development"])

    return {"extracted_job_requirements" : requirements}

def live_extraction_node(state:GraphState) -> dict:
    structured_llm = llm.with_structured_output(JobRequirements)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical recruiter. Extract the core requirements from the provided job description. Return them as a flat list of strings."),
        ("human", "{jd_text}")
    ])

    chain = prompt | structured_llm
    result = chain.invoke({"jd_text" : state.get('job_description_text') })

    return {"extracted_job_requirements": result.requirements}


def extract_resume_details_node(state:GraphState) -> dict:
    """
    Parses the raw resume text into a structured dictionary format.
    """
    structured_llm = llm.with_structured_output(ResumeDetails)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert ATS (Applicant Tracking System) parser. Extract the skills and work experience from the following resume text. Preserve the original phrasing of the bullet points."),
        ("human", "{resume_text}")
    ])

    chain = prompt | structured_llm

    result = chain.invoke({"resume_text" : state.get('original_resume_text')})

    return {
       "extracted_resume_details" : result.model_dump()
    }


#--------------------------------
#  Additional Pydantic Models
#--------------------------------

class GapAnalysis(BaseModel):
    identified_gaps: List[str] = Field(
        description = "A list of specific skills, tools, or qualifications from the job requirements that are entirely missing from the candidate's resume."
    )

class ClarifyingQuestions(BaseModel):
    questions: List[str] = Field(
        description= "A list of direct, polite questions asking the candidate if they have any undocumented experience with the missing skills."
    )

def perform_gap_analysis_node(state: GraphState) -> dict :
    """
    Compares the target job requirements against the parsed resume 
    to identify missing skills.
    """
    structured_llm = llm.with_structured_output(GapAnalysis)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a strict and analytical career coach. Compare the provided Job Requirements against the candidate's Resume Details. Return a list of requirements that are completely missing from the candidate's profile. If nothing is missing, return an empty list."),
        ("human", "Target Job Requirements:\n{requirements}\n\nCurrent Resume Details:\n{resume}")
    ])

    chain = prompt | structured_llm

    result = chain.invoke({
        "requirements": state.get("extracted_job_requirements", []),
        "resume": state.get("extracted_resume_details", [])
    })

    return {
        "identified_gaps" : result.identified_gaps
    }

def ask_clarifying_questions_node(state: GraphState) -> dict : 
    """
    Generates specific questions based on the identified gaps.
    """
    structured_llm = llm.with_structured_output(ClarifyingQuestions)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful resume assistant. The candidate is missing certain skills required for their target role. Formulate brief, direct questions asking if they have any past experience with these specific missing skills that they forgot to include."),
        ("human", "Identified gaps: {gaps}")
    ])

    chain = prompt | structured_llm
    result = chain.invoke({"gaps": state.get('identified_gaps', [])})

    return {"clarifying_questions": result.questions}


class OptimizedResume(BaseModel):
    optimized_work_experience: str = Field(
        description="The heavily optimized work experience section, formatted in clean Markdown."
    )

    optimized_professional_summary : str = Field(
        description= "The heavily optimized professional summary section, formatted in clean Markdown."
    )


def perform_optimization_node(state: GraphState) -> dict :
    """
    Rewrites the candidate's experience sections using the original data, 
    the target requirements, and any new information provided by the user.
    """
    structured_llm = llm.with_structured_output(OptimizedResume)
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert executive resume writer. Your goal is to optimize the candidate's resume to perfectly align with the Target Job Requirements. 
        
        Instructions:
        1. Rewrite bullet points using strong action verbs.
        2. Seamlessly integrate the 'Candidate Answers' (newly discovered skills/experience) into the appropriate roles.
        3. Quantify achievements where logically possible.
        4. Do not invent fake experience; only use the provided details and answers.
        """),
        ("human", "Target Requirements:\n{requirements}\n\nCurrent Resume Details:\n{resume}\n\nCandidate Answers to Missing Skills:\n{answers}")
    ])

    chain = prompt | structured_llm

    result = chain.invoke({
        "requirements" : state.get("extracted_job_requirements"),
        "resume": state.get("extracted_resume_details"),
        "answers": state.get("user_answers")
    })

    return {
        "optimized_work_experience" : result.optimized_work_experience,
        "optimized_professional_summary": result.optimized_professional_summary
    }