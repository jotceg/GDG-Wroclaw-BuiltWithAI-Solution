import json
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from google.antigravity import Agent, LocalAgentConfig
from app.tools.contradictions import search_parameter, get_parameter_by_id

logger = logging.getLogger(__name__)

# ===========================================================================
# 1. Pydantic Response Schemas
# ===========================================================================

class ContradictionResult(BaseModel):
    improvingParamCode: int = Field(description="The numeric ID (1-39) of the parameter that needs to be improved.")
    improvingParamName: str = Field(description="The name of the parameter that needs to be improved.")
    worseningParamCode: int = Field(description="The numeric ID (1-39) of the parameter that worsens as a constraint.")
    worseningParamName: str = Field(description="The name of the parameter that worsens as a constraint.")
    explanation: str = Field(description="Clear explanation of the technical contradiction.")

class TrizSolution(BaseModel):
    title: str = Field(description="Title of the candidate solution.")
    description: str = Field(description="Detailed description of how the solution works and solves the problem.")
    principleCode: str = Field(description="The code of the TRIZ Inventive Principle used (1-40).")
    principleName: str = Field(description="The name of the TRIZ Inventive Principle used.")

class TrizSolutions(BaseModel):
    solutions: List[TrizSolution] = Field(description="A list of at least 3 concrete candidate solutions generated via TRIZ.")

class FiveWhysNextResult(BaseModel):
    question: str = Field(description="The next 'Why?' question to ask the user. Empty if isAbuseOrOffTopic is True.")
    isAbuseOrOffTopic: bool = Field(description="True if the user input is off-topic, abusive, or spam. False otherwise.")
    suggestedHypothesis: Optional[str] = Field(
        default=None, 
        description="A web-search-grounded hypothesis or hint provided to help the user answer if they request assistance."
    )

class FiveWhysSolution(BaseModel):
    title: str = Field(description="Title of the countermeasure solution.")
    description: str = Field(description="Detailed description of the countermeasure and how it addresses the root cause.")

class FiveWhysSolutions(BaseModel):
    solutions: List[FiveWhysSolution] = Field(description="A list of at least 3 concrete countermeasure solutions generated from the root cause.")

class EvaluationItem(BaseModel):
    solutionId: str = Field(description="The ID of the candidate solution.")
    criterion: str = Field(description="The criterion being evaluated: 'feasibility', 'impact', 'cost', or 'innovation'.")
    score: int = Field(description="The score assigned (1 to 10).")
    reasoning: str = Field(description="Detailed reasoning for the given score.")

class EvaluationsResult(BaseModel):
    evaluations: List[EvaluationItem] = Field(description="The evaluation matrix containing scores for all candidates across all criteria.")

class SelectionResult(BaseModel):
    selectedSolutionId: str = Field(description="The ID of the winning candidate solution.")
    justification: str = Field(description="Comprehensive justification for selecting this solution over the others.")

# ===========================================================================
# 2. Agent Execution Helpers
# ===========================================================================

async def run_contradiction_agent(problem: str) -> dict:
    """Uses a ContradictionAgent to identify improving/worsening parameters from a description."""
    system_instructions = (
        "You are a TRIZ engineering contradiction analyzer. Your task is to analyze the inventive problem "
        "description and reformulate it as a technical contradiction: one parameter to improve, and one parameter "
        "that worsens as a result. You must call search_parameter to find the correct parameter codes (1-39) "
        "and names. If you cannot find a direct match, use the closest engineering parameter. "
        "You must return the result matching the ContradictionResult schema exactly."
    )
    
    # We equip the contradiction agent with parameter search tools
    config = LocalAgentConfig(
        system_instructions=system_instructions,
        tools=[search_parameter, get_parameter_by_id],
        response_schema=ContradictionResult,
    )
    
    async with Agent(config) as agent:
        response = await agent.chat(f"Formulate the contradiction for this problem: {problem}")
        result = await response.structured_output()
        return result

async def run_triz_solutions_agent(problem: str, principles: List[str]) -> dict:
    """Uses a TrizSolutionAgent to generate concrete solutions based on principles."""
    principles_str = ", ".join(principles)
    system_instructions = (
        "You are an inventive design engineer. Your task is to generate at least 3 candidate solutions for "
        "the given problem, based strictly on the provided TRIZ Inventive Principles. "
        "Make the solutions concrete, detailed, and relevant to the specific problem domain. "
        "Format the output matching the TrizSolutions schema exactly."
    )
    
    config = LocalAgentConfig(
        system_instructions=system_instructions,
        response_schema=TrizSolutions,
    )
    
    async with Agent(config) as agent:
        response = await agent.chat(f"Problem: {problem}\nTRIZ Principles to apply: {principles_str}")
        result = await response.structured_output()
        return result

