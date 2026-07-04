from app.services import agents

async def agent_contradiction(problem: str) -> dict:
    """Reformulate an inventive problem description into a technical contradiction using a Google Antigravity Agent.
    
    Args:
        problem: The inventive problem description.
    """
    return await agents.run_contradiction_agent(problem)

async def agent_triz_solutions(problem: str, principles: list[str]) -> dict:
    """Generate candidate solutions for a problem based on TRIZ Inventive Principles using a Google Antigravity Agent.
    
    Args:
        problem: The inventive problem description.
        principles: List of TRIZ Inventive Principle names/descriptions to apply.
    """
    return await agents.run_triz_solutions_agent(problem, principles)

async def agent_five_whys_next(problem: str, history: list[dict]) -> dict:
    """Facilitate a 5 Whys interactive question/answer session using a Google Antigravity Agent.
    
    Args:
        problem: The inventive problem description.
        history: List of prior Q&A steps, where each step has: question, answer, kind, confirmed.
    """
    return await agents.run_five_whys_agent(problem, history)

async def agent_five_whys_solutions(problem: str, root_cause: str) -> dict:
    """Generate countermeasure solutions for a root cause using a Google Antigravity Agent.
    
    Args:
        problem: The inventive problem description.
        root_cause: The identified root cause.
    """
    return await agents.run_five_whys_solutions_agent(problem, root_cause)

async def agent_evaluate(problem: str, solutions: list[dict]) -> dict:
    """Evaluate all candidate solutions using a Google Antigravity Agent.
    
    Args:
        problem: The inventive problem description.
        solutions: List of candidate solutions, each having id, title, description, method.
    """
    return await agents.run_evaluate_agent(problem, solutions)

async def agent_select(problem: str, evaluations: list[dict]) -> dict:
    """Select the best candidate solution and justify it using a Google Antigravity Agent.
    
    Args:
        problem: The inventive problem description.
        evaluations: List of evaluations, each having solutionId, criterion, score, reasoning.
    """
    return await agents.run_select_agent(problem, evaluations)
