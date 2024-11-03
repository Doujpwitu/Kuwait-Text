const SPREADSHEET_ID = '1r2vMFENPLmxYA_qyJksPvsA3O2dPfjv4BcsozKYqfcE';
const API_KEY = 'AIzaSyAGE6S7YFJJKb2kqAkVAH23VsCd0DWeXfk'; // You'll need to replace this with your actual API key
let currentTextIndex = 0;
let texts = [];

// Initialize the Google API client
function initClient() {
    return gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        loadDataset();
    }).catch(function(error) {
        console.error('Error initializing Google API client:', error);
        document.getElementById('textDisplay').textContent = 'خطأ في تهيئة Google API';
    });
}

// Load the Google API client
function loadGoogleAPI() {
    gapi.load('client', initClient);
}

async function loadDataset() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:A',
        });
        texts = response.result.values.flat() || [];
        updateDisplay();
    } catch (error) {
        console.error('Error loading dataset:', error);
        document.getElementById('textDisplay').textContent = 
            'خطأ في تحميل مجموعة البيانات';
    }
}

async function labelText(sentiment) {
    if (currentTextIndex < texts.length) {
        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:D',
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [[
                        texts[currentTextIndex],
                        sentiment,
                        new Date().toISOString()
                    ]],
                },
            });
            
            currentTextIndex++;
            updateDisplay();
        } catch (error) {
            console.error('Error saving label:', error);
            alert('خطأ في حفظ التصنيف');
        }
    }
}

function updateDisplay() {
    if (currentTextIndex < texts.length) {
        document.getElementById('textDisplay').textContent = texts[currentTextIndex];
        
        const progress = (currentTextIndex / texts.length) * 100;
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${Math.round(progress)}%`;
    } else {
        document.getElementById('textDisplay').textContent = 'تم الانتهاء من جميع النصوص';
        
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = '100%';
        progressBar.setAttribute('aria-valuenow', 100);
        progressBar.textContent = '100%';
    }
}

// Start the application
window.onload = loadGoogleAPI;