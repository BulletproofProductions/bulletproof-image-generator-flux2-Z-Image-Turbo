#!/usr/bin/env node

/**
 * Manual Test Script - Progress Display Fix Validation
 * 
 * This script:
 * 1. Creates a generation via API
 * 2. Monitors SSE progress events in real-time
 * 3. Validates that step count progresses 0/20 → 1/20 → ... → 20/20
 * 4. Logs all events for verification
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function validateProgressFix() {
  console.log('\n🧪 MANUAL VALIDATION TEST - Progress Display Fix');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get some presets/settings
    console.log('\n📋 Step 1: Fetching app configuration...');
    const configRes = await makeRequest('GET', '/api/presets');
    const presets = JSON.parse(configRes.body);
    console.log(`   ✅ Got ${presets.length || 0} presets`);

    // Step 2: Create a generation
    console.log('\n📝 Step 2: Creating image generation request...');
    const generationPayload = {
      prompt: 'a beautiful sunset over mountains, professional photography, golden hour lighting',
      settings: {
        resolution: '1K',
        aspectRatio: '1:1',
        model: 'default',
        steps: 20,
        seed: Math.floor(Math.random() * 1000000),
      },
    };

    const genRes = await makeRequest('POST', '/api/generate', generationPayload);
    let generation;
    try {
      generation = JSON.parse(genRes.body);
      // Handle wrapped response
      if (generation.generation) {
        generation = generation.generation;
      }
    } catch (e) {
      console.error('   ❌ Failed to parse generation response');
      console.error('   Response:', genRes.body.substring(0, 200));
      return;
    }
    const generationId = generation?.id;
    
    if (!generationId) {
      console.error('   ❌ Failed to create generation');
      console.error('   Response:', JSON.stringify(generation, null, 2));
      return;
    }
    
    console.log(`   ✅ Generation created with ID: ${generationId}`);

    // Step 3: Monitor SSE progress events
    console.log('\n📊 Step 3: Monitoring progress events...');
    console.log('   Connecting to SSE endpoint...\n');

    const progressUrl = `${BASE_URL}/api/generate/progress?promptId=${generationId}&imageIndex=1&totalImages=1`;
    const progressUrl2 = new URL(progressUrl);

    await new Promise((resolve, reject) => {
      const options = {
        hostname: progressUrl2.hostname,
        port: progressUrl2.port,
        path: progressUrl2.pathname + progressUrl2.search,
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
        },
      };

      const req = http.request(options, (res) => {
        let buffer = '';
        let eventCount = 0;
        let maxStepsSeen = 0;
        let lastStep = -1;
        const startTime = Date.now();

        console.log('   📡 Events received:');

        res.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                eventCount++;
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

                // Log event
                const icon = eventData.type === 'progress' ? '📈' : 
                            eventData.type === 'complete' ? '✅' :
                            eventData.type === 'connected' ? '🔗' :
                            eventData.type === 'error' ? '❌' : '❓';
                
                console.log(`   ${icon} [${elapsed}s] Event ${eventCount}: type="${eventData.type}", ` +
                  `step=${eventData.currentStep}, totalSteps=${eventData.totalSteps}, ` +
                  `percentage=${eventData.percentage}%`);

                // Validation checks
                if (eventData.totalSteps !== undefined) {
                  if (eventData.totalSteps === 20) {
                    console.log(`      ✨ CORRECT: totalSteps = 20 (inference phase)`);
                  } else if (eventData.totalSteps === 3) {
                    console.log(`      ℹ️  Setup phase: totalSteps = 3 (aggregate nodes)`);
                  }
                }

                if (eventData.currentStep !== undefined && eventData.currentStep > lastStep) {
                  lastStep = eventData.currentStep;
                  if (eventData.currentStep > maxStepsSeen) {
                    maxStepsSeen = eventData.currentStep;
                  }
                }

                // Stop on complete
                if (eventData.type === 'complete') {
                  resolve({
                    eventCount,
                    maxStep: maxStepsSeen,
                    success: true,
                  });
                }
              } catch (e) {
                console.error('   Error parsing event:', e.message);
              }
            }
          }
        });

        res.on('end', () => {
          resolve({
            eventCount,
            maxStep: maxStepsSeen,
            success: eventCount > 0,
          });
        });

        res.on('error', reject);

        // Timeout after 5 minutes
        setTimeout(() => {
          req.destroy();
          resolve({
            eventCount,
            maxStep: maxStepsSeen,
            success: eventCount > 0,
            timedOut: true,
          });
        }, 300000);
      });

      req.on('error', reject);
      req.end();
    });

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VALIDATION COMPLETE');
  console.log('='.repeat(60));
  console.log('\nTo verify the fix:');
  console.log('1. Check that totalSteps changes from 3 → 20 when inference starts');
  console.log('2. Verify step counter shows: 1/20, 2/20, 3/20, ..., 20/20');
  console.log('3. Verify percentage increases smoothly: 5%, 10%, 15%, ..., 100%');
  console.log('4. Check browser console: [useGeneration] logs should show totalSteps: 20');
  console.log('\n');
}

validateProgressFix().catch(console.error);
