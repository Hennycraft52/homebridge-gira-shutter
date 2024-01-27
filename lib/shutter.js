const https = require('https');
const axios = require('axios');

class Shutter {
    constructor(ip, shutterid, username, password) {
        this.ip = ip;
        this.shutterid = shutterid;
        this.username = username;
        this.password = password;
        this.axiosInstance = axios.create({
            httpsAgent: new https.Agent({  
                rejectUnauthorized: false
            })
        });
    }

    async getStatus() {
        const response = await this.axiosInstance.get(`https://${this.ip}/endpoints/call?key=CO@${this.shutterid}&method=get&user=${this.username}&pw=${this.password}`);
        return Number(response.data);
    }

    async setStatus(value) {
        const response = await this.axiosInstance.get(`https://${this.ip}/endpoints/call?key=CO@${this.shutterid}&method=set&value=${value}&user=${this.username}&pw=${this.password}`);
        return response.data;
    }
}

module.exports = Shutter;
