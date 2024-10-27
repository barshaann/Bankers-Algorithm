function generateMatrices() {
    const p = document.getElementById("numProcesses").value;
    const r = document.getElementById("numResources").value;
    const container = document.getElementById("matrices");

    if (!p || !r) {
        alert("Please enter the number of processes and resources.");
        return;
    }

    container.innerHTML = `
        <h3>Enter Allocation Matrix:</h3>
        ${createMatrix('alloc', p, r)}
        <h3>Enter Maximum Matrix:</h3>
        ${createMatrix('max', p, r)}
        <h3>Enter Available Resources:</h3>
        ${createArray('avail', r)}
    `;
}

function createMatrix(idPrefix, rows, cols) {
    let html = `<div class="matrix">`;
    for (let i = 0; i < rows; i++) {
        html += `<div>`;
        for (let j = 0; j < cols; j++) {
            html += `<input type="number" id="${idPrefix}-${i}-${j}" min="0" style="width: 50px;"> `;
        }
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

function createArray(idPrefix, cols) {
    let html = `<div>`;
    for (let i = 0; i < cols; i++) {
        html += `<input type="number" id="${idPrefix}-${i}" min="0" style="width: 50px;"> `;
    }
    html += `</div>`;
    return html;
}

function loadSampleData() {
    document.getElementById("numProcesses").value = 5;
    document.getElementById("numResources").value = 3;
    generateMatrices();
    const sampleAlloc = [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2]
    ];
    const sampleMax = [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3]
    ];
    const sampleAvail = [3, 3, 2];
    fillMatrix('alloc', sampleAlloc);
    fillMatrix('max', sampleMax);
    fillArray('avail', sampleAvail);
}

function fillMatrix(idPrefix, matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            document.getElementById(`${idPrefix}-${i}-${j}`).value = matrix[i][j];
        }
    }
}

function fillArray(idPrefix, array) {
    for (let i = 0; i < array.length; i++) {
        document.getElementById(`${idPrefix}-${i}`).value = array[i];
    }
}

function calculateSafeSequence() {
    const p = parseInt(document.getElementById("numProcesses").value);
    const r = parseInt(document.getElementById("numResources").value);

    const alloc = getMatrix('alloc', p, r);
    const max = getMatrix('max', p, r);
    const avail = getArray('avail', r);

    const need = Array.from({ length: p }, () => Array(r).fill(0));
    for (let i = 0; i < p; i++) {
        for (let j = 0; j < r; j++) {
            need[i][j] = max[i][j] - alloc[i][j];
        }
    }

    const finish = Array(p).fill(false);
    const safeSeq = [];
    let work = [...avail];
    let count = 0;
    let output = document.getElementById("output");
    output.innerHTML = "";

    while (count < p) {
        let found = false;
        for (let i = 0; i < p; i++) {
            if (!finish[i]) {
                let canAllocate = true;
                for (let j = 0; j < r; j++) {
                    if (need[i][j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }
                if (canAllocate) {
                    for (let k = 0; k < r; k++) {
                        work[k] += alloc[i][k];
                    }
                    safeSeq.push(`p${i}`);  // Use p1, p2, etc.
                    output.innerHTML += `<div class="process-step">Process ${i} added to safe sequence.</div>`;
                    finish[i] = true;
                    found = true;
                    count++;
                }
            }
        }
        if (!found) {
            output.innerHTML = "The system is not in a safe state.";
            return;
        }
    }

    // Update safe sequence format with '>'
    output.innerHTML += `<p>The system is in a safe state. Safe sequence is: ${safeSeq.join(" > ")}</p>`;
}


function exportSafeSequence() {
    const numProcesses = document.getElementById("numProcesses").value;
    const numResources = document.getElementById("numResources").value;

    const allocMatrix = getMatrix('alloc', parseInt(numProcesses), parseInt(numResources));
    
    const maxMatrix = getMatrix('max', parseInt(numProcesses), parseInt(numResources));
    
    const availResources = getArray('avail', parseInt(numResources));

    let allocText = `Allocation Matrix:\n${allocMatrix.map(row => row.join(' ')).join('\n')}\n\n`;
    let maxText = `Maximum Matrix:\n${maxMatrix.map(row => row.join(' ')).join('\n')}\n\n`;
    let availText = `Available Resources:\n${availResources.join(' ')}\n\n`;

    const output = document.getElementById("output").innerText;
    const exportText = `Number of Processes: ${numProcesses}\nNumber of Resources: ${numResources}\n\n${allocText}${maxText}${availText}${output}`;

    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SafeSequence.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}



function getMatrix(idPrefix, rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = parseInt(document.getElementById(`${idPrefix}-${i}-${j}`).value) || 0;
        }
    }
    return matrix;
}

function getArray(idPrefix, cols) {
    const array = [];
    for (let i = 0; i < cols; i++) {
        array[i] = parseInt(document.getElementById(`${idPrefix}-${i}`).value) || 0;
    }
    return array;
}
