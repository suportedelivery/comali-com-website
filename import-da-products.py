import os
import json
import re
import unicodedata
import urllib.request

SANITY_PROJECT_ID = "5fcrgo8n"
SANITY_DATASET = "production"
# We will use Sanity HTTP API with bearer token if available, or write a json batch file to import via Sanity CLI / MCP tool.

print("Starting extraction of D&A products...")
