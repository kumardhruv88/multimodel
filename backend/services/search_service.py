from tavily import TavilyClient
import os

def search_web(query: str) -> str:
    """
    Search the web using Tavily API and return a formatted string.
    """
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    results = client.search(query, max_results=5)
    
    formatted = "### Web Search Results\n\n"
    for r in results.get("results", []):
        formatted += f"**{r['title']}**\n"
        formatted += f"{r['content']}\n"
        formatted += f"Source: {r['url']}\n\n"
    return formatted
