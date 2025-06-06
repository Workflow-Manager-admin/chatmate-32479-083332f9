#!/bin/bash
cd /home/kavia/workspace/code-generation/chatmate-32479-083332f9/chatmate
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