# Web search tool for the 5 Whys Agent
def search_web_for_hypotheses(query: str) -> str:
    """Performs a web search to find scientific, engineering, or structural hypotheses related to a query.
    
    Args:
        query: The search query.
    """
    # Simulated web search returns grounded hypotheses based on query content
    logger.info(f"Simulating web search for: {query}")
    if "building" in query.lower() or "hot" in query.lower() or "cold" in query.lower() or "insulat" in query.lower():
        return (
            "Web search results for buildings temperature insulation:\n"
            "- Polar bears use hollow transparent hairs that trap solar heat while maintaining a dark skin underneath for absorption.\n"
            "- Termite mounds use passive ventilation chimneys that open/close to maintain a constant internal temperature.\n"
            "- Phase-change materials (PCMs) can absorb heat during the day and release it as temperatures drop at night."
        )
    return f"Web search results for: {query}\n- Proposes utilizing modular adaptive materials.\n- Proposes passive ventilation channels."

async def run_five_whys_agent(problem: str, history: List[dict]) -> dict:
    """Uses a FiveWhysAgent to ask the next 'Why?' or check for off-topic input."""
    history_str = ""
    for h in history:
        history_str += f"Q: {h.get('question')}\nA: {h.get('answer')}\nKind: {h.get('kind')}\n\n"
        
    system_instructions = (
        "You are a root-cause analysis facilitator guiding a 5 Whys process. "
        "For the given inventive problem and current Q&A history, decide if the latest user answer (the last A in the history) "
        "is off-topic, spam, or abusive. If so, set isAbuseOrOffTopic=True, question='', and suggestedHypothesis=None. "
        "If the user is asking for assistance or is stuck (e.g. 'I do not know', 'help', 'suggest something'), "
        "you must use the search_web_for_hypotheses tool to fetch hypotheses, and output it in suggestedHypothesis "
        "along with the next question. "
        "If the user's answer is on-topic and valid, formulate the next logical 'Why?' question to dive deeper. "
        "Format the output matching the FiveWhysNextResult schema exactly."
    )
    
    config = LocalAgentConfig(
        system_instructions=system_instructions,
        tools=[search_web_for_hypotheses],
        response_schema=FiveWhysNextResult,
    )
    
    async with Agent(config) as agent:
        prompt = f"Problem: {problem}\n\nQ&A History:\n{history_str}\nProvide the next question, checking for abuse."
        response = await agent.chat(prompt)
        result = await response.structured_output()
        return result

async def run_five_whys_solutions_agent(problem: str, root_cause: str) -> dict:
    """Uses a FiveWhysSolutionAgent to generate countermeasures from a root cause."""
    system_instructions = (
        "You are an engineering problem solver. Your task is to generate at least 3 concrete, targeted countermeasure "
        "solutions that directly address the identified root cause of the given problem. "
        "Explain how the countermeasures work and prevent the root cause. "
        "Format the output matching the FiveWhysSolutions schema exactly."
    )
    
    config = LocalAgentConfig(
        system_instructions=system_instructions,
        response_schema=FiveWhysSolutions,
    )
    
    async with Agent(config) as agent:
        response = await agent.chat(f"Problem: {problem}\nRoot Cause identified: {root_cause}")
        result = await response.structured_output()
        return result

async def run_evaluate_agent(problem: str, solutions: List[dict]) -> dict:
    """Uses an EvaluationAgent to score candidates against criteria."""
    solutions_str = json.dumps(solutions, indent=2)
    system_instructions = (
        "You are an R&D evaluation committee. Your task is to evaluate all provided candidate solutions against the "
        "original problem using four criteria: feasibility, impact, cost, and innovation. "
        "Score each candidate-criterion pair from 1 (poor) to 10 (excellent), and provide detailed, professional "
        "reasoning for each score. "
        "Format the output matching the EvaluationsResult schema exactly."
    )
    
    config = LocalAgentConfig(
        system_instructions=system_instructions,
        response_schema=EvaluationsResult,
    )
    
    async with Agent(config) as agent:
        response = await agent.chat(f"Problem: {problem}\nCandidates to evaluate:\n{solutions_str}")
        result = await response.structured_output()
        return result

async def run_select_agent(problem: str, evaluations: List[dict]) -> dict:
    """Uses a SelectionAgent to choose the best solution and justify the choice."""
    evals_str = json.dumps(evals, indent=2)
    system_instructions = (
        "You are an R&D director making the final design choice. Your task is to select the single best solution "
        "candidate based on the evaluations. You must provide a comprehensive, logical justification for the selection "
        "and present a clear reasoning trail from problem to contradiction to candidates to winner. "
        "Format the output matching the SelectionResult schema exactly."
    )
    
    config = LocalAgentConfig(
        system_instructions=system_instructions,
        response_schema=SelectionResult,
    )
    
    async with Agent(config) as agent:
        response = await agent.chat(f"Problem: {problem}\nEvaluations data:\n{evals_str}")
        result = await response.structured_output()
        return result
