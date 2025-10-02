import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Finch from "@tryfinch/finch-api";
import axios from "axios";

// Load env vars
dotenv.config();

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Store token in memory for dev (use DB in prod)
let currentAccessToken = null;

// Finch client setup
const finch = new Finch({
  clientId: process.env.FINCH_CLIENT_ID,
  clientSecret: process.env.FINCH_CLIENT_SECRET,
  environment: "sandbox",
  apiVersion: "2020-09-17",
});

// Helper functions

// Get token from header or stored token
function getAccessToken(req) {
  var authHeader = req.headers.authorization;
  if (authHeader) {
    var parts = authHeader.split(" ");
    if (parts.length > 1) {
      return parts[1];
    }
  }
  return currentAccessToken;
}

// Create authenticated Finch client
function createAuthenticatedClient(token) {
  return new Finch({ 
    accessToken: token, 
    environment: "sandbox", 
    apiVersion: "2020-09-17" 
  });
}

// Handle API errors
function handleApiError(err, res, endpoint) {
  var status = 500;
  var message = { error: "Failed to fetch " + endpoint };
  
  // Handle network errors (socket hang up, connection refused, etc.)
  if (err && (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED' || 
              err.message && err.message.includes('socket hang up'))) {
    console.error("/" + endpoint + " network error:", err.message || err.code);
    return res.status(503).json({ 
      error: "Network connection error. Please try again later.",
      details: "Unable to connect to Finch API"
    });
  }
  
  // Handle timeout errors
  if (err && (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND')) {
    console.error("/" + endpoint + " timeout error:", err.message || err.code);
    return res.status(504).json({ 
      error: "Request timeout. Please try again later.",
      details: "Finch API request timed out"
    });
  }
  
  if (err && err.response) {
    status = err.response.status || 500;
    message = err.response.data || message;
  }
  
  console.error("/" + endpoint + " error:", status, message, err ? err.message : "");
  
  // Handle provider errors
  if (status === 404 || status === 501) {
    return res.status(status).json({ error: "Provider does not implement " + endpoint + " endpoint" });
  }
  
  // Handle rate limiting
  if (status === 429) {
    return res.status(429).json({ 
      error: "Too many requests. Please wait a moment and try again.",
      details: "Rate limit exceeded"
    });
  }
  
  res.status(status).json(message);
}

// Basic endpoints

// Health check
app.get("/health", function(req, res) {
  res.json({ status: "ok" });
});

// Test endpoint
app.get("/test", function(req, res) {
  res.json({ message: "Backend working!" });
});

// Check token status (dev helper)
app.get("/token/status", function(req, res) {
  if (!currentAccessToken) {
    return res.json({ hasToken: false });
  }
  var masked = currentAccessToken.slice(0,4) + "..." + currentAccessToken.slice(-4);
  return res.json({ hasToken: true, masked: masked });
});

// Finch Connect flow

// Create Finch Connect session
app.post("/create_link_token", function(req, res) {
  console.log("[Finch] Creating connect session");
  
  finch.connect.sessions.new({
    customer_id: "Test_12345678934445444454444",
    customer_name: "Test",
    products: ["company", "directory", "individual", "employment"],
    sandbox: "finch",
    redirect_uri: process.env.REDIRECT_URI,
  })
  .then(function(session) {
    console.log("[Finch] Session created:", session ? session.session_id : "undefined");

    res.json({
      session_id: session.session_id,
      connect_url: session.connect_url,
    });
  })
  .catch(function(err) {
    console.error("Failed to create session:", err);
    console.error("Error details:", {
      status: err.status,
      code: err.error?.code,
      name: err.error?.name,
      message: err.error?.message,
      finch_code: err.error?.finch_code,
      context: err.error?.context
    });
    res.status(500).json({ error: "Failed to create session" });
  });
});

// Handle OAuth callback
app.get("/finch/callback", function(req, res) {
  var code = req.query.code;
  var error = req.query.error;
  
  // Log the incoming request details
  console.log("[Finch] Callback URL:", req.url);
  console.log("[Finch] Callback method:", req.method);
  console.log("[Finch] Callback query params:", req.query);
  console.log("[Finch] Authorization code:", code);
  console.log("[Finch] Error (if any):", error);
  
  if (error || !code) {
    return res.status(400).send("Connection failed.");
  }

  console.log("[Finch] Exchanging code for access token");

  // Exchange code for token using JSON payload (Finch docs approach)
  var jsonPayload = {
    client_id: process.env.FINCH_CLIENT_ID,
    client_secret: process.env.FINCH_CLIENT_SECRET,
    code: code,
    redirect_uri: process.env.REDIRECT_URI || ""
  };

  console.log("[Finch] JSON payload:", jsonPayload);
  axios.post(
    "https://api.tryfinch.com/auth/token",
    jsonPayload,
    {
      headers: {
        "Content-Type": "application/json",
        "Finch-API-Version": "2020-09-17",
      },
      timeout: 15000,
    }
  )
  .then(function(tokenResp) {
    var accessToken = tokenResp.data ? tokenResp.data.access_token : null;
    if (!accessToken) {
      return res.status(500).send("Failed to obtain access token.");
    }

    // Store token
    currentAccessToken = accessToken;
    console.log("[Finch] Access token obtained: " + accessToken.slice(0,4) + "..." + accessToken.slice(-4));

    // Return success page
    res.send(
      "<!DOCTYPE html>" +
      "<html>" +
        "<body style=\"background:#0d1b2a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;\">" +
          "<div>Connected! You can close this window.</div>" +
          "<script>" +
            "if (window.opener) {" +
              "window.opener.postMessage({ type: 'finch:connected' }, '*');" +
            "}" +
            "window.close();" +
          "</script>" +
        "</body>" +
      "</html>"
    );
  })
  .catch(function(err) {
    console.error("Callback error:", err);
    res.status(500).send("Connection failed.");
  });
});

// Block payment endpoints

// Block payment endpoints (as required)
app.all(["/payment", "/pay-statement"], function(req, res) {
  res.status(403).json({ error: "Payment endpoints not allowed" });
});

// HR data endpoints

// Get company info
app.get("/company", function(req, res) {
  var token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching company info");
  
  var authed = createAuthenticatedClient(token);
  authed.hris.company.retrieve()
    .then(function(companyResp) {
      // Extract company data
      var company;
      if (companyResp.data) {
        company = companyResp.data;
      } else {
        company = companyResp;
      }
      
      var companyName = "";
      var companyWebsite = "";
      
      if (company) {
        companyName = company.legal_name || company.name || "";
        companyWebsite = company.primary_email || company.website || "";
      }
      
      res.json({
        name: companyName,
        website: companyWebsite,
      });
    })
    .catch(function(err) {
      handleApiError(err, res, "company");
    });
});

// Get employee directory
app.get("/directory", function(req, res) {
  var token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching employee directory");
  
  var authed = createAuthenticatedClient(token);
  authed.hris.directory.list()
    .then(function(directoryResp) {
      // Extract directory data
      var directory;
      if (directoryResp.data) {
        directory = directoryResp.data;
      } else {
        directory = directoryResp;
      }
      
      var employees = [];
      
      if (directory.individuals) {
        employees = directory.individuals;
      } else if (directory.employees) {
        employees = directory.employees;
      } else if (Array.isArray(directory)) {
        employees = directory;
      }
      
      res.json({ employees: employees });
    })
    .catch(function(err) {
      handleApiError(err, res, "directory");
    });
});

// Get employee details (individual + employment data)
app.get("/employee/:id", async function(req, res) {
  var token = getAccessToken(req);
  var id = req.params.id;
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching employee details for ID: " + id);
  
  try {
    // Make parallel API calls
    const [individualResp, employmentResp] = await Promise.all([
      finch.fetch('https://api.tryfinch.com/employer/individual', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Finch-API-Version': '2020-09-17',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: [{ individual_id: id }] })
      }),
      finch.fetch('https://api.tryfinch.com/employer/employment', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Finch-API-Version': '2020-09-17',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: [{ individual_id: id }] })
      })
    ]);

    // Parse responses
    const [individualData, employmentData] = await Promise.all([
      individualResp.json(),
      employmentResp.json()
    ]);

    console.log("[Finch] Individual data:", JSON.stringify(individualData, null, 2));
    console.log("[Finch] Employment data:", JSON.stringify(employmentData, null, 2));

    // Extract data with fallbacks
    const individual = individualData?.responses?.[0]?.body || {};
    const employment = employmentData?.responses?.[0]?.body || {};

    // Helper function to get email
    const getEmail = (record) => {
      if (record?.emails?.[0]?.data) return record.emails[0].data;
      return record?.email || "";
    };

    // Helper function to get title/department
    const getField = (field) => {
      return individual?.[field] || employment?.[field] || "";
    };

    res.json({
      individual: {
        first_name: individual.first_name || "",
        last_name: individual.last_name || "",
        email: getEmail(individual)
      },
      employment: {
        job_title: getField("title"),
        department: getField("department")?.name || ""
      }
    });

  } catch (err) {
    handleApiError(err, res, "employee/" + id);
  }
});

// Start server

app.listen(PORT, function() {
  console.log("🚀 Backend running on http://localhost:" + PORT);
});