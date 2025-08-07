const axios = require('axios');

const GHL_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IkFYRERYUkU1Qkl6eUVCMG9ITVIyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUyNzk4MzUyMDI1LCJzdWIiOiJSYlZnVHVoTXJlc1JHS1RDN1duaiJ9.r3yBF2HQiCl4pTs-YDCdQrny-6U-KUVs3D34GT1qZiI"; // Replace with real token
const BASE_URL = "https://rest.gohighlevel.com/v1/contacts";

// Finds a single contact by RT/IC ID
async function findContactByUniqueId(searchValue) {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    const contacts = response.data.contacts || [];

    for (const contact of contacts) {
      if (Array.isArray(contact.customField)) {
        const match = contact.customField.find(field =>
          typeof field.value === 'string' && field.value.toUpperCase() === searchValue.toUpperCase()
        );

        if (match) {
          return contact; // ✅ Return full contact if found
        }
      }
    }

    return null; // ❌ No match
  } catch (error) {
    console.error("❌ Error in findContactByUniqueId:", error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  findContactByUniqueId
};
