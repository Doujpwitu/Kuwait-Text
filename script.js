let currentTextIndex = 0;
let texts = [];

// Add these constants at the top
const CLIENT_ID = '703145199309-ttgpbaqfi0me42j781hjsqias8takq84.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Initialize the Google API client
function initClient() {
    return gapi.client.init({
        apiKey: config.API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

// Load the Google API client
function loadGoogleAPI() {
    gapi.load('client', initClient);
}

async function loadDataset() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: config.SPREADSHEET_ID,
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
                spreadsheetId: config.SPREADSHEET_ID,
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

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        loadDataset();
    } else {
        // Add a sign-in button to your HTML
        gapi.auth2.getAuthInstance().signIn();
    }
}

// Start the application
window.onload = loadGoogleAPI;