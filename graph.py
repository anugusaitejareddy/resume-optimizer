from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from state import GraphState
from nodes import (
    fetch_db_details_node, 
    live_extraction_node, 
    extract_resume_details_node,
    perform_gap_analysis_node, 
    ask_clarifying_questions_node, 
    perform_optimization_node
)
from edges import route_role_type, route_after_gap_analysis

# initialize graph
builder = StateGraph(GraphState)

builder.add_node("fetch_db_details_node", fetch_db_details_node)
builder.add_node("live_extraction_node", live_extraction_node)
builder.add_node("extract_resume_details_node", extract_resume_details_node)
builder.add_node("perform_gap_analysis_node", perform_gap_analysis_node)
builder.add_node("ask_clarifying_questions_node", ask_clarifying_questions_node)
builder.add_node("perform_optimization_node", perform_optimization_node)

builder.add_conditional_edges(START, route_role_type)

builder.add_edge("fetch_db_details_node", "extract_resume_details_node")
builder.add_edge("live_extraction_node", "extract_resume_details_node")
builder.add_edge("extract_resume_details_node", "perform_gap_analysis_node")

builder.add_conditional_edges("perform_gap_analysis_node", route_after_gap_analysis)

builder.add_edge("ask_clarifying_questions_node", "perform_optimization_node")
builder.add_edge("perform_optimization_node", END)

memory = MemorySaver()

graph = builder.compile(
    checkpointer= memory,
    interrupt_after= ["ask_clarifying_questions_node"]
)

