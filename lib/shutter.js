
const axios = require('axios');
const https = require('https');

function toggleShutter(ip, shutterId, username, password) {
     const url = `https://${ip}/endpoints/call?key=CO@${shutterId}&method=toggle&value=1&user=${username}&pw=${password}`;

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    return axios.get(url, { httpsAgent: agent })
        .then(response => response.data)
        .catch(error => {
            if (error.response) {
                return error.response.data;
            } else {
                throw error;
            }
        });
}

function getShutterStatus(ip, shutterId, username, password) {
    const url = `https://${ip}/endpoints/call?key=CO@${shutterId}&method=get&user=${username}&pw=${password}`;
    const agent = new https.Agent({ rejectUnauthorized: false });

    return axios.get(url, { httpsAgent: agent })
        .then(response => {
            // Extrahieren Sie den Wert aus der Antwort und geben Sie ihn zur      ck
            const value = response.data.data.value;
            return value === 1.0 ? 1 : 0; // 1 f      r geschlossen, 0 f      r offen
        })
        .catch(error => {
            throw error;
        });
}

module.exports = {
    toggleShutter,
    getShutterStatus
};


