const https = require('https');
const request = require('request-promise-native');

/**
 * Defines Alexa Skill Messaging API class
 */
class SkillMessagingApi {
  constructor(clientId, clientSecret, userId, apiUrl='https://api.amazonalexa.com', authHost = 'https://api.amazon.com') {
    this.apiUrl = apiUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.userId = userId;
    this.authHost = authHost;
  }

  /**
   * Get access token
   * @return {Promise}
   */
  async getAccessToken() {
    const form = {
      grant_type: 'client_credentials',
      scope: 'alexa:skill_messaging',
      client_id: this.clientId,
      client_secret: this.clientSecret
    };
      
    const options = {
      method: 'POST',
      uri: 'https://api.amazon.com/auth/O2/token',
      json: true,
      form: {
        grant_type: 'client_credentials',
        scope: 'alexa:skill_messaging',
        client_id: this.clientId,
        client_secret: this.clientSecret
      }
    };
    //~ return request(options)
      //~ .then(function (res) {
        //~ return res.access_token
      //~ });
    const response = await this.handleRequest(this.authHost,'auth/O2/token', 'POST',{ form: form });
    console.log(response);
    return response.access_token
  }

  /**
   * Send message
   * @param  {Object}  data
   * @return {Promise}
   */
  async sendMessage(data = {}) {
    const options = {
      method: 'POST',
      uri: `${this.apiUrl}/v1/skillmessages/users/${this.userId}`,
      auth: {
        bearer: await this.getAccessToken()
      },
      json: {
        data: data,
        expiresAfterSeconds: 60
      }
    };
    console.log(options);
    const params = { 
      json: data, 
      keytype: 'Authorization', 
      key: { bearer: await this.getAccessToken() }
    };
    return await this.handleRequest(this.apiUrl,`v1/skillmessages/users/${this.userId}`, 'POST', params);
  }
  
  handleRequest(host, scope, method = 'GET', parameters = {}) {
    //~ Zenkit doesn't use querystrings
    //~ queryParameters.ie = (new Date()).getTime();
    //~ queryParameters.show_archived = false
    console.log(parameters);
    var queryString = '';
    var paramString = ''
    //~ if ('query' in parameters && Object.entries(parameters.query).length > 0) {
      //~ const queryString = `?${new URLSearchParams(queryParameters)}`;
    //~ }
    const options = {
      hostname: host,
      port: 443,
      path: `/${scope}${queryString}`,
      method: method,
      headers: {
        'Cache-Control':'no-cache',
      }
    }
    if (parameters.keyType && parameters.key) {
      options.headers[parameters.keyType] = JSON.stringify(parameters.key);
    }
    if ('json' in parameters) {
      paramString = JSON.stringify(parameters.json);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(paramString)
    } else if ('form' in parameters) {
      paramString = Object.entries(parameters.form)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(paramString)
    }
    console.log(options);
    console.log(paramString);
    return new Promise(function(resolve, reject) {
      const req = https.request(options, function(res) {
        req.on('error', (e) => { reject(e); });
        var body = [];
        res.on('data', (chunk) => { body.push(chunk); });
        res.on('end', function() {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
            body = Buffer.concat(body).toString();
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            console.log(body);
            return reject(new Error('statusCode=' + res.statusCode));
          }
          resolve(body);
        });
      });
      
      if (paramString) {
        req.write(paramString);
      }
      req.end();
    });
  }
}

module.exports = SkillMessagingApi;
