const axios = require('axios');
require('dotenv').config();  //logs to firebase cloud

const express = require('express');
const app = express();
const admin = require('firebase-admin');
const {google} = require('googleapis');
const functions = require("firebase-functions");
const cors = require('cors');

 const twilio = require("twilio");

 const accountSid = "AC4c3a89e56afcb829253b16848592cbea";
const authToken = "ac57125790f08b78ab7546146dc755e1";

const client = twilio(accountSid, authToken);


const GHL_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IkFYRERYUkU1Qkl6eUVCMG9ITVIyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUyNzk4MzUyMDI1LCJzdWIiOiJSYlZnVHVoTXJlc1JHS1RDN1duaiJ9.r3yBF2HQiCl4pTs-YDCdQrny-6U-KUVs3D34GT1qZiI"; // Replace with real token
const BASE_URL = "https://rest.gohighlevel.com/v1/contacts";

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase Initialization
const serviceAccount = require("./firebase-key.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dmlsupervisorportal-default-rtdb.firebaseio.com/"
});


const db = admin.database();
console.log("Firebase Initialized");


const GHL_API_URL1 = process.env.GHL_API_URL1;
 

const PORT = process.env.PORT || 3000;

//inlive const data = req.body;


const fakeDialIn=
[{
  contact_id: "2XsIzRt16f6MuCCTgh5v",  //fake new/return lead
  date_created: "2025-07-16T17:00:00Z",
  contact_type: "Lead",
  firstName: "VicTest",
  lastName: "Thursday",
  phone: "+16175044427",
  customField: {
        kv2NpWohL6HgytGxDTUf: "2nd call",                     // call_reason
        qeSVhtybMa3RLvlsQOyW: "Rent",                          // ownership
        vviDdtzt13kYFJ0tArHx: "Refinance",                    // loanPurpose
        NZPM3MD3RE8dsNjWIXIO: 61000,                          // income
                               // mortgage balance
        Cy6xnfIP7o7vp96afkKR: 6000000,                        // home value
        tFWcygKVgCYrPDcNnjR8: 7,                              // interest rate
        y3Ml2Hn1285PvXTiLgRg: "MA",                           // state
        y4eOfwNw3x1dyUvWtydi: "Purchase",                     // purchase type
        JmQQCrxGnPLao3pkC1YS: ["Consolidate Debts"],          // loan goals
        ywudxg9eTQc9493HUXfo: ["$20,000 to $49,999"],         // cash needed
        dG9EMjknKFhANq2uz7U9: "U.S. Citizen",                 // citizenship
        Hib4pFrdYQL3tmM9vQKX: "Yes",                           // bankruptcies
        vnJV8SWZKnwiHK43N2gZ: "I'm there real estate agent"   // notes
      },
  customData: {
    lead_id: "lead_1001",
    phone_number: "+16175044426",
    state: "GA",
    call_reason: "Wants to refinance home loan",
    estimatedHomeValue: "425000",
    remainingMortgage: "180000",
    additionalCashDesired: "15000",
    estimatedCreditScore: "710",
    monthlyIncome: "8200",
    loanPurpose: "Rate/Term Refi",
    employmentStatus: "Self-employed",
    veteranBenefits: "No"
  }
}]

async function createContactFromWebhookData(data) {
  const contactId = data.contact_id
  const phone = data.phone || data.customData?.phone_number || null;
  const state = data.customData?.state || "Unknown";
  const reason = data.customData?.call_reason || "Unspecified";
  const callReason = data.customField?.kv2NpWohL6HgytGxDTUf || null;
const ownership = data.customField?.qeSVhtybMa3RLvlsQOyW || null;
const loanPurpose = data.customField?.vviDdtzt13kYFJ0tArHx || null;
const monthlyIncome = data.customField?.NZPM3MD3RE8dsNjWIXIO || null;
const homeValue = data.customField?.Cy6xnfIP7o7vp96afkKR || null;
const interestRate = data.customField?.tFWcygKVgCYrPDcNnjR8 || null;
const purchaseType = data.customField?.y4eOfwNw3x1dyUvWtydi || null;
const loanGoals = data.customField?.JmQQCrxGnPLao3pkC1YS || null;
const cashNeeded = data.customField?.ywudxg9eTQc9493HUXfo || null;
const citizenship = data.customField?.dG9EMjknKFhANq2uz7U9 || null;
const bankruptcies = data.customField?.Hib4pFrdYQL3tmM9vQKX || null;
const notes = data.customField?.vnJV8SWZKnwiHK43N2gZ || null;

  const estimatedHomeValue = data.customData?.estimatedHomeValue || null;
  const remainingMortgage = data.customData?.remainingMortgage || null;
  const additionalCashDesired = data.customData?.additionalCashDesired || null;
  const estimatedCreditScore = data.customData?.estimatedCreditScore || null;
   const employmentStatus = data.customData?.employmentStatus || null;
  const veteranBenefits = data.customData?.veteranBenefits || null;

  const contactUrl = `${GHL_API_URL1}/contacts/`;

  try {
    const response = await axios.post(contactUrl, {
      contactId,
      phone,
      customField: {
        call_reason: reason,
        state,
              kv2NpWohL6HgytGxDTUf: reason,                     // call_reason
      y3Ml2Hn1285PvXTiLgRg: state,                      // state
      Cy6xnfIP7o7vp96afkKR: estimatedHomeValue,         // home value
       ywudxg9eTQc9493HUXfo: additionalCashDesired,       // cash needed
      YwWNl4Ll4OFjxXbYF1LQ: estimatedCreditScore,        // credit score
      NZPM3MD3RE8dsNjWIXIO: monthlyIncome,               // income
      vviDdtzt13kYFJ0tArHx: loanPurpose,                 // loan purpose
      F7MQedPaigNiyNxu0Vmw: employmentStatus,           // employment
      QEWjahYUmJmkMrjDFlqh: veteranBenefits              // vet status
      }
    }, {
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    console.log("✅ Contact Created:", response.data);
    return response.data.contact.id;

  } catch (err) {
    console.error("❌ Contact Creation Error:", err.response?.data || err.message);
    return null;
  }
}

async function createTask(contactId, assignedUserId, taskTitle, taskDescription, dueDate) {
    //const taskUrl = `${GHL_API_URL}/tasks`;

    const taskUrl = `${GHL_API_URL1}/contacts/${contactId}/tasks`;
    console.log(`Creating Task at URL: ${taskUrl}`);
        const formattedDueDate = new Date(dueDate).toISOString().replace(/\.\d{3}Z$/, 'Z');

    try {
      const response = await axios({
        method: 'POST',
        url: taskUrl,
        headers: {
          Authorization: `Bearer ${GHL_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        data: {
          //title: taskTitle,
          //dueDate: dueDate,
          //contactId: contactId,
          //assignedToUserId: assignedUserId,
          //description: taskDescription
          title: taskTitle,
            body: taskDescription,
            dueDate: formattedDueDate,
           // phone:phoneNumber,
            completed: false,
            assignedTo: assignedUserId
        }
      });
  
      console.log("Task created successfully:", response.data);
  
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
    }
  }





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

// keep your helper export
exports.findContactByUniqueId = findContactByUniqueId;

if (process.env.LOCAL_DEV) {
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
} else {
  // only export the function in non-local mode
  exports.api = functions.https.onRequest(app);
}

