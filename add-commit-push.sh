#!/bin/bash

commit_message=$1

if [ -z "$commit_message" ]; then
  commit_message="Updates"
fi

git add -A && git commit -m "$commit_message" && git push