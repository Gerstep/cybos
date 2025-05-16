"""
perplexity_search.py
--------------------

A script to perform a search using the Perplexity API for a given topic.

Usage:
    python perplexity_search.py "your search topic here"

Requirements:
    - openai (pip install openai)
    - Set the environment variable PERPLEXITY_API_KEY with your API key

References:
    https://docs.perplexity.ai/guides/getting-started
"""
import os
import sys
from openai import OpenAI


def main():
    if len(sys.argv) < 2:
        print("Usage: python perplexity_search.py \"your search topic here\"")
        sys.exit(1)

    topic = sys.argv[1]
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        print("Error: Please set the PERPLEXITY_API_KEY environment variable.")
        sys.exit(1)

    client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
    messages = [
        {"role": "system", "content": "Be precise and concise."},
        {"role": "user", "content": topic},
    ]
    response = client.chat.completions.create(
        model="sonar-pro",
        messages=messages,
    )
    print(response.choices[0].message.content)


if __name__ == "__main__":
    main()
