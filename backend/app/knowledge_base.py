from app.agents.tools import Tool, ToolRegistry

_ENTRIES = [
    {
        "topic": "climate change",
        "text": (
            "Climate change refers to long-term shifts in temperatures and weather "
            "patterns, driven since the 1800s mainly by burning fossil fuels, which "
            "raises greenhouse gas concentrations in the atmosphere."
        ),
    },
    {
        "topic": "renewable energy",
        "text": (
            "Renewable energy comes from sources that are naturally replenished, such "
            "as sunlight, wind, and water. Solar and wind power are the fastest-growing "
            "electricity sources worldwide."
        ),
    },
    {
        "topic": "artificial intelligence",
        "text": (
            "Artificial intelligence (AI) is the field of building systems that perform "
            "tasks normally requiring human intelligence, such as understanding "
            "language, recognizing patterns, and making decisions."
        ),
    },
    {
        "topic": "machine learning",
        "text": (
            "Machine learning is a subset of AI where systems learn patterns from data "
            "instead of following explicitly programmed rules, improving as more data "
            "becomes available."
        ),
    },
    {
        "topic": "photosynthesis",
        "text": (
            "Photosynthesis is the process plants use to convert sunlight, water, and "
            "carbon dioxide into glucose and oxygen, forming the base of most food "
            "chains on Earth."
        ),
    },
    {
        "topic": "space exploration",
        "text": (
            "Space exploration is the investigation of outer space through crewed and "
            "robotic missions, including the Apollo Moon landings and the Mars rover "
            "missions."
        ),
    },
]


def search(query: str, limit: int = 3) -> list[dict]:
    """Deterministic keyword-overlap search over a small local knowledge base.

    Falls back to the first `limit` entries when nothing overlaps, so the
    Research Agent always has something concrete to work with in demo mode.
    """
    query_words = set(query.lower().split())
    scored = []
    for entry in _ENTRIES:
        entry_words = set((entry["topic"] + " " + entry["text"]).lower().split())
        overlap = len(query_words & entry_words)
        if overlap > 0:
            scored.append((overlap, entry))

    if not scored:
        return _ENTRIES[:limit]

    scored.sort(key=lambda pair: (-pair[0], pair[1]["topic"]))
    return [entry for _, entry in scored[:limit]]


def _search_tool(query: str) -> str:
    results = search(query)
    return "\n".join(f"- {entry['topic']}: {entry['text']}" for entry in results)


knowledge_base_tool = Tool(
    name="knowledge_base_search",
    description="Searches a small local knowledge base for relevant background information.",
    func=_search_tool,
)

registry = ToolRegistry()
registry.register(knowledge_base_tool)
