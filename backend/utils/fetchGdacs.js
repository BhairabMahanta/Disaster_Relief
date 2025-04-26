const axios = require('axios');
const xml2js = require('xml2js');
const Alert = require('../models/Disaster');

const parser = new xml2js.Parser({ explicitArray: false });

function extractCountry(text) {
  // Updated regex to account for multi-word country names
  const match = text.match(/(?:in\s|^)(?!Green|Red|Yellow|Orange)([A-Za-z ]+?)(?:\s|,|\.| at| on| UTC| with|\/)/);
  const country = match ? match[1].trim() : 'Unknown';
  console.log('Extracted Country:', country); // Log the extracted country for debugging
  return country;
}


async function fetchAndStoreGdacsData() {
  try {
    const { data } = await axios.get('https://gdacs.org/xml/rss_7d.xml');
    const result = await parser.parseStringPromise(data);

    const items = Array.isArray(result.rss.channel.item)
    ? result.rss.channel.item
    : [result.rss.channel.item];
  
  for (let item of items) {
    const eventId =
      item.guid && typeof item.guid === 'object'
        ? item.guid._
        : typeof item.guid === 'string'
        ? item.guid
        : null;
  
    if (!eventId) {
      console.warn('Skipping alert with null eventId');
      continue;
    }
  
    const title = item.title || 'Untitled';
    const summary = item.description || 'No description available';
    const link = item.link || '#';
    const pubDate = item.pubDate ? new Date(item.pubDate) : null;
  
    const lat = item['geo:lat'] ? parseFloat(item['geo:lat']) : null;
    const long = item['geo:long'] ? parseFloat(item['geo:long']) : null;

    const country = extractCountry(title + ' ' + summary);
  
    const exists = await Alert.findOne({ eventId });
  
    if (!exists) {
      await Alert.create({
        eventId,
        title,
        summary,
        link,
        lat,
        long,
        eventDate: pubDate,
        location: country,
      });
      }
    }
  } catch (error) {
    console.error("Error fetching or storing GDACS data:", error.message);
  }
}

module.exports = fetchAndStoreGdacsData;
