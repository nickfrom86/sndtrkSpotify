const Airtable = require('airtable');

// Configure your Airtable API key and base ID
const apiKey = 'keysbCmKFPRBZkZi7';
const baseId = 'appXpnPyZSSb41dPT';

// Create an instance of the Airtable base
const base = new Airtable({ apiKey }).base(baseId);

module.exports = base;
