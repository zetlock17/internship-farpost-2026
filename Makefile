.PHONY: free-port

free-port:
	lsof -ti:8000 | xargs kill -9
