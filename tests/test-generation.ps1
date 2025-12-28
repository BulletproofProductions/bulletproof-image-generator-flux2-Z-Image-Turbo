#!/usr/bin/env pwsh

# Test generation flow with detailed logging

$BaseUrl = "http://localhost:3000"

Write-Host "Starting generation test..."
Write-Host "=============================="

# 1. Create a generation request
Write-Host ""
Write-Host "1. Posting generation request..."
$body = @{
    prompt = "A beautiful landscape with mountains"
    settings = @{
        width = 512
        height = 512
        steps = 10
        guidance = 7.5
        imageCount = 1
    }
} | ConvertTo-Json

Write-Host "Request body: $body"

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/generate" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30
    
    $responseBody = $response.Content
    Write-Host "Response status: $($response.StatusCode)"
    Write-Host "Response body: $responseBody"
    
    # Extract generation ID from response
    $parsed = $responseBody | ConvertFrom-Json
    $GenId = $parsed.id
    Write-Host "Generation ID: $GenId"
    
    if ([string]::IsNullOrEmpty($GenId)) {
        Write-Host "Failed to extract generation ID"
        exit 1
    }
    
    Write-Host ""
    Write-Host "2. Opening progress stream for generation $GenId..."
    Write-Host "This will stream real-time progress updates for 5 minutes max..."
    Write-Host ""
    
    # 2. Connect to progress stream
    $progressUrl = "$BaseUrl/api/generate/progress?promptId=$GenId&imageIndex=1&totalImages=1"
    Write-Host "Connecting to: $progressUrl"
    
    $request = [System.Net.WebRequest]::Create($progressUrl)
    $request.Timeout = 300000  # 5 minutes
    
    $response = $request.GetResponse()
    $stream = $response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    
    $eventCount = 0
    while ($true) {
        try {
            $line = $reader.ReadLine()
            if ($null -eq $line) {
                break
            }
            
            if ($line.StartsWith("data: ")) {
                $data = $line.Substring(6) | ConvertFrom-Json
                $eventCount++
                Write-Host "[Event $eventCount] Type: $($data.type), Step: $($data.currentStep)/$($data.totalSteps), Percentage: $($data.percentage)%"
            }
        } catch {
            Write-Host "Error reading stream: $_"
            break
        }
    }
    
    Write-Host ""
    Write-Host "=============================="
    Write-Host "Test complete - received $eventCount events"
    
} catch {
    Write-Host "Error: $_"
    exit 1
}
