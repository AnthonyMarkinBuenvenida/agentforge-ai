from dataclasses import dataclass
from typing import Callable, Optional


@dataclass
class Tool:
    """A named callable an agent could invoke. Not wired into any agent yet."""

    name: str
    description: str
    func: Callable[[str], str]


class ToolRegistry:
    """A simple name -> Tool lookup, so tools can be added later without redesigning agents."""

    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[Tool]:
        return self._tools.get(name)

    def list_tools(self) -> list[Tool]:
        return list(self._tools.values())
