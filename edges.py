from state import GraphState

def route_role_type(state: GraphState):
    """
    Reads the state to determine if the user provided a specific job description
    or just a general target role. Routes to the appropriate next node.
    """
    if state.get('is_specific_role'):
        return "live_extraction_node"
    else:
        return "fetch_db_details_node"
    
def route_after_gap_analysis(state: GraphState):
    """
    Checks if the gap analysis node found any missing skills or gaps.
    If yes, we route to asking clarifying questions.
    If no, we go straight to optimization.
    """
    gaps = state.get("identified_gaps", [])

    if len(gaps) > 0:
        return "ask_clarifying_questions_node"
    else: 
        return "perform_optimization_node"