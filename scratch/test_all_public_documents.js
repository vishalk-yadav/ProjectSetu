const http = require('http');
const fs = require('fs');
const path = require('path');

function request(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            buffer,
            text: buffer.toString('utf8'),
          });
        });
      })
      .on('error', reject);
  });
}

async function runDocumentTests() {
  console.log('================================================================');
  console.log('📑 TESTING ALL PUBLIC DOCUMENTS & CIRCULARS IN CITIZEN PORTAL');
  console.log('================================================================\n');

  // 1. Fetch public documents list from API
  const apiRes = await request('http://localhost:5000/api/public/documents');
  if (apiRes.statusCode !== 200) {
    console.error(`❌ Failed to fetch /api/public/documents (Status: ${apiRes.statusCode})`);
    process.exit(1);
  }

  const json = JSON.parse(apiRes.text);
  const docs = json.data || [];
  console.log(`Retrieved ${docs.length} public documents from backend API.\n`);

  let passedCount = 0;
  let failedCount = 0;
  const tableData = [];

  for (const doc of docs) {
    console.log(`Testing: "${doc.name}"`);
    const fileUrl = doc.fileUrl;
    const backendUrl = `http://localhost:5000${fileUrl}`;
    const frontendProxiedUrl = `http://localhost:5173${fileUrl}`;
    const filename = path.basename(fileUrl);
    const diskPath = path.resolve(__dirname, '../backend/uploads', filename);

    // Verify disk existence
    const existsOnDisk = fs.existsSync(diskPath);
    const diskSize = existsOnDisk ? fs.statSync(diskPath).size : 0;

    // Test backend direct GET
    const bRes = await request(backendUrl);

    // Test frontend proxied GET
    const fRes = await request(frontendProxiedUrl);

    const isPdf = filename.endsWith('.pdf');
    const isCsv = filename.endsWith('.csv');

    const backendPass =
      bRes.statusCode === 200 &&
      (isPdf ? bRes.headers['content-type']?.includes('pdf') : true) &&
      (isPdf ? bRes.buffer.slice(0, 5).toString() === '%PDF-' : true);

    const frontendPass =
      fRes.statusCode === 200 &&
      (isPdf ? fRes.headers['content-type']?.includes('pdf') : true);

    const success = existsOnDisk && backendPass && frontendPass;

    if (success) {
      console.log(`  ✅ Backend HTTP 200 (${bRes.headers['content-type']}, ${bRes.buffer.length} bytes)`);
      console.log(`  ✅ Frontend Proxy HTTP 200 (${fRes.buffer.length} bytes)`);
      console.log(`  ✅ Disk file: ${filename} (${diskSize} bytes)\n`);
      passedCount++;
    } else {
      console.error(`  ❌ FAILED: backendStatus=${bRes.statusCode}, frontendStatus=${fRes.statusCode}, diskExists=${existsOnDisk}\n`);
      failedCount++;
    }

    tableData.push({
      name: doc.name.slice(0, 45) + (doc.name.length > 45 ? '...' : ''),
      fileUrl,
      diskFile: filename,
      backendStatus: bRes.statusCode,
      frontendStatus: fRes.statusCode,
      size: `${diskSize} B`,
      status: success ? 'PASS' : 'FAIL',
    });
  }

  // Also test official-dpr.pdf explicitly
  console.log('Testing master fallback: "official-dpr.pdf"');
  const masterBackendRes = await request('http://localhost:5000/uploads/official-dpr.pdf');
  const masterFrontendRes = await request('http://localhost:5173/uploads/official-dpr.pdf');
  const masterDisk = fs.existsSync(path.resolve(__dirname, '../backend/uploads/official-dpr.pdf'));
  const masterPass =
    masterBackendRes.statusCode === 200 &&
    masterFrontendRes.statusCode === 200 &&
    masterBackendRes.buffer.slice(0, 5).toString() === '%PDF-' &&
    masterDisk;

  if (masterPass) {
    console.log(`  ✅ Master official-dpr.pdf HTTP 200 on backend & frontend proxy (${masterBackendRes.buffer.length} bytes)\n`);
    passedCount++;
  } else {
    console.error(`  ❌ Master official-dpr.pdf test failed\n`);
    failedCount++;
  }

  // Also test graceful fallback on non-existent document
  console.log('Testing graceful missing document fallback: "non-existent-memo.pdf"');
  const missingRes = await request('http://localhost:5000/uploads/non-existent-memo.pdf');
  let missingJson = {};
  try {
    missingJson = JSON.parse(missingRes.text);
  } catch {}
  const gracefulPass =
    missingRes.statusCode === 404 &&
    missingJson.error === 'DOCUMENT_NOT_FOUND' &&
    missingJson.message?.includes('non-existent-memo.pdf');

  if (gracefulPass) {
    console.log(`  ✅ Graceful 404 handler returned: "${missingJson.message}"\n`);
    passedCount++;
  } else {
    console.error(`  ❌ Graceful missing document test failed\n`);
    failedCount++;
  }

  console.log('================================================================');
  console.log('📊 VERIFICATION SUMMARY TABLE');
  console.log('================================================================');
  console.table(tableData);

  console.log(`\nResults: ${passedCount} tests passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runDocumentTests();
