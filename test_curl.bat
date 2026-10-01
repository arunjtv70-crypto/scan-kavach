@echo off
if not defined OLLAMA_API_KEY (
	echo Set OLLAMA_API_KEY before running this test.
	exit /b 1
)
curl -X POST https://ollama.com/api/chat -H "Authorization: Bearer %OLLAMA_API_KEY%" -H "Content-Type: application/json" -d @temp.json
