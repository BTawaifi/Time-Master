const fs = require('fs').promises;

async function runBenchmark() {
    console.log("Starting I/O benchmark with fs.access...");

    const dummyFilePath = 'dummy_logs_2.json';
    await fs.writeFile(dummyFilePath, "x".repeat(1024 * 1024 * 5)); // 5MB dummy file

    // 1. With fs.access
    const start1 = process.hrtime.bigint();
    const tasks1 = [];
    for (let i = 0; i < 50; i++) {
        tasks1.push((async () => {
            try {
                await fs.access(dummyFilePath);
                await fs.readFile(dummyFilePath, 'utf8');
            } catch (e) { }
        })());
    }
    await Promise.all(tasks1);
    const end1 = process.hrtime.bigint();
    console.log(`Time taken with fs.access (file exists): ${Number(end1 - start1) / 1000000} ms`);

    // 2. File missing - With fs.access
    const missingFilePath = 'does_not_exist.json';
    const start3 = process.hrtime.bigint();
    const tasks3 = [];
    for (let i = 0; i < 1000; i++) {
        tasks3.push((async () => {
            try {
                await fs.access(missingFilePath);
                await fs.readFile(missingFilePath, 'utf8');
            } catch (e) { }
        })());
    }
    await Promise.all(tasks3);
    const end3 = process.hrtime.bigint();
    console.log(`Time taken with fs.access (file missing): ${Number(end3 - start3) / 1000000} ms`);

    // Clean up
    await fs.unlink(dummyFilePath).catch(() => {});
    process.exit(0);
}

runBenchmark().catch(console.error);
