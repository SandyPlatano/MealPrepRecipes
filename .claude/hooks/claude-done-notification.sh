#!/bin/bash
# Claude's "I'm done!" notification
# Plays a quirky sound and flashes the terminal tab

# Play the sound (Funk has that quirky AI assistant vibe)
# You can change to: Submarine, Pop, Glass, Purr, Hero
afplay /System/Library/Sounds/Funk.aiff &

# Flash the terminal tab / bounce dock icon
printf '\a'
