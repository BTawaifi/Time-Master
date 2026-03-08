const { performance } = require('perf_hooks');

// Generate mock archive data
const numDays = 365;
const logsPerDay = 5;
const archiveData = {};

let currentDate = new Date('2025-01-01');

for (let i = 0; i < numDays; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    archiveData[dateStr] = [];
    for (let j = 0; j < logsPerDay; j++) {
        archiveData[dateStr].push({
            id: `log-${i}-${j}`,
            activity: 'Deep work',
            focusDepth: 8,
            utility: 9,
            energyLevel: 7
        });
    }
    currentDate.setDate(currentDate.getDate() + 1);
}

// Function definitions representing BEFORE and AFTER

// BEFORE the optimization
function getVisibleLogsBefore(startDate, endDate) {
    const visible = [];
    const sortedDates = Object.keys(archiveData).sort((a, b) => b.localeCompare(a));
    for (const date of sortedDates) {
        const isInRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);
        if (isInRange) {
            const dayLogs = [...archiveData[date]]
                .reverse()
                .map((l) => ({ ...l, date }));
            visible.push(...dayLogs);
        }
    }
    return visible;
}

// AFTER the optimization
// We simulate memoizing sortedDates since archiveData didn't change
const memoizedSortedDates = Object.keys(archiveData).sort((a, b) => b.localeCompare(a));

function getVisibleLogsAfter(startDate, endDate) {
    const visible = [];
    for (const date of memoizedSortedDates) {
        const isInRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);
        if (isInRange) {
            const dayLogs = [...archiveData[date]]
                .reverse()
                .map((l) => ({ ...l, date }));
            visible.push(...dayLogs);
        }
    }
    return visible;
}

// Benchmarking
const iterations = 1000;
const testStartDate = '2025-06-01';
const testEndDate = '2025-12-31';

console.log(`Running benchmark with ${iterations} iterations (simulating changing start/end date filters)...`);

// Warmup
for (let i = 0; i < 100; i++) {
    getVisibleLogsBefore(testStartDate, testEndDate);
    getVisibleLogsAfter(testStartDate, testEndDate);
}

const t0 = performance.now();
for (let i = 0; i < iterations; i++) {
    getVisibleLogsBefore(testStartDate, testEndDate);
}
const t1 = performance.now();
const durationBefore = t1 - t0;

const t2 = performance.now();
for (let i = 0; i < iterations; i++) {
    getVisibleLogsAfter(testStartDate, testEndDate);
}
const t3 = performance.now();
const durationAfter = t3 - t2;

console.log(`Baseline (Before Optimization): ${durationBefore.toFixed(2)} ms`);
console.log(`Optimized (After Optimization): ${durationAfter.toFixed(2)} ms`);
const improvement = ((durationBefore - durationAfter) / durationBefore * 100).toFixed(2);
console.log(`Improvement: ${improvement}% faster`);
