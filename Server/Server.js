require("dotenv").config()
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const app=express()
const port = process.env.PORT;
const api=process.env.API_KEY
const validUsername = 'InterstyleRetai\\interstyleadmin';
const validPassword = 'Sunshine@12';

app.use(cors({
  origin: ["http://localhost:3000", "https://interstyle-reactvs.onrender.com/"]
}));
app.use(bodyParser.json());



const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Received Authorization Header:', authHeader);
  
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'UnauthorizedsS' });
    }
  
    const credentials = Buffer.from(authHeader.slice('Basic '.length), 'base64').toString('utf-8').split(':');
    const username = credentials[0];
    const password = credentials[1];
  
    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    next(); // Proceed to the next middleware
  };

  app.post('/', (req, res) => {
    const { username, password } = req.body;
  
   

    if (username === validUsername && password === validPassword) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Your session status route
    app.get('/session-status', (req, res) => {
    if (req.session.isLoggedIn) {
      res.json({ isLoggedIn: true, username: req.session.username });
    } else {
      res.json({ isLoggedIn: false });
    }
  });
  
  app.get('/api/data', authenticate,  async (req, res) => {
    try {
      const searchTxt = req.query.searchTxt;
      const base_url = api;

      // Construct the URL for the barcode lookup
      const url = `${base_url}&SearchTxt=${searchTxt}`;
  
      // Set up headers with basic authentication
      const headers = {
        'Authorization': `Basic ${Buffer.from(`${validUsername}:${validPassword}`).toString('base64')}`,
      'Content-Type': 'application/json',
      };
  
      console.log('Request Headers:', headers);
      // Make the API request using the fetch method
      const response = await axios.get(url, { headers });
  
      // Check the response status
      if (response.status === 200) {
        // Parse the response JSON
        const data = response.data;
        console.log('Response Data:', response.data);
        // Return the data to the client
        res.json(data);
      } else {
        res.status(response.status).json({ error: `Error: ${response.status}` });
        console.log('Response Status Code:', response.status);
    }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });


app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
