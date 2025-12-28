const http = require('http');

const generationId = process.argv[2] || '7d392e46-1d6f-4e59-b6c0-03344c83f745';
const url = `http://localhost:3000/api/generate/progress?promptId=${generationId}`;

console.log(`[Monitor] Connecting to progress endpoint: ${url}`);

const request = http.get(url, (response) => {
  console.log(`[Monitor] Status: ${response.statusCode}`);
  
  let buffer = '';
  
  response.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    
    // Process all complete lines
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          console.log(`[SSE Event]`, {
            type: data.type,
            totalSteps: data.totalSteps,
            step: data.currentStep,
            percentage: data.percentage,
            status: data.status,
          });
        } catch (e) {
          console.error('[SSE Parse Error]', e.message, line);
        }
      }
    }
    
    // Keep the last incomplete line in the buffer
    buffer = lines[lines.length - 1];
  });
  
  response.on('end', () => {
    console.log('[Monitor] Stream ended');
  });
  
  response.on('error', (err) => {
    console.error('[Monitor] Error:', err.message);
  });
});

request.on('error', (err) => {
  console.error('[Request Error]', err.message);
});

// Timeout after 2 minutes
setTimeout(() => {
  console.log('[Monitor] Timeout - stopping after 120 seconds');
  process.exit(0);
}, 120000);
