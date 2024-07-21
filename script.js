const apiKey = 'bf276e6c-a184-47d9-807e-cdb786b51a61';
let heightData;

// const csvData = `
// Age,M,M var,MAA,MAA var,F,F var,FAA,FAA var
// 6,6.63,0.9,7.17,0.93,6.53,0.86,6.24,1.48
// 7,6.18,0.72,6.21,0.8,6.25,0.87,6.4,1.25
// 8,5.92,0.98,5.75,0.85,5.99,1.05,6.05,1.17
// 9,5.63,1.02,5.4,0.93,5.86,1.23,6.76,1.58
// 10,5.49,1.18,5.64,1.33,6.26,1.44,6.81,1.8
// 11,5.57,1.53,6.39,1.94,6.65,1.55,6.87,1.81
// 12,6.49,2.08,6.89,2.7,6.11,1.83,5.55,2.29
// 13,7.66,2.4,7.47,2.33,4.54,2.28,2.59,1.67
// 14,6.81,2.4,6.21,2.69,2.56,1.93,1.49,1.57
// 15,4.51,2.62,4.11,2.57,1.24,1.22,0.38,0.71
// 16,2.66,2.18,2.06,1.69,0.66,1.03,0.53,0.75
// 17,1.13,1.33,0.93,1,0.34,0.62,0.25,0.6
// 18,0.48,0.56,0.4,0.55,,,,,,,
// `;
// function processCsvData(csv) {
//     const lines = csv.trim().split('\n');
//     const headers = lines[0].split(',');
//     heightData = lines.slice(1).map(line => {
//         const values = line.split(',');
//         return headers.reduce((obj, header, index) => {
//             obj[header] = parseFloat(values[index]);
//             return obj;
//         }, {});
//     });
// }
// let heightData = [];
// processCsvData(csvData);

document.getElementById('cut-button').addEventListener('click', cutText);
document.getElementById('define-button').addEventListener('click', lookupDefinition);
document.getElementById('word-input').addEventListener('dblclick', handleDoubleClick);
document.getElementById('calculate-button').addEventListener('click', calculateHeightVelocity);

function cutText() {
    var textBox = document.getElementById('text-box');
    textBox.select();
    textBox.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand('cut');
}

async function lookupDefinition() {
    const word = document.getElementById('word-input').value;
    const url = `https://www.dictionaryapi.com/api/v3/references/medical/json/${word}?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        let definition = "<p>No definition found.</p>";

        if (Array.isArray(data) && data.length > 0 && data[0].shortdef) {
            definition = '<ul>' + data[0].shortdef.map(def => `<li>${def}</li>`).join('') + '</ul>';
        }
        document.getElementById('definition-box').innerHTML = definition;
    } catch (error) {
        console.error('Error fetching definition:', error);
        document.getElementById('definition-box').innerHTML = '<p>Error fetching definition.</p>';
    }
}

// Function to handle double-click to clear and paste text
function handleDoubleClick(event) {
    navigator.clipboard.readText()
        .then(text => {
            event.target.value = text;
        })
        .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
}

function calculateHeightVelocity() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    const startHeight = parseFloat(document.getElementById('start-height').value);
    const endHeight = parseFloat(document.getElementById('end-height').value);
    const age = parseInt(document.getElementById('age').value, 10);

    if (isNaN(startHeight) || isNaN(endHeight) || isNaN(startDate) || isNaN(endDate)) {
        document.getElementById('velocity-result').innerText = 'Please enter valid inputs.';
        return;
    }

    const yearsDifference = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365); // Approximate year difference
    if (yearsDifference <= 0) {
        document.getElementById('velocity-result').innerText = 'End date must be later than start date.';
        return;
    }

    const heightDifference = endHeight - startHeight;
    const velocity = heightDifference / yearsDifference;
    
    document.getElementById('velocity-result').innerText = `Height velocity: ${velocity.toFixed(2)} cm/year`;

    if (heightData) {
        analyzeHeightVelocity(age, velocity);
    }
    else {
        fetchHeightData().then(() => analyzeHeightVelocity(age, velocity));
    }
}

function fetchHeightData() {
    return fetch('height_data.csv')
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',');
            heightData = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    obj[header] = parseFloat(values[index]);
                    return obj;
                }, {});
            });
        })
        .catch(error => {
            console.error('Error fetching height data:', error);
        });
}

function analyzeHeightVelocity(age, velocity) {
    const ageData = heightData.find(data => data.Age === age);

    if (!ageData) {
        document.getElementById('normal-range-result').innerText = 'No data available for the entered age.';
        return;
    }

    const result = [];

    function checkRange(type, val, variance) {
        const min = val - variance;
        const max = val + variance;
        if (velocity < min) {
            return `${type}: Low`;
        } else if (velocity > max) {
            return `${type}: High`;
        } else {
            return `${type}: Normal`;
        }
    }

    result.push(checkRange('Male (Non-African American)', ageData.M, ageData['M var']));
    result.push(checkRange('Male (African American)', ageData.MAA, ageData['MAA var']));
    result.push(checkRange('Female (Non-African American)', ageData.F, ageData['F var']));
    result.push(checkRange('Female (African American)', ageData.FAA, ageData['FAA var']));

    document.getElementById('normal-range-result').innerHTML = result.join('<br>');
}