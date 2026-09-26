from sqlalchemy.orm import Session

from app.db_models import Agent, Workflow, WorkflowStep

FACTORY_WORKFLOW_NAME = "Academic Research Factory"

PLANNER_NAME = "Planner"
RESEARCHER_NAME = "Researcher"
CRITIC_NAME = "Critic"
WRITER_NAME = "Writer"

_AGENT_DEFINITIONS = [
    (
        PLANNER_NAME,
        "Breaks a research request into a short list of concrete research tasks.",
        "You are a planning agent. Read the user's research request and break it down "
        "into 2-4 clear, concrete research tasks. Respond with a short numbered list.",
    ),
    (
        RESEARCHER_NAME,
        "Searches a local knowledge base and summarizes relevant findings.",
        "You are a research agent. Use the retrieved knowledge base findings to answer "
        "the planner's research tasks factually, noting which topic each fact came from.",
    ),
    (
        CRITIC_NAME,
        "Reviews research output for gaps, weak reasoning, or unsupported claims.",
        "You are a critic agent. Review the research findings for missing information, "
        "weak reasoning, or unsupported claims. List concrete issues, or say the "
        "research is sound.",
    ),
    (
        WRITER_NAME,
        "Writes the final structured research report.",
        "You are a writing agent. Using the plan, research findings, and critique, "
        "write a structured final report with headings: Summary, Findings, "
        "Limitations, Conclusion.",
    ),
]


def ensure_academic_research_factory(db: Session) -> Workflow:
    """Creates the built-in Academic Research Factory (agents + workflow) if missing."""
    existing = db.query(Workflow).filter_by(name=FACTORY_WORKFLOW_NAME).first()
    if existing is not None:
        return existing

    agents_by_name = {}
    for name, description, system_instructions in _AGENT_DEFINITIONS:
        agent = db.query(Agent).filter_by(name=name).first()
        if agent is None:
            agent = Agent(
                name=name,
                description=description,
                system_instructions=system_instructions,
            )
            db.add(agent)
            db.flush()
        agents_by_name[name] = agent

    workflow = Workflow(
        name=FACTORY_WORKFLOW_NAME,
        description="User request -> Planner -> Researcher -> Critic -> Writer -> Final report.",
    )
    workflow.steps = [
        WorkflowStep(agent_id=agents_by_name[PLANNER_NAME].id, step_order=1),
        WorkflowStep(agent_id=agents_by_name[RESEARCHER_NAME].id, step_order=2),
        WorkflowStep(agent_id=agents_by_name[CRITIC_NAME].id, step_order=3),
        WorkflowStep(agent_id=agents_by_name[WRITER_NAME].id, step_order=4),
    ]
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow
