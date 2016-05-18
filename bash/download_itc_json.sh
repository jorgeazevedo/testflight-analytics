#!/bin/bash
VERBOSE=1 pilot list --app_identifier "$1" | grep '<< GET: ra/user/externalTesters/' | sed -e 's/\[[0-9:]*\]: << GET: ra\/user\/externalTesters\/[0-9]*\/: //g' | sed -e's/=>/:/g' | sed -e's/nil/null/g' > externalTesters.json
