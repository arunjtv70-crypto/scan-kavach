@echo off
curl -s -X POST http://localhost:3000/api/scan -H "Content-Type: application/json" -d @test_safe.json
