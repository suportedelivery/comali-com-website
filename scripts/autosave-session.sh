#!/bin/bash

# Autosave script for Ruflo sessions
# Run periodically or as a hook to prevent losing conversation context

SESSION_NAME="autosave-$(date +%Y%m%d-%H%M)"
PROJECT_DIR="/media/sdcloud/AppleSSD/Opencode/comali.com.br"

echo "[$(date)] Starting autosave..."

# Save current session
ruflo session save -n "$SESSION_NAME" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "[$(date)] Session saved: $SESSION_NAME"
    
    # Keep only last 5 autosaves to avoid clutter
    SESSIONS=$(ruflo session list --json 2>/dev/null | grep -o '"id":"[^"]*"' | grep "autosave" | head -n 6)
    if [ $(echo "$SESSIONS" | wc -l) -gt 5 ]; then
        echo "[$(date)] Cleaning old autosaves..."
        echo "$SESSIONS" | tail -n +6 | while read -r line; do
            ID=$(echo "$line" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
            if [ ! -z "$ID" ]; then
                ruflo session delete "$ID" 2>/dev/null
            fi
        done
    fi
else
    echo "[$(date)] Error saving session"
fi

echo "[$(date)] Autosave complete"