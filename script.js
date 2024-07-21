const apiKey = 'bf276e6c-a184-47d9-807e-cdb786b51a61';

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
}