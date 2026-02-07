import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Finch from "@tryfinch/finch-api";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fakeData from "./fakeData.js";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Generate random customer ID
function generateRandomCustomerId() {
  const prefix = "customer_";
  const timestamp = Date.now().toString();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return prefix + timestamp + "_" + randomSuffix;
}

// Generate random employer/company name
function generateRandomEmployerName() {
  const companyPrefixes = [
    "Acme", "Global", "Premier", "Elite", "Advanced", "Innovative", "Strategic", 
    "Pacific", "Atlantic", "Continental", "National", "International", "United",
    "Summit", "Peak", "Crest", "Apex", "Vertex", "Prime", "Select", "Premium",
    "Dynamic", "Progressive", "Forward", "NextGen", "Tech", "Digital", "Cloud"
  ];
  
  const companyNames = [
    "Solutions", "Systems", "Services", "Group", "Corporation", "Enterprises",
    "Industries", "Holdings", "Partners", "Associates", "Consulting", "Advisors",
    "Management", "Resources", "Capital", "Ventures", "Investments", "Equity",
    "Technologies", "Software", "Hardware", "Networks", "Communications", "Media",
    "Manufacturing", "Distribution", "Logistics", "Supply", "Retail", "Commerce",
    "Healthcare", "Medical", "Pharmaceuticals", "Biotech", "Wellness", "Fitness",
    "Finance", "Banking", "Insurance", "Real Estate", "Property", "Development",
    "Construction", "Engineering", "Architecture", "Design", "Creative", "Studio",
    "Education", "Academy", "Institute", "University", "Learning", "Training",
    "Energy", "Power", "Utilities", "Renewable", "Solar", "Wind",
    "Transportation", "Shipping", "Aviation", "Automotive", "Fleet", "Delivery",
    "Hospitality", "Restaurants", "Hotels", "Travel", "Tourism", "Entertainment",
    "Food", "Beverage", "Agriculture", "Farming", "Fishing", "Forestry"
  ];
  
  const suffixes = [
    "Inc", "LLC", "Ltd", "Corp", "Co", "LLP", "PC", "PLLC"
  ];
  
  // Randomly select a prefix (or none)
  const usePrefix = Math.random() > 0.3; // 70% chance of using a prefix
  const prefix = usePrefix ? companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)] : "";
  
  // Randomly select a company name
  const name = companyNames[Math.floor(Math.random() * companyNames.length)];
  
  // Randomly select a suffix (or none)
  const useSuffix = Math.random() > 0.4; // 60% chance of using a suffix
  const suffix = useSuffix ? " " + suffixes[Math.floor(Math.random() * suffixes.length)] : "";
  
  // Combine parts
  if (prefix) {
    return prefix + " " + name + suffix;
  } else {
    return name + suffix;
  }
}

// Save captured data to fakeData.js file
function saveCapturedData(employer, dataType, data) {
  if (employer !== 'justin-test') {
    return; // Only save data for justin-test
  }

  try {
    // Initialize justin-test object if it doesn't exist
    if (!fakeData['justin-test']) {
      fakeData['justin-test'] = {};
    }
    
    // Update in-memory cache
    fakeData['justin-test'][dataType] = data;
    
    var fakeDataPath = path.join(__dirname, 'fakeData.js');
    
    // Convert entire fakeData object to JSON string with proper indentation
    var jsonString = JSON.stringify(fakeData, null, 2);
    
    // Convert JSON format to JavaScript object format
    // Only replace object keys (lines that start with "key":), not string values
    var lines = jsonString.split('\n');
    var jsLines = lines.map(function(line) {
      // Match lines with object keys like:  "key": value
      // Replace "key": with 'key': but preserve the rest
      return line.replace(/^(\s+)"([^"]+)":(\s*)/, "$1'$2':$3");
    });
    var jsContent = jsLines.join('\n');
    
    // Build the file content
    var fileContent = "// Fake data for demo - different data for each employer\n";
    fileContent += "// Note: 'justin-test' is populated automatically from API responses\n\n";
    fileContent += "var fakeData = " + jsContent + ";\n\n";
    fileContent += "export default fakeData;\n";
    
    fs.writeFileSync(fakeDataPath, fileContent, 'utf8');
    console.log("[Capture] Saved " + dataType + " data for " + employer + " to file");
  } catch (err) {
    console.error("[Capture] Error saving data:", err);
    console.error("[Capture] Error details:", err.message);
  }
}

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
  
  // Extract provider and finch code from error if available
  var provider = null;
  var finchCode = null;
  if (err && err.response && err.response.data) {
    if (typeof err.response.data === 'object') {
      provider = err.response.data.provider || err.response.data.context?.provider;
      finchCode = err.response.data.finch_code || err.response.data.code;
    }
  }
  if (provider) {
    console.error("[Finch] Provider:", provider);
  }
  if (finchCode) {
    console.error("[Finch] Finch Code:", finchCode);
  }
  
  // Handle provider errors
  if (status === 404 || status === 501) {
    var errorMsg = "Provider does not implement " + endpoint + " endpoint";
    if (provider) {
      errorMsg = provider + " does not support the " + endpoint + " endpoint";
    }
    return res.status(status).json({ 
      error: errorMsg,
      provider: provider,
      endpoint: endpoint
    });
  }
  
  // Handle rate limiting
  if (status === 429) {
    return res.status(429).json({ 
      error: "Too many requests. Please wait a moment and try again.",
      details: "Rate limit exceeded",
      provider: provider
    });
  }
  
  // Handle authentication errors
  if (status === 401 || status === 403) {
    return res.status(status).json({
      error: "Authentication failed. Please reconnect your HR provider.",
      details: typeof message === 'string' ? message : message.error || "Authentication error",
      provider: provider
    });
  }
  
  // Generic error response with provider info if available
  var errorResponse = message;
  if (typeof message === 'object' && message !== null) {
    errorResponse = { ...message };
    if (provider && !errorResponse.provider) {
      errorResponse.provider = provider;
    }
    if (finchCode && !errorResponse.finch_code) {
      errorResponse.finch_code = finchCode;
    }
    if (!errorResponse.endpoint) {
      errorResponse.endpoint = endpoint;
    }
  } else {
    errorResponse = {
      error: typeof message === 'string' ? message : "An error occurred",
      endpoint: endpoint
    };
    if (provider) {
      errorResponse.provider = provider;
    }
    if (finchCode) {
      errorResponse.finch_code = finchCode;
    }
  }
  
  res.status(status).json(errorResponse);
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



// Finch Connect flow

// Create Finch Connect session (for embedded modal flow)
app.post("/create_link_token", function(req, res) {
  console.log("[Finch] Creating connect session for embedded flow");
  
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  finch.connect.sessions.new({
    customer_id: generateRandomCustomerId(),
    customer_name: generateRandomEmployerName(),
    products: ["company",
      "directory", 
      "individual",
      "employment",
      "payment",
      "pay_statement",
      "benefits",
      "documents",],
    "sandbox": "provider",
    redirect_uri: process.env.REDIRECT_URI, // Still needed for OAuth callback
  })
  .then(function(session) {
    console.log("[Finch] Session created:", session ? session.session_id : "undefined");
    console.log("[Finch] Session details - ID:", session.session_id, "URL:", session.connect_url);

    // Return session_id for embedded SDK
    res.json({
      session_id: session.session_id,
      connect_url: session.connect_url, // Keep for backwards compatibility if needed
    });
  })
  .catch(function(err) {
    console.error("[Finch] Failed to create session:", err);
    console.error("[Finch] Error details:", {
      status: err.status,
      code: err.error?.code,
      name: err.error?.name,
      message: err.error?.message,
      finch_code: err.error?.finch_code,
      context: err.error?.context
    });
    
    // Provide more specific error messages for common issues
    var errorMessage = "Failed to create session";
    if (err.error?.finch_code) {
      errorMessage = err.error.message || errorMessage;
    } else if (err.error?.message) {
      errorMessage = err.error.message;
    }
    
    // Check for provider-specific errors
    if (err.error?.context?.provider) {
      console.error("[Finch] Provider-specific error for:", err.error.context.provider);
      errorMessage = "Connection failed for " + err.error.context.provider + ": " + errorMessage;
    }
    
    res.status(err.status || 500).json({ 
      error: errorMessage,
      details: err.error?.finch_code || err.error?.code,
      provider: err.error?.context?.provider
    });
  });
});

// Handle OAuth callback
app.get("/finch/callback", function(req, res) {
  // LOG THE COMPLETE RAW REQUEST FROM FINCH BEFORE ANY PARSING
  console.log("\n\n");
  console.log("╔════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║     COMPLETE RAW REQUEST FROM FINCH → YOUR SERVER (BEFORE PARSING)            ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════╝");
  console.log("\n[Finch] Timestamp:", new Date().toISOString());
  
  // Reconstruct the raw HTTP request as it actually appears
  var rawRequestLine = req.method + " " + req.originalUrl + " HTTP/" + req.httpVersion;
  var host = req.get('host') || req.headers.host || 'localhost:4000';
  var rawHeaders = Object.keys(req.headers).map(function(key) {
    return key + ": " + req.headers[key];
  }).join("\n");
  
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] RAW HTTP REQUEST (as it appears in network capture):");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log(rawRequestLine);
  console.log("Host: " + host);
  console.log(rawHeaders);
  console.log(""); // Empty line before body (if any)
  
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] PARSED REQUEST DETAILS (Express parsed):");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] Method:", req.method);
  console.log("[Finch] Original URL (req.originalUrl):", req.originalUrl);
  console.log("[Finch] URL (req.url):", req.url);
  console.log("[Finch] Path (req.path):", req.path);
  console.log("[Finch] Base URL (req.baseUrl):", req.baseUrl);
  console.log("[Finch] Full URL:", req.protocol + "://" + host + req.originalUrl);
  console.log("[Finch] HTTP Version:", req.httpVersion);
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] RAW QUERY STRING (exactly as sent by Finch in URL):");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  var queryString = req.url.includes('?') ? req.url.split('?')[1] : (req.originalUrl.includes('?') ? req.originalUrl.split('?')[1] : "No query string");
  console.log(queryString);
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] COMPLETE REQUEST OBJECT (req.query - parsed by Express):");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log(req.query);
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] ALL REQUEST HEADERS (from Finch - original format):");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log(req.headers);
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] REQUEST IP & CONNECTION INFO:");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] IP:", req.ip || req.connection.remoteAddress);
  console.log("[Finch] Remote Address:", req.connection.remoteAddress);
  console.log("[Finch] Remote Port:", req.connection.remotePort);
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] REQUEST BODY (if any - original format):");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log(req.body || "No body (GET request)");
  console.log("\n[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] COMPLETE RAW REQUEST SUMMARY:");
  console.log("[Finch] ──────────────────────────────────────────────────────────────────────");
  console.log("[Finch] This is what Finch sent to your server:");
  console.log("[Finch]   URL:", req.originalUrl);
  console.log("[Finch]   Method:", req.method);
  console.log("[Finch]   Query String:", queryString);
  console.log("[Finch]   Parsed Query Params:", Object.keys(req.query).length, "parameters");
  
  // NOW extract the code and error AFTER logging the raw request
  var code = req.query.code;
  var error = req.query.error;
  
  // Prominently log the authorization code
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║              AUTHORIZATION CODE RECEIVED                       ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("[Finch] Code:", code);
  console.log("[Finch] Code length:", code ? code.length : 0);
  console.log("[Finch] Code type:", typeof code);
  console.log("\n");
  
  console.log("[Finch] Error (if any):", error);
  console.log("[Finch] Error (raw):", JSON.stringify(error));
  
  if (error || !code) {
    console.error("\n");
    console.error("╔════════════════════════════════════════════════════════════════╗");
    console.error("║                    CALLBACK ERROR DETECTED                     ║");
    console.error("╚════════════════════════════════════════════════════════════════╝");
    console.error("[Finch] ❌ Callback failed - missing code or error present");
    console.error("[Finch] Error value:", error);
    console.error("[Finch] Code value:", code);
    console.error("[Finch] Sending 400 response: 'Connection failed.'");
    console.error("\n");
    return res.status(400).send("Connection failed.");
  }

  console.log("[Finch] ✅ Authorization code validated, proceeding to exchange for access token");

  // Exchange code for token using Finch SDK
  console.log("\n[Finch] ════════════════════════════════════════");
  console.log("[Finch] EXCHANGING CODE FOR ACCESS TOKEN");
  console.log("[Finch] ════════════════════════════════════════");
  console.log("[Finch] Using Finch SDK: finch.accessTokens.create()");
  console.log("[Finch] Code:", code);
  console.log("[Finch] ════════════════════════════════════════\n");
  
  // Use Finch SDK to exchange code for access token
  finch.accessTokens.create({ code: code })
    .then(function(tokenResponse) {
      var accessToken = tokenResponse.access_token;
      var connectionId = tokenResponse.connection_id;
      var providerId = tokenResponse.provider_id;
      var products = tokenResponse.products;
      
      console.log("\n[Finch] ════════════════════════════════════════");
      console.log("[Finch] TOKEN EXCHANGE RESPONSE");
      console.log("[Finch] ════════════════════════════════════════");
      console.log("[Finch] Connection ID:", connectionId);
      console.log("[Finch] Provider ID:", providerId);
      console.log("[Finch] Products:", products);
      console.log("[Finch] Token Type:", tokenResponse.token_type);
      console.log("[Finch] Access Token (preview):", accessToken ? (accessToken.slice(0, 20) + "..." + accessToken.slice(-20)) : "null");
      console.log("[Finch] Access Token length:", accessToken ? accessToken.length : 0);
      console.log("[Finch] ════════════════════════════════════════\n");
      
      if (!accessToken) {
        console.error("[Finch] ❌ No access token in response");
        return res.status(500).send("Failed to obtain access token.");
      }

      // Store token
      currentAccessToken = accessToken;
      console.log("[Finch] ✅ Access token stored successfully");
      console.log("[Finch] Token stored in memory (currentAccessToken)");
      console.log("[Finch] Connection ID:", connectionId);

    // Log what we're sending back to the browser
    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║              SENDING RESPONSE TO BROWSER                       ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log("[Finch] Response Status: 200 OK");
    console.log("[Finch] Response Type: HTML page with postMessage script");
    console.log("[Finch] Response will trigger: window.opener.postMessage({ type: 'finch:connected' }, '*')");
    console.log("\n");

    // Return success page (for redirect flow)
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
    console.error("\n");
    console.error("╔════════════════════════════════════════════════════════════════╗");
    console.error("║                 TOKEN EXCHANGE ERROR                            ║");
    console.error("╚════════════════════════════════════════════════════════════════╝");
    console.error("[Finch] Error Message:", err.message || err.error?.message);
    console.error("[Finch] Error Code:", err.code || err.error?.code);
    
    // Handle SDK error format
    if (err.error) {
      console.error("[Finch] Error details:", {
        status: err.status,
        code: err.error.code,
        message: err.error.message,
        finch_code: err.error.finch_code
      });
    } else if (err.response) {
      console.error("[Finch] Response Status:", err.response.status);
      console.error("[Finch] Response Status Text:", err.response.statusText);
      console.error("[Finch] Response Headers (original format):");
      console.error(err.response.headers);
      console.error("[Finch] Response Data (original format):");
      console.error(err.response.data);
    }
    if (err.request) {
      console.error("[Finch] Request made but no response received");
      console.error("[Finch] Request:", err.request);
    }
    console.error("[Finch] Full Error Object (original format):");
    console.error(err);
    console.error("\n[Finch] Sending 500 response: 'Connection failed.'");
    console.error("\n");
    res.status(500).send("Connection failed.");
  });
});

// Exchange authorization code for access token (for embedded flow)
app.post("/finch/exchange-code", function(req, res) {
  console.log("[Finch] Exchanging authorization code for embedded flow");
  
  var code = req.body.code;
  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  console.log("[Finch] Exchanging code for access token using Finch SDK...");
  
  // Use Finch SDK to exchange code for access token
  finch.accessTokens.create({ code: code })
    .then(function(tokenResponse) {
      console.log("[Finch] Token exchange response received");
      console.log("[Finch] Connection ID:", tokenResponse.connection_id);
      console.log("[Finch] Provider ID:", tokenResponse.provider_id);
      console.log("[Finch] Products:", tokenResponse.products);
      
      var accessToken = tokenResponse.access_token;
      
      if (!accessToken) {
        console.error("[Finch] No access token in response");
        return res.status(500).json({ error: "Failed to obtain access token" });
      }

      // Store token
      currentAccessToken = accessToken;
      console.log("[Finch] ✅ Access token stored successfully for embedded flow");
      console.log("[Finch] Connection ID:", tokenResponse.connection_id);

      res.json({ 
        success: true,
        message: "Successfully connected to Finch",
        connection_id: tokenResponse.connection_id,
        provider_id: tokenResponse.provider_id
      });
    })
    .catch(function(err) {
      console.error("[Finch] Token exchange error:", err);
      var errorMessage = "Failed to exchange authorization code";
      
      // Handle SDK error format
      if (err.error) {
        errorMessage = err.error.message || err.error.error || errorMessage;
        console.error("[Finch] Error details:", {
          status: err.status,
          code: err.error.code,
          message: err.error.message,
          finch_code: err.error.finch_code
        });
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      var statusCode = err.status || 500;
      res.status(statusCode).json({ error: errorMessage });
    });
});

// HR data endpoints

// Get company info
app.get("/company", function(req, res) {
  var token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  // Check for employer parameter
  var employer = req.query.employer || req.headers['x-employer'] || 'justin-test';
  console.log("[Finch] Fetching company info for employer:", employer);

  // Return fake data if available
  if (fakeData[employer] && fakeData[employer].company) {
    console.log("[Finch] Returning cached company data for:", employer);
    return res.json(fakeData[employer].company);
  }

  console.log("[Finch] Fetching company info from API");
  
  var authed = createAuthenticatedClient(token);
  authed.hris.company.retrieve()
    .then(function(companyResp) {
      // Extract company data - return ALL fields from the response
      var company;
      if (companyResp.data) {
        company = companyResp.data;
      } else if (companyResp.company) {
        company = companyResp.company;
      } else {
        company = companyResp;
      }
      
      console.log("[Finch] Full company data:", JSON.stringify(company, null, 2));
      
      // Capture and save data for justin-test
      if (employer === 'justin-test' && company) {
        saveCapturedData(employer, 'company', company);
      }
      
      // Return the full company object so all fields are available
      res.json(company || {});
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

  // Check for employer parameter
  var employer = req.query.employer || req.headers['x-employer'] || 'justin-test';
  console.log("[Finch] Fetching employee directory for employer:", employer);

  // Return fake data if available
  if (fakeData[employer] && fakeData[employer].employees) {
    console.log("[Finch] Returning cached employee directory for:", employer);
    // Normalize employee data to match API format (convert department object to string)
    var normalizedEmployees = fakeData[employer].employees.map(function(emp) {
      var normalized = { ...emp };
      // Convert department object to string if it's an object
      if (normalized.department && typeof normalized.department === 'object') {
        normalized.department = normalized.department.name || 'N/A';
      }
      return normalized;
    });
    return res.json({ employees: normalizedEmployees });
  }

  console.log("[Finch] Fetching employee directory from API");
  
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
      
      // Capture and save data for justin-test
      if (employer === 'justin-test' && employees.length > 0) {
        saveCapturedData(employer, 'employees', employees);
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

  // Check for employer parameter
  var employer = req.query.employer || req.headers['x-employer'] || 'justin-test';
  console.log("[Finch] Fetching employee details for ID: " + id + ", employer: " + employer);

  // Helper function to format location
  function formatLocation(location) {
    if (!location) return "";
    var parts = [];
    if (location.line1) parts.push(location.line1);
    if (location.line2) parts.push(location.line2);
    var cityState = [];
    if (location.city) cityState.push(location.city);
    if (location.state) cityState.push(location.state);
    if (location.postal_code) cityState.push(location.postal_code);
    if (cityState.length > 0) parts.push(cityState.join(", "));
    if (location.country) parts.push(location.country);
    return parts.join(", ") || "";
  }

  // Helper function to format income
  function formatIncome(income) {
    if (!income || !income.amount) return "";
    var formattedAmount = income.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var unit = income.unit || "";
    var currency = income.currency || "";
    var parts = [];
    if (formattedAmount) parts.push(formattedAmount);
    if (currency) parts.push(currency);
    if (unit) parts.push("(" + unit + ")");
    return parts.join(" ") || "";
  }

  // Return fake data if available
  if (fakeData[employer] && fakeData[employer].employeeDetails && fakeData[employer].employeeDetails[id]) {
    console.log("[Finch] Returning cached employee details for:", id, "employer:", employer);
    var employeeData = fakeData[employer].employeeDetails[id];
    // Format the data to match the expected structure
    var employment = employeeData.employment;
    
    // Normalize department - convert object to string if needed
    var departmentValue = employment.department;
    if (departmentValue && typeof departmentValue === 'object') {
      departmentValue = departmentValue.name || 'N/A';
    }
    
    return res.json({
      individual: employeeData.individual,
      employment: {
        id: employment.id,
        first_name: employment.first_name,
        last_name: employment.last_name,
        middle_name: employment.middle_name,
        job_title: employment.title,
        department: departmentValue,
        employment_type: employment.employment_type,
        employment_status: employment.employment_status,
        manager_id: employment.manager ? employment.manager.id : "",
        start_date: employment.start_date,
        end_date: employment.end_date || null,
        is_active: employment.is_active,
        location: formatLocation(employment.location),
        location_line1: employment.location.line1 || "",
        location_line2: employment.location.line2 || "",
        location_city: employment.location.city || "",
        location_state: employment.location.state || "",
        location_postal_code: employment.location.postal_code || "",
        location_country: employment.location.country || "",
        income: formatIncome(employment.income),
        income_unit: employment.income.unit || "",
        income_amount: employment.income.amount || null,
        income_currency: employment.income.currency || "",
        income_effective_date: "",
        income_history: []
      }
    });
  }

  console.log("[Finch] Fetching employee details from API");
  
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

    // Helper function to format location (for API responses)
    const formatLocationAPI = (location) => {
      if (!location) return "";
      var parts = [];
      if (location.line1) parts.push(location.line1);
      if (location.line2) parts.push(location.line2);
      var cityState = [];
      if (location.city) cityState.push(location.city);
      if (location.state) cityState.push(location.state);
      if (location.postal_code) cityState.push(location.postal_code);
      if (cityState.length > 0) parts.push(cityState.join(", "));
      if (location.country) parts.push(location.country);
      return parts.join(", ") || "";
    };

    // Helper function to format income (for API responses)
    const formatIncomeAPI = (income) => {
      if (!income || !income.amount) return "";
      var formattedAmount = income.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      var unit = income.unit || "";
      var currency = income.currency || "";
      var parts = [];
      if (formattedAmount) parts.push(formattedAmount);
      if (currency) parts.push(currency);
      if (unit) parts.push("(" + unit + ")");
      return parts.join(" ") || "";
    };

    // Helper function to format employment type
    const formatEmploymentType = (employmentObj) => {
      if (!employmentObj) return "";
      var type = employmentObj.type || "";
      var subtype = employmentObj.subtype || "";
      if (type && subtype) return type + " - " + subtype;
      return type || "";
    };

    res.json({
      individual: {
        first_name: individual.first_name || "",
        last_name: individual.last_name || "",
        email: getEmail(individual)
      },
      employment: {
        // Basic info
        id: employment.id || "",
        first_name: employment.first_name || "",
        last_name: employment.last_name || "",
        middle_name: employment.middle_name || "",
        job_title: employment.title || "",
        department: employment.department?.name || "",
        department_parent: employment.department?.parent || null,
        department_source_id: employment.department?.source_id || null,
        
        // Employment details
        employment_type: formatEmploymentType(employment.employment),
        employment_status: employment.employment_status || "",
        manager_id: employment.manager?.id || "",
        
        // Dates
        start_date: employment.start_date || "",
        end_date: employment.end_date || null,
        latest_rehire_date: employment.latest_rehire_date || "",
        
        // Status and classification
        is_active: employment.is_active || false,
        class_code: employment.class_code || null,
        
        // Location
        location: formatLocationAPI(employment.location),
        location_line1: employment.location?.line1 || "",
        location_line2: employment.location?.line2 || "",
        location_city: employment.location?.city || "",
        location_state: employment.location?.state || "",
        location_postal_code: employment.location?.postal_code || "",
        location_country: employment.location?.country || "",
        
        // Income
        income: formatIncomeAPI(employment.income),
        income_unit: employment.income?.unit || "",
        income_amount: employment.income?.amount || null,
        income_currency: employment.income?.currency || "",
        income_effective_date: employment.income?.effective_date || "",
        income_history: employment.income_history || [],
        
        // Additional fields
        custom_fields: employment.custom_fields || [],
        source_id: employment.source_id || "",
        work_id: employment.work_id || null
      }
    });
    
    // Capture and save employee details for justin-test
    if (employer === 'justin-test') {
      // Initialize justin-test object if it doesn't exist
      if (!fakeData['justin-test']) {
        fakeData['justin-test'] = {};
      }
      if (!fakeData['justin-test'].employeeDetails) {
        fakeData['justin-test'].employeeDetails = {};
      }
      fakeData['justin-test'].employeeDetails[id] = {
        individual: {
          first_name: individual.first_name || "",
          last_name: individual.last_name || "",
          email: getEmail(individual)
        },
        employment: {
          id: employment.id || "",
          first_name: employment.first_name || "",
          last_name: employment.last_name || "",
          middle_name: employment.middle_name || "",
          title: employment.title || "",
          department: employment.department,
          employment_type: formatEmploymentType(employment.employment),
          employment_status: employment.employment_status || "",
          manager: employment.manager ? { id: employment.manager.id } : null,
          start_date: employment.start_date || "",
          end_date: employment.end_date || null,
          is_active: employment.is_active || false,
          location: employment.location || {},
          income: employment.income || {}
        }
      };
      saveCapturedData(employer, 'employeeDetails', fakeData['justin-test'].employeeDetails);
    }

  } catch (err) {
    handleApiError(err, res, "employee/" + id);
  }
});

// Test Payments endpoint - log response structure
app.get("/test/payments", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Testing payments endpoint");

  try {
    // Get date range - default to last year to today
    var endDate = new Date();
    var startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    var startDateStr = startDate.toISOString().split('T')[0];
    var endDateStr = endDate.toISOString().split('T')[0];

    console.log("[Finch] Fetching payments from", startDateStr, "to", endDateStr);

    // Fetch payments from Finch API
    var paymentResp = await finch.fetch('https://api.tryfinch.com/employer/payment?' + 
      'start_date=' + startDateStr + '&end_date=' + endDateStr, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var paymentData = await paymentResp.json();

    // Log the full response structure
    console.log("[Finch] Payments API Response Structure:");
    console.log(JSON.stringify(paymentData, null, 2));
    console.log("[Finch] Total payments:", Array.isArray(paymentData) ? paymentData.length : 'Not an array');

    // If it's an array, log first payment structure
    if (Array.isArray(paymentData) && paymentData.length > 0) {
      console.log("[Finch] First Payment Example:");
      console.log(JSON.stringify(paymentData[0], null, 2));
    }

    // Return the raw data for inspection
    res.json({
      message: "Payment data logged to server console. Check server logs for full structure.",
      date_range: {
        start_date: startDateStr,
        end_date: endDateStr
      },
      payment_count: Array.isArray(paymentData) ? paymentData.length : 'N/A',
      payments: paymentData
    });

  } catch (err) {
    console.error("[Finch] Payments test error:", err);
    handleApiError(err, res, "test/payments");
  }
});

// Get pay statements for a specific employee
app.get("/employee/:id/pay-statements", async function(req, res) {
  var token = getAccessToken(req);
  var id = req.params.id;
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  // Check for employer parameter
  var employer = req.query.employer || req.headers['x-employer'] || 'justin-test';
  console.log("[Finch] Fetching pay statements for employee:", id, "employer:", employer);

  // Return fake data if available
  if (fakeData[employer] && fakeData[employer].payStatements && fakeData[employer].payStatements[id]) {
    console.log("[Finch] Returning cached pay statements for:", id, "employer:", employer);
    var rawStatements = fakeData[employer].payStatements[id];
    
    // Log the raw cached data structure for debugging
    console.log("[Finch] Raw cached statements structure:", JSON.stringify(rawStatements, null, 2));
    
    // Extract statements from the cached structure
    // The structure can be:
    // 1. Direct array of statements: [{gross_pay: {...}, ...}, ...]
    // 2. Array with nested pay_statements: [{paging: {...}, pay_statements: [{...}, ...]}, ...]
    var statements = [];
    if (Array.isArray(rawStatements)) {
      rawStatements.forEach(function(item) {
        if (item && typeof item === 'object') {
          // Check if it has nested pay_statements array
          if (item.pay_statements && Array.isArray(item.pay_statements)) {
            statements = statements.concat(item.pay_statements);
          } else if (item.gross_pay || item.net_pay || item.type) {
            // It's a direct statement object
            statements.push(item);
          }
        }
      });
    } else if (rawStatements && typeof rawStatements === 'object') {
      // Single object - check for nested structure
      if (rawStatements.pay_statements && Array.isArray(rawStatements.pay_statements)) {
        statements = rawStatements.pay_statements;
      } else {
        statements = [rawStatements];
      }
    }
    
    // Filter out null/undefined entries
    statements = statements.filter(function(s) { return s !== null && s !== undefined; });
    
    console.log("[Finch] Extracted statements count:", statements.length);
    
    // Format statements to match expected structure
    var formattedStatements = statements.map(function(stmt) {
      // Ensure stmt is an object
      if (!stmt || typeof stmt !== 'object') {
        console.warn("[Finch] Invalid statement object:", stmt);
        return null;
      }
      
      // Log the statement structure for debugging
      console.log("[Finch] Processing statement:", JSON.stringify(stmt, null, 2));
      
      // Handle gross_pay - can be object {amount, currency} or number
      var grossPayAmount = null;
      var grossPayCurrency = 'USD';
      if (stmt.gross_pay !== null && stmt.gross_pay !== undefined) {
        if (typeof stmt.gross_pay === 'object' && stmt.gross_pay !== null && stmt.gross_pay.amount !== undefined) {
          grossPayAmount = stmt.gross_pay.amount;
          grossPayCurrency = stmt.gross_pay.currency || 'USD';
        } else if (typeof stmt.gross_pay === 'number') {
          grossPayAmount = stmt.gross_pay;
        }
      } else if (stmt.gross !== null && stmt.gross !== undefined) {
        // Also check for 'gross' field (alternative naming)
        if (typeof stmt.gross === 'object' && stmt.gross !== null && stmt.gross.amount !== undefined) {
          grossPayAmount = stmt.gross.amount;
          grossPayCurrency = stmt.gross.currency || 'USD';
        } else if (typeof stmt.gross === 'number') {
          grossPayAmount = stmt.gross;
        }
      }
      
      // Handle net_pay - can be object {amount, currency} or number
      var netPayAmount = null;
      var netPayCurrency = 'USD';
      if (stmt.net_pay !== null && stmt.net_pay !== undefined) {
        if (typeof stmt.net_pay === 'object' && stmt.net_pay !== null && stmt.net_pay.amount !== undefined) {
          netPayAmount = stmt.net_pay.amount;
          netPayCurrency = stmt.net_pay.currency || 'USD';
        } else if (typeof stmt.net_pay === 'number') {
          netPayAmount = stmt.net_pay;
        }
      } else if (stmt.net !== null && stmt.net !== undefined) {
        // Also check for 'net' field (alternative naming)
        if (typeof stmt.net === 'object' && stmt.net !== null && stmt.net.amount !== undefined) {
          netPayAmount = stmt.net.amount;
          netPayCurrency = stmt.net.currency || 'USD';
        } else if (typeof stmt.net === 'number') {
          netPayAmount = stmt.net;
        }
      }
      
      console.log("[Finch] Extracted amounts - gross:", grossPayAmount, "net:", netPayAmount);
      
      // Preserve all fields from the original statement, especially earnings, taxes, and employee_deductions
      var formattedStatement = {
        type: stmt.type || 'regular_payroll',
        payment_method: stmt.payment_method || 'direct_deposit',
        total_hours: stmt.total_hours || null,
        gross_pay: grossPayAmount,
        gross_pay_amount: grossPayAmount,
        gross_pay_currency: grossPayCurrency,
        net_pay: netPayAmount,
        net_pay_amount: netPayAmount,
        net_pay_currency: netPayCurrency,
        pay_date: stmt.pay_date || null,
        start_date: stmt.start_date || null,
        end_date: stmt.end_date || null,
        individual_id: id,
        currency: grossPayCurrency
      };
      
      // Preserve earnings array if it exists
      if (stmt.earnings && Array.isArray(stmt.earnings)) {
        formattedStatement.earnings = stmt.earnings;
      } else {
        formattedStatement.earnings = [];
      }
      
      // Preserve taxes array if it exists (frontend expects this)
      if (stmt.taxes && Array.isArray(stmt.taxes)) {
        formattedStatement.taxes = stmt.taxes;
      } else {
        formattedStatement.taxes = [];
      }
      
      // Preserve employee_deductions array if it exists (frontend expects this, not 'deductions')
      if (stmt.employee_deductions && Array.isArray(stmt.employee_deductions)) {
        formattedStatement.employee_deductions = stmt.employee_deductions;
      } else if (stmt.deductions && Array.isArray(stmt.deductions)) {
        // Fallback to 'deductions' if 'employee_deductions' doesn't exist
        formattedStatement.employee_deductions = stmt.deductions;
      } else {
        formattedStatement.employee_deductions = [];
      }
      
      // Also include deductions for backwards compatibility
      formattedStatement.deductions = formattedStatement.employee_deductions;
      
      return formattedStatement;
    }).filter(function(s) { return s !== null; }); // Remove any null entries from invalid statements
    
    console.log("[Finch] Formatted statements:", JSON.stringify(formattedStatements, null, 2));
    
    return res.json({ responses: formattedStatements.map(function(s) { return { code: 200, body: s }; }) });
  }

  console.log("[Finch] Fetching pay statements from API");

  try {
    // First get employment data to find start_date
    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: [{ individual_id: id }] })
    });

    var employmentData = await employmentResp.json();
    var employment = employmentData?.responses?.[0]?.body || {};

    // Get start date from employment or default to 1 year ago
    var startDate = new Date();
    if (employment.start_date) {
      startDate = new Date(employment.start_date);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Ensure end date is today, not in the future
    var endDate = new Date();
    endDate.setHours(0, 0, 0, 0); // Set to start of day to avoid timezone issues
    
    var startDateStr = startDate.toISOString().split('T')[0];
    var endDateStr = endDate.toISOString().split('T')[0];

    // Ensure start_date is not after end_date
    if (startDateStr > endDateStr) {
      startDateStr = endDateStr;
    }

    console.log("[Finch] Step 1: Fetching payments for individual:", id);
    console.log("[Finch] Date Range:", startDateStr, "to", endDateStr);

    // Step 1: First fetch payments for the date range
    var paymentUrl = 'https://api.tryfinch.com/employer/payment?start_date=' + startDateStr + '&end_date=' + endDateStr;
    console.log("[Finch] Payment URL:", paymentUrl);

    var paymentResp = await finch.fetch(paymentUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    console.log("[Finch] Payment Response Status:", paymentResp.status, paymentResp.statusText);

    var paymentData = await paymentResp.json();
    console.log("[Finch] Payment Response Data:", JSON.stringify(paymentData, null, 2));

    if (!paymentResp.ok) {
      console.error("[Finch] ========== PAYMENT API ERROR ==========");
      console.error("[Finch] Status Code:", paymentResp.status);
      console.error("[Finch] Status Text:", paymentResp.statusText);
      console.error("[Finch] Error Response:", JSON.stringify(paymentData, null, 2));
      console.error("[Finch] =================================================");
      return res.status(paymentResp.status || 500).json(paymentData);
    }

    // Step 2: Filter payments by individual_id and extract payment_ids
    var payments = paymentData.payments || paymentData || [];
    if (!Array.isArray(payments)) {
      payments = [];
    }

    console.log("[Finch] Total payments found:", payments.length);
    
    var paymentIds = payments
      .filter(function(payment) {
        var individualIds = payment.individual_ids || [];
        if (Array.isArray(individualIds)) {
          return individualIds.includes(id);
        }
        return false;
      })
      .map(function(payment) {
        return payment.id || payment.payment_id;
      })
      .filter(function(pid) {
        return pid !== null && pid !== undefined;
      });

    console.log("[Finch] Payment IDs for individual:", paymentIds);
    console.log("[Finch] Count:", paymentIds.length);

    if (paymentIds.length === 0) {
      console.log("[Finch] No payment IDs found for individual. Returning empty array.");
      return res.json({
        responses: []
      });
    }

    // Step 3: Fetch pay statements using payment_ids
    console.log("[Finch] Step 2: Fetching pay statements for payment IDs");
    
    var payStatementRequestBody = {
      requests: paymentIds.map(function(paymentId) {
        return { payment_id: paymentId };
      })
    };

    console.log("[Finch] Pay Statement Request URL: https://api.tryfinch.com/employer/pay-statement");
    console.log("[Finch] Pay Statement Request Body:", JSON.stringify(payStatementRequestBody, null, 2));

    var payStatementResp = await finch.fetch('https://api.tryfinch.com/employer/pay-statement', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payStatementRequestBody)
    });

    console.log("[Finch] Pay Statement Response Status:", payStatementResp.status, payStatementResp.statusText);

    var payStatementData = await payStatementResp.json();
    console.log("[Finch] Pay Statement Response Data:", JSON.stringify(payStatementData, null, 2));
    
    if (!payStatementResp.ok || payStatementData.code === 400) {
      console.error("[Finch] ========== PAY STATEMENT API ERROR ==========");
      console.error("[Finch] Status Code:", payStatementResp.status);
      console.error("[Finch] Status Text:", payStatementResp.statusText);
      console.error("[Finch] Error Code:", payStatementData.code);
      console.error("[Finch] Error Name:", payStatementData.name);
      console.error("[Finch] Finch Code:", payStatementData.finch_code);
      console.error("[Finch] Error Message:", payStatementData.message);
      console.error("[Finch] Full Error Response:", JSON.stringify(payStatementData, null, 2));
      console.error("[Finch] Request That Failed:");
      console.error("[Finch]   URL: https://api.tryfinch.com/employer/pay-statement");
      console.error("[Finch]   Method: POST");
      console.error("[Finch]   Body:", JSON.stringify(payStatementRequestBody, null, 2));
      console.error("[Finch]   Payment IDs:", paymentIds);
      console.error("[Finch] =================================================");
      return res.status(payStatementResp.status || 400).json(payStatementData);
    }

    // Capture and save pay statements for justin-test
    if (employer === 'justin-test' && payStatementData) {
      // Initialize justin-test object if it doesn't exist
      if (!fakeData['justin-test']) {
        fakeData['justin-test'] = {};
      }
      
      // Extract statements from response structure
      var statements = [];
      if (payStatementData.responses && Array.isArray(payStatementData.responses)) {
        statements = payStatementData.responses.map(function(r) {
          return r.body || r;
        }).filter(function(s) { return s !== null && s !== undefined; });
      } else if (Array.isArray(payStatementData)) {
        statements = payStatementData;
      }
      
      if (statements.length > 0) {
        if (!fakeData['justin-test'].payStatements) {
          fakeData['justin-test'].payStatements = {};
        }
        fakeData['justin-test'].payStatements[id] = statements;
        saveCapturedData(employer, 'payStatements', fakeData['justin-test'].payStatements);
      }
    }

    // Return the pay statement data
    res.json(payStatementData);

  } catch (err) {
    console.error("[Finch] Pay statement error:", err);
    handleApiError(err, res, "employee/" + id + "/pay-statements");
  }
});

// Get deductions for a specific employee
app.get("/employee/:id/deductions", async function(req, res) {
  var token = getAccessToken(req);
  var id = req.params.id;
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  // Check for employer parameter
  var employer = req.query.employer || req.headers['x-employer'] || 'justin-test';
  console.log("[Finch] Fetching deductions for employee:", id, "employer:", employer);

  // Return fake data if available
  if (fakeData[employer] && fakeData[employer].deductions && fakeData[employer].deductions[id]) {
    console.log("[Finch] Returning cached deductions for:", id, "employer:", employer);
    return res.json(fakeData[employer].deductions[id]);
  }

  console.log("[Finch] Fetching deductions from API");

  try {
    // Step 1: Get employment data for eligibility checking (90 day rule)
    console.log("[Finch] Step 1: Fetching employment data for eligibility");
    
    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: [{ individual_id: id }] })
    });

    var employmentData = await employmentResp.json();
    var employment = employmentData?.responses?.[0]?.body || {};
    
    // Calculate eligibility (90 day rule)
    var isEligible = false;
    var daysSinceStart = 0;
    var daysUntilEligible = 0;
    
    if (employment.start_date) {
      var startDate = new Date(employment.start_date);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      
      daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      isEligible = daysSinceStart >= 90;
      
      if (!isEligible) {
        daysUntilEligible = 90 - daysSinceStart;
      }
    }

    // Step 2: Get all available deductions/benefits
    console.log("[Finch] Step 2: Fetching all deductions/benefits");
    
    var benefitsResp = await finch.fetch('https://api.tryfinch.com/employer/benefits', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var benefitsData = await benefitsResp.json();
    console.log("[Finch] Benefits Response:", JSON.stringify(benefitsData, null, 2));

    if (!benefitsResp.ok) {
      console.error("[Finch] Benefits API Error:", benefitsResp.status, benefitsData);
      return res.status(benefitsResp.status || 500).json(benefitsData);
    }

    // Extract benefit IDs - benefits can be array or object with benefits array
    var companyBenefits = [];
    if (Array.isArray(benefitsData)) {
      companyBenefits = benefitsData;
    } else if (benefitsData.benefits && Array.isArray(benefitsData.benefits)) {
      companyBenefits = benefitsData.benefits;
    } else if (benefitsData.responses && Array.isArray(benefitsData.responses)) {
      // If it's a batch response format
      companyBenefits = benefitsData.responses.map(function(r) { return r.body; }).filter(function(b) { return b !== null && b !== undefined; });
    }

    console.log("[Finch] Total benefits found:", companyBenefits.length);

    // Find 401k benefit if it exists
    var retirement401kBenefit = companyBenefits.find(function(benefit) {
      var benefitType = benefit.type || benefit.benefit_type;
      return benefitType === '401k' || benefitType === '401k_roth';
    });

    var retirement401kEnrolled = false;
    if (companyBenefits.length === 0) {
      return res.json({
        individual_id: id,
        deductions: [],
        eligibility: {
          is_eligible: isEligible,
          days_since_start: daysSinceStart,
          days_until_eligible: daysUntilEligible,
          start_date: employment.start_date || null
        },
        company_benefits: [],
        retirement_401k: {
          benefit_available: false,
          enrolled: false
        }
      });
    }

    // Step 3: For each benefit, get deductions for this individual
    console.log("[Finch] Step 3: Fetching deductions for individual across all benefits");
    
    var individualDeductions = [];

    // Fetch deductions for each benefit in parallel
    var deductionPromises = companyBenefits.map(async function(benefit) {
      var benefitId = benefit.id || benefit.benefit_id;
      if (!benefitId) {
        return null;
      }

      try {
        var individualsUrl = 'https://api.tryfinch.com/employer/benefits/' + benefitId + '/individuals?individual_ids=' + id;
        console.log("[Finch] Fetching deductions for benefit:", benefitId);

        var individualsResp = await finch.fetch(individualsUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Finch-API-Version': '2020-09-17'
          }
        });

        var individualsData = await individualsResp.json();
        
        if (individualsResp.ok && individualsData) {
          // Find the data for this specific individual
          var individualData = null;
          if (Array.isArray(individualsData)) {
            individualData = individualsData.find(function(item) {
              return item.individual_id === id;
            });
          } else if (individualsData.individual_id === id) {
            individualData = individualsData;
          }

          if (individualData && individualData.body) {
            return {
              benefit_id: benefitId,
              benefit_name: benefit.name || benefit.description || 'N/A',
              benefit_type: benefit.type || 'N/A',
              individual_id: id,
              deduction: individualData.body
            };
          }
        }
      } catch (err) {
        console.error("[Finch] Error fetching deductions for benefit " + benefitId + ":", err);
        return null;
      }
      return null;
    });

    var deductionResults = await Promise.all(deductionPromises);
    individualDeductions = deductionResults.filter(function(d) {
      return d !== null && d !== undefined;
    });

    console.log("[Finch] Individual deductions found:", individualDeductions.length);
    console.log("[Finch] Deductions data:", JSON.stringify(individualDeductions, null, 2));

    // Check if employee is enrolled in 401k
    if (retirement401kBenefit) {
      var retirement401kDeduction = individualDeductions.find(function(deduction) {
        return (deduction.benefit_id === retirement401kBenefit.benefit_id || deduction.benefit_id === retirement401kBenefit.id) &&
               (deduction.benefit_type === '401k' || deduction.benefit_type === '401k_roth');
      });
      retirement401kEnrolled = !!retirement401kDeduction;
    }

    // Prepare deductions response
    var deductionsResponse = {
      individual_id: id,
      deductions: individualDeductions,
      eligibility: {
        is_eligible: isEligible,
        days_since_start: daysSinceStart,
        days_until_eligible: daysUntilEligible,
        start_date: employment.start_date || null
      },
      company_benefits: companyBenefits,
      retirement_401k: {
        benefit_available: !!retirement401kBenefit,
        enrolled: retirement401kEnrolled,
        benefit_id: retirement401kBenefit ? (retirement401kBenefit.benefit_id || retirement401kBenefit.id) : null,
        benefit_type: retirement401kBenefit ? (retirement401kBenefit.type || retirement401kBenefit.benefit_type) : null
      }
    };
    
    // Capture and save deductions for justin-test
    if (employer === 'justin-test') {
      // Initialize justin-test object if it doesn't exist
      if (!fakeData['justin-test']) {
        fakeData['justin-test'] = {};
      }
      if (!fakeData['justin-test'].deductions) {
        fakeData['justin-test'].deductions = {};
      }
      fakeData['justin-test'].deductions[id] = deductionsResponse;
      saveCapturedData(employer, 'deductions', fakeData['justin-test'].deductions);
    }
    
    // Return the deductions data with eligibility and 401k info
    res.json(deductionsResponse);

  } catch (err) {
    console.error("[Finch] Deductions error:", err);
    handleApiError(err, res, "employee/" + id + "/deductions");
  }
});

// Get documents for a specific employee
app.get("/employee/:id/documents", async function(req, res) {
  var token = getAccessToken(req);
  var id = req.params.id;
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  // Check for employer parameter
  var employer = req.query.employer || req.headers['x-employer'] || 'justin-test';
  console.log("[Finch] Fetching documents for employee:", id, "employer:", employer);
  console.log("[Finch] Checking fake data - employer exists:", !!fakeData[employer]);
  if (fakeData[employer]) {
    console.log("[Finch] Fake data has documents key:", !!fakeData[employer].documents);
    if (fakeData[employer].documents) {
      console.log("[Finch] Available employee IDs in documents:", Object.keys(fakeData[employer].documents));
      console.log("[Finch] Requested employee ID exists:", !!fakeData[employer].documents[id]);
    }
  }

  // Return fake data if available
  if (fakeData[employer] && fakeData[employer].documents && fakeData[employer].documents[id]) {
    console.log("[Finch] Returning cached documents for:", id, "employer:", employer);
    var documents = fakeData[employer].documents[id];
    console.log("[Finch] Number of documents to return:", documents.length);
    console.log("[Finch] Document types:", documents.map(function(d) { return d.type; }));
    return res.json({
      individual_id: id,
      documents: documents
    });
  }

  console.log("[Finch] No fake data found, fetching documents from API");

  try {
    // Step 1: List documents for this individual
    console.log("[Finch] Step 1: Fetching document list for individual");
    
    var documentsListUrl = 'https://api.tryfinch.com/employer/documents?individual_ids=' + id;
    console.log("[Finch] Documents List URL:", documentsListUrl);

    var documentsListResp = await finch.fetch(documentsListUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var documentsListData = await documentsListResp.json();
    console.log("[Finch] Documents List Response:", JSON.stringify(documentsListData, null, 2));

    if (!documentsListResp.ok) {
      console.error("[Finch] Documents List API Error:", documentsListResp.status, documentsListData);
      return res.status(documentsListResp.status || 500).json(documentsListData);
    }

    // Extract document IDs - documents can be array or object with documents array
    var documentIds = [];
    if (Array.isArray(documentsListData)) {
      documentIds = documentsListData.map(function(doc) { return doc.document_id || doc.id; }).filter(function(id) { return id !== null && id !== undefined; });
    } else if (documentsListData.documents && Array.isArray(documentsListData.documents)) {
      documentIds = documentsListData.documents.map(function(doc) { return doc.document_id || doc.id; }).filter(function(id) { return id !== null && id !== undefined; });
    } else if (documentsListData.data && Array.isArray(documentsListData.data)) {
      documentIds = documentsListData.data.map(function(doc) { return doc.document_id || doc.id; }).filter(function(id) { return id !== null && id !== undefined; });
    }

    console.log("[Finch] Document IDs found:", documentIds);
    console.log("[Finch] Count:", documentIds.length);

    if (documentIds.length === 0) {
      return res.json({
        individual_id: id,
        documents: []
      });
    }

    // Step 2: Fetch document details for each document
    console.log("[Finch] Step 2: Fetching document details");
    
    var documentDetails = [];

    // Fetch document details in parallel
    var documentPromises = documentIds.map(async function(docId) {
      try {
        var docUrl = 'https://api.tryfinch.com/employer/documents/' + docId;
        console.log("[Finch] Fetching document detail:", docId);

        var docResp = await finch.fetch(docUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Finch-API-Version': '2020-09-17'
          }
        });

        var docData = await docResp.json();
        
        if (docResp.ok && docData) {
          return {
            document_id: docId,
            type: docData.type || 'N/A',
            year: docData.year || null,
            data: docData.data || {}
          };
        }
      } catch (err) {
        console.error("[Finch] Error fetching document " + docId + ":", err);
        return null;
      }
      return null;
    });

    var documentResults = await Promise.all(documentPromises);
    documentDetails = documentResults.filter(function(d) {
      return d !== null && d !== undefined;
    });

    console.log("[Finch] Document details found:", documentDetails.length);
    console.log("[Finch] Documents data:", JSON.stringify(documentDetails, null, 2));

    // Return the documents data
    res.json({
      individual_id: id,
      documents: documentDetails
    });

  } catch (err) {
    console.error("[Finch] Documents error:", err);
    handleApiError(err, res, "employee/" + id + "/documents");
  }
});

// Test Pay Statement endpoint for individual - log response structure
app.get("/test/pay-statement/:id", async function(req, res) {
  var token = getAccessToken(req);
  var id = req.params.id;
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Testing pay-statement endpoint for individual:", id);

  try {
    // Get date range - default to last year to today
    var endDate = new Date();
    var startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    var startDateStr = startDate.toISOString().split('T')[0];
    var endDateStr = endDate.toISOString().split('T')[0];

    console.log("[Finch] Fetching pay statements from", startDateStr, "to", endDateStr);

    // Fetch pay statements from Finch API (POST request with body)
    var payStatementResp = await finch.fetch('https://api.tryfinch.com/employer/pay-statement', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          individual_id: id,
          start_date: startDateStr,
          end_date: endDateStr
        }]
      })
    });

    var payStatementData = await payStatementResp.json();

    // Log the full response structure
    console.log("[Finch] Pay Statement API Response Structure:");
    console.log(JSON.stringify(payStatementData, null, 2));

    // If it has responses array, log first response
    if (payStatementData && payStatementData.responses && payStatementData.responses.length > 0) {
      console.log("[Finch] First Pay Statement Example:");
      console.log(JSON.stringify(payStatementData.responses[0], null, 2));
    }

    // Return the raw data for inspection
    res.json({
      message: "Pay statement data logged to server console. Check server logs for full structure.",
      individual_id: id,
      date_range: {
        start_date: startDateStr,
        end_date: endDateStr
      },
      data: payStatementData
    });

  } catch (err) {
    console.error("[Finch] Pay statement test error:", err);
    console.error("[Finch] Error details:", {
      status: err.status,
      code: err.error?.code,
      message: err.error?.message,
      finch_code: err.error?.finch_code
    });
    handleApiError(err, res, "test/pay-statement/" + id);
  }
});

// Workforce Management Endpoints - Mock Data

// Get new hires (mock data based on start_date)
app.get("/workforce/new-hires", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching new hires");

  try {
    // Get all employees to identify new hires
    var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var directoryData = await directoryResp.json();
    var employees = [];
    
    if (directoryData.individuals) {
      employees = directoryData.individuals;
    } else if (directoryData.employees) {
      employees = directoryData.employees;
    } else if (Array.isArray(directoryData)) {
      employees = directoryData;
    }

    // Get employment data for all employees to check start dates
    var employmentRequests = employees.slice(0, 10).map(function(emp) {
      return { individual_id: emp.id };
    });
    
    if (employmentRequests.length === 0) {
      return res.json({ new_hires: [], count: 0 });
    }

    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: employmentRequests })
    });

    var employmentData = await employmentResp.json();
    var employmentMap = {};
    
    if (employmentData.responses) {
      employmentData.responses.forEach(function(response) {
        if (response.body) {
          employmentMap[response.body.id || response.body.individual_id] = response.body;
        }
      });
    }

    // Identify new hires (started within last 90 days)
    var today = new Date();
    var ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    var newHires = employees.filter(function(emp) {
      var employment = employmentMap[emp.id];
      if (!employment || !employment.start_date) {
        return false;
      }
      var startDate = new Date(employment.start_date);
      return startDate >= ninetyDaysAgo && startDate <= today;
    }).map(function(emp) {
      var employment = employmentMap[emp.id] || {};
      var startDate = employment.start_date ? new Date(employment.start_date) : today;
      
      // Fill in missing data with realistic defaults
      var firstName = emp.first_name || 'Employee';
      var lastName = emp.last_name || 'Unknown';
      var email = emp.emails?.[0]?.data || null;
      if (!email || email === 'N/A') {
        // Generate email from name
        email = (firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@company.com').replace(/[^a-z0-9.@-]/g, '');
      }
      
      var title = employment.title || 'Employee';
      // Default to Engineering or Marketing instead of General
      var defaultDepartment = 'Engineering';
      if (emp.id && emp.id.length % 2 === 0) {
        defaultDepartment = 'Marketing';
      }
      var department = employment.department?.name || defaultDepartment;
      
      return {
        id: emp.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        start_date: employment.start_date || null,
        title: title,
        department: department,
        employment_type: employment.employment?.type || 'full_time',
        days_since_start: employment.start_date ? Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) : 0,
        status: 'pending' // pending, invited, completed
      };
    });

    // If no new hires found, add mock data (2 fake new hires)
    if (newHires.length === 0) {
      var today = new Date();
      var mockStartDate1 = new Date();
      mockStartDate1.setDate(today.getDate() - 30); // 30 days ago
      var mockStartDate2 = new Date();
      mockStartDate2.setDate(today.getDate() - 75); // 75 days ago

      var mockNewHires = [
        {
          id: 'mock-newhire-1',
          first_name: 'Jessica',
          last_name: 'Chen',
          email: 'jessica.chen@company.com',
          start_date: mockStartDate1.toISOString().split('T')[0],
          title: 'Software Engineer',
          department: 'Engineering',
          employment_type: 'full_time',
          days_since_start: 30,
          status: 'pending'
        },
        {
          id: 'mock-newhire-2',
          first_name: 'David',
          last_name: 'Thompson',
          email: 'david.thompson@company.com',
          start_date: mockStartDate2.toISOString().split('T')[0],
          title: 'Marketing Specialist',
          department: 'Marketing',
          employment_type: 'full_time',
          days_since_start: 75,
          status: 'pending'
        }
      ];

      newHires = mockNewHires;
      console.log("[Finch] No real new hires found, using mock data:", newHires.length);
    }

    console.log("[Finch] New hires found:", newHires.length);

    res.json({
      new_hires: newHires,
      count: newHires.length
    });

  } catch (err) {
    console.error("[Finch] New hires error:", err);
    handleApiError(err, res, "workforce/new-hires");
  }
});

// Get terminated employees (mock data based on end_date)
app.get("/workforce/terminated", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching terminated employees");

  try {
    // Get all employees
    var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var directoryData = await directoryResp.json();
    var employees = [];
    
    if (directoryData.individuals) {
      employees = directoryData.individuals;
    } else if (directoryData.employees) {
      employees = directoryData.employees;
    } else if (Array.isArray(directoryData)) {
      employees = directoryData;
    }

    // Get employment data for all employees
    var employmentRequests = employees.slice(0, 10).map(function(emp) {
      return { individual_id: emp.id };
    });
    
    if (employmentRequests.length === 0) {
      return res.json({ terminated: [], count: 0 });
    }

    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: employmentRequests })
    });

    var employmentData = await employmentResp.json();
    var employmentMap = {};
    
    if (employmentData.responses) {
      employmentData.responses.forEach(function(response) {
        if (response.body) {
          employmentMap[response.body.id || response.body.individual_id] = response.body;
        }
      });
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Identify terminated employees (end_date is set and in the past, or is_active is false)
    var terminated = employees.filter(function(emp) {
      var employment = employmentMap[emp.id];
      if (!employment) {
        return false;
      }
      // Check if employee is terminated
      if (employment.end_date) {
        var endDate = new Date(employment.end_date);
        endDate.setHours(0, 0, 0, 0);
        return endDate <= today;
      }
      if (employment.is_active === false) {
        return true;
      }
      return false;
    }).map(function(emp) {
      var employment = employmentMap[emp.id] || {};
      var endDate = employment.end_date ? new Date(employment.end_date) : today;
      var daysSinceTermination = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
      
      return {
        id: emp.id,
        first_name: emp.first_name || 'N/A',
        last_name: emp.last_name || 'N/A',
        email: emp.emails?.[0]?.data || 'N/A',
        end_date: employment.end_date || null,
        termination_date: employment.end_date || null,
        title: employment.title || 'N/A',
        department: employment.department?.name || 'N/A',
        days_since_termination: daysSinceTermination,
        is_active: employment.is_active || false,
        offboarding_status: 'pending' // pending, in_progress, completed
      };
    });

    console.log("[Finch] Terminated employees found:", terminated.length);

    // If no terminated employees found, add mock data (2 fake terminated employees)
    if (terminated.length === 0) {
      var today = new Date();
      var mockTerminationDate1 = new Date();
      mockTerminationDate1.setDate(today.getDate() - 45); // 45 days ago
      var mockTerminationDate2 = new Date();
      mockTerminationDate2.setDate(today.getDate() - 120); // 120 days ago (overdue)

      var mockTerminated = [
        {
          id: 'mock-terminated-1',
          first_name: 'Sarah',
          last_name: 'Mitchell',
          email: 'sarah.mitchell@company.com',
          end_date: mockTerminationDate1.toISOString().split('T')[0],
          termination_date: mockTerminationDate1.toISOString().split('T')[0],
          title: 'Senior Software Engineer',
          department: 'Engineering',
          days_since_termination: 45,
          is_active: false,
          offboarding_status: 'pending'
        },
        {
          id: 'mock-terminated-2',
          first_name: 'Michael',
          last_name: 'Rodriguez',
          email: 'michael.rodriguez@company.com',
          end_date: mockTerminationDate2.toISOString().split('T')[0],
          termination_date: mockTerminationDate2.toISOString().split('T')[0],
          title: 'Marketing Director',
          department: 'Marketing',
          days_since_termination: 120,
          is_active: false,
          offboarding_status: 'pending'
        }
      ];

      terminated = mockTerminated;
      console.log("[Finch] No real terminated employees found, using mock data:", terminated.length);
    } else {
      // Fill in missing data for real terminated employees
      terminated = terminated.map(function(emp) {
        // If any critical fields are missing, fill with default values
        if (emp.title === 'N/A' || !emp.title) {
          emp.title = 'Employee';
        }
        if (emp.department === 'N/A' || !emp.department) {
          // Default to Engineering or Marketing instead of General
          var defaultDept = 'Engineering';
          if (emp.id && emp.id.length % 2 === 0) {
            defaultDept = 'Marketing';
          }
          emp.department = defaultDept;
        }
        if (emp.email === 'N/A' || !emp.email) {
          emp.email = (emp.first_name.toLowerCase() + '.' + emp.last_name.toLowerCase() + '@company.com').replace(/[^a-z0-9.@]/g, '');
        }
        return emp;
      });
    }

    res.json({
      terminated: terminated,
      count: terminated.length
    });

  } catch (err) {
    console.error("[Finch] Terminated employees error:", err);
    handleApiError(err, res, "workforce/terminated");
  }
});

// Get eligibility data for all employees
app.get("/eligibility", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching eligibility data for all employees");

  try {
    // Get all employees
    var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var directoryData = await directoryResp.json();
    var employees = [];
    
    if (directoryData.individuals) {
      employees = directoryData.individuals;
    } else if (directoryData.employees) {
      employees = directoryData.employees;
    } else if (Array.isArray(directoryData)) {
      employees = directoryData;
    }

    // Get employment data for all employees
    var employmentRequests = employees.map(function(emp) {
      return { individual_id: emp.id };
    });
    
    if (employmentRequests.length === 0) {
      return res.json({ employees: [], count: 0 });
    }

    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: employmentRequests })
    });

    var employmentData = await employmentResp.json();
    var employmentMap = {};
    
    if (employmentData.responses) {
      employmentData.responses.forEach(function(response) {
        if (response.body) {
          employmentMap[response.body.id || response.body.individual_id] = response.body;
        }
      });
    }

    // Calculate eligibility for each employee (90 day rule)
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    var eligibilityData = employees.map(function(emp) {
      var employment = employmentMap[emp.id] || {};
      
      var isEligible = false;
      var daysSinceStart = 0;
      var daysUntilEligible = 0;
      var startDate = null;
      
      if (employment.start_date) {
        startDate = new Date(employment.start_date);
        startDate.setHours(0, 0, 0, 0);
        
        daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        isEligible = daysSinceStart >= 90;
        
        if (!isEligible) {
          daysUntilEligible = 90 - daysSinceStart;
        }
      }
      
      return {
        id: emp.id,
        first_name: emp.first_name || 'Employee',
        last_name: emp.last_name || 'Unknown',
        title: employment.title || 'Employee',
        department: employment.department?.name || 'N/A',
        start_date: employment.start_date || null,
        is_eligible: isEligible,
        days_since_start: daysSinceStart,
        days_until_eligible: daysUntilEligible,
        is_active: employment.is_active !== false
      };
    });

    console.log("[Finch] Eligibility data prepared:", eligibilityData.length, "employees");
    res.json({ employees: eligibilityData, count: eligibilityData.length });

  } catch (err) {
    console.error("[Finch] Eligibility error:", err);
    handleApiError(err, res, "eligibility");
  }
});

// Get headcount reporting and analytics data
app.get("/headcount/reports", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching headcount reporting and analytics data");

  try {
    // Get all employees
    var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var directoryData = await directoryResp.json();
    var employees = [];
    
    if (directoryData.individuals) {
      employees = directoryData.individuals;
    } else if (directoryData.employees) {
      employees = directoryData.employees;
    } else if (Array.isArray(directoryData)) {
      employees = directoryData;
    }

    // Get employment data for all employees
    var employmentRequests = employees.map(function(emp) {
      return { individual_id: emp.id };
    });
    
    if (employmentRequests.length === 0) {
      return res.json({ 
        headcount: {},
        compensation: {},
        benefits: {},
        strategic: {}
      });
    }

    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: employmentRequests })
    });

    var employmentData = await employmentResp.json();
    var employmentMap = {};
    
    if (employmentData.responses) {
      employmentData.responses.forEach(function(response) {
        if (response.body) {
          employmentMap[response.body.id || response.body.individual_id] = response.body;
        }
      });
    }

    // Get all company benefits
    var benefitsResp = await finch.fetch('https://api.tryfinch.com/employer/benefits', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var benefitsData = await benefitsResp.json();
    var companyBenefits = [];
    
    if (Array.isArray(benefitsData)) {
      companyBenefits = benefitsData;
    } else if (benefitsData.benefits && Array.isArray(benefitsData.benefits)) {
      companyBenefits = benefitsData.benefits;
    }

    // HEADCOUNT ANALYSIS
    var headcountByDepartment = {};
    var headcountByEmploymentType = {};
    var headcountByStatus = { active: 0, inactive: 0 };
    var totalHeadcount = employees.length;

    employees.forEach(function(emp) {
      var employment = employmentMap[emp.id] || {};
      var department = employment.department?.name || 'Unassigned';
      var employmentType = employment.employment?.type || 'unknown';
      var isActive = employment.is_active !== false;

      // By department
      if (!headcountByDepartment[department]) {
        headcountByDepartment[department] = 0;
      }
      headcountByDepartment[department]++;

      // By employment type
      if (!headcountByEmploymentType[employmentType]) {
        headcountByEmploymentType[employmentType] = 0;
      }
      headcountByEmploymentType[employmentType]++;

      // By status
      if (isActive) {
        headcountByStatus.active++;
      } else {
        headcountByStatus.inactive++;
      }
    });

    // COMPENSATION ANALYTICS
    var compensationData = [];
    var totalCompensation = 0;
    var compensationCount = 0;

    employees.forEach(function(emp) {
      var employment = employmentMap[emp.id] || {};
      var income = employment.income;
      
      if (income && income.amount) {
        var amount = income.amount;
        var unit = income.unit || 'yearly';
        
        // Normalize to yearly for comparison (simplified conversion)
        var yearlyAmount = amount;
        if (unit === 'monthly') {
          yearlyAmount = amount * 12;
        } else if (unit === 'bi_weekly') {
          yearlyAmount = amount * 26;
        } else if (unit === 'weekly') {
          yearlyAmount = amount * 52;
        } else if (unit === 'hourly') {
          yearlyAmount = amount * 2080; // Assuming 40 hours/week
        }

        compensationData.push({
          employee_id: emp.id,
          department: employment.department?.name || 'Unassigned',
          title: employment.title || 'Employee',
          amount: yearlyAmount,
          unit: 'yearly'
        });

        totalCompensation += yearlyAmount;
        compensationCount++;
      }
    });

    var avgCompensation = compensationCount > 0 ? totalCompensation / compensationCount : 0;
    var minCompensation = compensationData.length > 0 ? Math.min.apply(null, compensationData.map(function(c) { return c.amount; })) : 0;
    var maxCompensation = compensationData.length > 0 ? Math.max.apply(null, compensationData.map(function(c) { return c.amount; })) : 0;

    // Compensation by department
    var compensationByDepartment = {};
    compensationData.forEach(function(comp) {
      if (!compensationByDepartment[comp.department]) {
        compensationByDepartment[comp.department] = { total: 0, count: 0 };
      }
      compensationByDepartment[comp.department].total += comp.amount;
      compensationByDepartment[comp.department].count++;
    });

    Object.keys(compensationByDepartment).forEach(function(dept) {
      var deptData = compensationByDepartment[dept];
      compensationByDepartment[dept].average = deptData.count > 0 ? deptData.total / deptData.count : 0;
    });

    // PARTICIPATION FUNNEL - Calculate eligible, enrolled, and active contributors
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var eligibleCount = 0;
    var enrolledCount = 0;
    var activeContributorsCount = 0;
    
    // Find 401k benefit ID
    var retirement401kBenefit = companyBenefits.find(function(benefit) {
      var benefitType = benefit.type || benefit.benefit_type;
      return benefitType === '401k' || benefitType === '401k_roth';
    });
    
    var retirement401kBenefitId = retirement401kBenefit ? (retirement401kBenefit.benefit_id || retirement401kBenefit.id) : null;
    
    // Get deductions for all employees to check enrollment and contributions
    var deductionPromises = employees.slice(0, 20).map(function(emp) {
      return finch.fetch('https://api.tryfinch.com/employer/deductions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Finch-API-Version': '2020-09-17',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          requests: [{ individual_id: emp.id }] 
        })
      }).then(function(resp) {
        return resp.json().then(function(data) {
          return { employeeId: emp.id, deductionsData: data };
        });
      }).catch(function(err) {
        return { employeeId: emp.id, deductionsData: null };
      });
    });
    
    var deductionsResults = await Promise.all(deductionPromises);
    var enrollmentMap = {};
    var contributorMap = {};
    
    deductionsResults.forEach(function(result) {
      if (result.deductionsData) {
        var deductions = [];
        if (Array.isArray(result.deductionsData)) {
          deductions = result.deductionsData;
        } else if (result.deductionsData.responses) {
          deductions = result.deductionsData.responses.map(function(r) {
            return r.body;
          }).filter(function(d) { return d !== null && d !== undefined; });
        } else if (result.deductionsData.deductions) {
          deductions = result.deductionsData.deductions;
        }
        
        var has401kDeduction = deductions.some(function(ded) {
          var dedBenefitId = ded.benefit_id || ded.benefit?.id;
          var dedType = ded.benefit_type || ded.benefit?.type;
          return (dedBenefitId === retirement401kBenefitId || dedType === '401k' || dedType === '401k_roth') &&
                 (ded.deduction?.employee_deduction?.amount > 0 || ded.employee_deduction?.amount > 0);
        });
        
        if (has401kDeduction) {
          enrollmentMap[result.employeeId] = true;
          
          // Check if they have actual deductions > 0
          var hasActiveContribution = deductions.some(function(ded) {
            var employeeDed = ded.deduction?.employee_deduction || ded.employee_deduction || {};
            var amount = employeeDed.amount || 0;
            return amount > 0;
          });
          
          if (hasActiveContribution) {
            contributorMap[result.employeeId] = true;
          }
        }
      }
    });
    
    // Calculate eligible employees (90+ days since start)
    employees.forEach(function(emp) {
      var employment = employmentMap[emp.id] || {};
      if (employment.start_date) {
        var startDate = new Date(employment.start_date);
        startDate.setHours(0, 0, 0, 0);
        var daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStart >= 90) {
          eligibleCount++;
          
          // Check if enrolled
          if (enrollmentMap[emp.id]) {
            enrolledCount++;
            
            // Check if active contributor
            if (contributorMap[emp.id]) {
              activeContributorsCount++;
            }
          }
        }
      }
    });
    
    var participationFunnel = {
      eligible_employees: eligibleCount,
      enrolled_employees: enrolledCount,
      active_contributors: activeContributorsCount,
      enrollment_rate: eligibleCount > 0 ? ((enrolledCount / eligibleCount) * 100).toFixed(1) : 0,
      contribution_rate: enrolledCount > 0 ? ((activeContributorsCount / enrolledCount) * 100).toFixed(1) : 0
    };

    // BENEFITS UTILIZATION
    var benefitsUtilization = {};
    var totalEmployees = employees.length;

    companyBenefits.forEach(function(benefit) {
      var benefitType = benefit.type || benefit.benefit_type || 'Unknown';
      benefitsUtilization[benefitType] = {
        benefit_name: benefit.description || benefit.name || benefitType,
        available: true,
        enrolled_count: 0, // Would need to fetch enrollment data for each benefit
        enrollment_rate: 0,
        frequency: benefit.frequency || 'N/A'
      };
    });

    // STRATEGIC INSIGHTS
    var today = new Date();
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    var ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    var recentHires = 0;
    var recentTerminations = 0;
    var eligibleForBenefits = 0;

    employees.forEach(function(emp) {
      var employment = employmentMap[emp.id] || {};
      if (employment.start_date) {
        var startDate = new Date(employment.start_date);
        if (startDate >= ninetyDaysAgo) {
          recentHires++;
        }
        if (startDate <= ninetyDaysAgo) {
          eligibleForBenefits++;
        }
      }
      if (employment.end_date) {
        var endDate = new Date(employment.end_date);
        if (endDate >= thirtyDaysAgo) {
          recentTerminations++;
        }
      }
    });

    var strategicInsights = {
      total_headcount: totalHeadcount,
      active_headcount: headcountByStatus.active,
      turnover_rate: totalHeadcount > 0 ? (recentTerminations / totalHeadcount * 100).toFixed(1) : 0,
      hiring_rate: totalHeadcount > 0 ? (recentHires / totalHeadcount * 100).toFixed(1) : 0,
      benefits_eligibility_rate: totalHeadcount > 0 ? (eligibleForBenefits / totalHeadcount * 100).toFixed(1) : 0,
      average_tenure_days: 0, // Would calculate from start dates
      department_count: Object.keys(headcountByDepartment).length,
      most_populated_department: Object.keys(headcountByDepartment).sort(function(a, b) {
        return headcountByDepartment[b] - headcountByDepartment[a];
      })[0] || 'N/A'
    };

    console.log("[Finch] Headcount reports prepared");
    res.json({
      headcount: {
        total: totalHeadcount,
        by_department: headcountByDepartment,
        by_employment_type: headcountByEmploymentType,
        by_status: headcountByStatus
      },
      compensation: {
        total: totalCompensation,
        average: avgCompensation,
        minimum: minCompensation,
        maximum: maxCompensation,
        count: compensationCount,
        by_department: compensationByDepartment,
        distribution: {
          under_50k: compensationData.filter(function(c) { return c.amount < 50000; }).length,
          between_50k_100k: compensationData.filter(function(c) { return c.amount >= 50000 && c.amount < 100000; }).length,
          between_100k_150k: compensationData.filter(function(c) { return c.amount >= 100000 && c.amount < 150000; }).length,
          over_150k: compensationData.filter(function(c) { return c.amount >= 150000; }).length
        }
      },
      benefits: {
        total_benefits: companyBenefits.length,
        utilization: benefitsUtilization,
        enrollment_rate: 0 // Would calculate from actual enrollment data
      },
      strategic: strategicInsights,
      participation_funnel: participationFunnel
    });

  } catch (err) {
    console.error("[Finch] Headcount reports error:", err);
    handleApiError(err, res, "headcount/reports");
  }
});

// Get organizational chart data (all employees with manager relationships)
app.get("/org-chart", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching organizational chart data");

  try {
    // Get all employees
    var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var directoryData = await directoryResp.json();
    var employees = [];
    
    if (directoryData.individuals) {
      employees = directoryData.individuals;
    } else if (directoryData.employees) {
      employees = directoryData.employees;
    } else if (Array.isArray(directoryData)) {
      employees = directoryData;
    }

    // Get employment data for all employees
    var employmentRequests = employees.map(function(emp) {
      return { individual_id: emp.id };
    });
    
    if (employmentRequests.length === 0) {
      return res.json({ employees: [], count: 0 });
    }

    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: employmentRequests })
    });

    var employmentData = await employmentResp.json();
    var employmentMap = {};
    
    if (employmentData.responses) {
      employmentData.responses.forEach(function(response) {
        if (response.body) {
          employmentMap[response.body.id || response.body.individual_id] = response.body;
        }
      });
    }

    // Build org chart data with manager relationships
    var orgChartData = employees.map(function(emp) {
      var employment = employmentMap[emp.id] || {};
      
      return {
        id: emp.id,
        first_name: emp.first_name || 'Employee',
        last_name: emp.last_name || 'Unknown',
        title: employment.title || 'Employee',
        department: employment.department?.name || 'N/A',
        manager_id: employment.manager?.id || null,
        is_active: employment.is_active !== false
      };
    });

    console.log("[Finch] Org chart data prepared:", orgChartData.length, "employees");
    res.json({ employees: orgChartData, count: orgChartData.length });

  } catch (err) {
    console.error("[Finch] Org chart error:", err);
    handleApiError(err, res, "org-chart");
  }
});

// Get audit and compliance reports (change log / audit trail)
app.get("/audit/compliance", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching audit and compliance reports");

  try {
    // Get all employees
    var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17'
      }
    });

    var directoryData = await directoryResp.json();
    var employees = [];
    
    if (directoryData.individuals) {
      employees = directoryData.individuals;
    } else if (directoryData.employees) {
      employees = directoryData.employees;
    } else if (Array.isArray(directoryData)) {
      employees = directoryData;
    }

    // Get employment data for all employees
    var employmentRequests = employees.slice(0, 10).map(function(emp) {
      return { individual_id: emp.id };
    });
    
    if (employmentRequests.length === 0) {
      return res.json({ audit_log: [], count: 0 });
    }

    var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: employmentRequests })
    });

    var employmentData = await employmentResp.json();
    var employmentMap = {};
    
    if (employmentData.responses) {
      employmentData.responses.forEach(function(response) {
        if (response.body) {
          employmentMap[response.body.id || response.body.individual_id] = response.body;
        }
      });
    }

    // Generate audit log entries based on available data
    var today = new Date();
    var auditLog = [];

    // Mock administrators/system users
    var admins = ['admin@company.com', 'hr@company.com', 'system@company.com', 'admin.user@company.com'];
    
    // 1. Eligibility rule changes
    var eligibilityChangeDate = new Date(today);
    eligibilityChangeDate.setDate(today.getDate() - 45);
    auditLog.push({
      id: 'audit-eligibility-1',
      action_date: eligibilityChangeDate.toISOString(),
      effective_date: eligibilityChangeDate.toISOString(),
      action_type: 'eligibility_rule_change',
      action_description: 'Eligibility waiting period updated from 60 to 90 days',
      performed_by: admins[0],
      performed_by_name: 'System Administrator',
      entity_type: 'eligibility_rule',
      entity_id: 'rule-90-day-waiting',
      previous_value: '60 days',
      new_value: '90 days',
      category: 'eligibility'
    });

    // 2. Enrollment actions (based on eligible employees)
    employees.slice(0, 5).forEach(function(emp, index) {
      var employment = employmentMap[emp.id] || {};
      if (employment.start_date) {
        var startDate = new Date(employment.start_date);
        var enrollmentDate = new Date(startDate);
        enrollmentDate.setDate(startDate.getDate() + 90); // 90 days after start
        
        // Only create enrollment entries for employees who would be eligible
        var daysSinceStart = Math.floor((today - enrollmentDate) / (1000 * 60 * 60 * 24));
        if (daysSinceStart >= 0) {
          var actionDate = new Date(enrollmentDate);
          actionDate.setHours(9, 0, 0, 0); // Business hours
          
          auditLog.push({
            id: 'audit-enrollment-' + emp.id,
            action_date: actionDate.toISOString(),
            effective_date: enrollmentDate.toISOString(),
            action_type: 'enrollment',
            action_description: 'Employee enrolled in 401k retirement plan',
            performed_by: admins[index % admins.length],
            performed_by_name: admins[index % admins.length].split('@')[0].replace('.', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }),
            entity_type: 'employee_enrollment',
            entity_id: emp.id,
            entity_name: (emp.first_name || 'Employee') + ' ' + (emp.last_name || 'Unknown'),
            previous_value: 'Not Enrolled',
            new_value: 'Enrolled - 401k',
            category: 'enrollment'
          });
        }
      }
    });

    // 3. Deferral changes (mock based on employees with deductions)
    employees.slice(0, 3).forEach(function(emp, index) {
      var deferralChangeDate = new Date(today);
      deferralChangeDate.setDate(today.getDate() - (index + 1) * 10);
      deferralChangeDate.setHours(14, 30, 0, 0);
      
      var oldRate = 3 + (index * 1);
      var newRate = oldRate + 1;
      
      auditLog.push({
        id: 'audit-deferral-' + emp.id + '-' + index,
        action_date: deferralChangeDate.toISOString(),
        effective_date: new Date(deferralChangeDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Effective 7 days after action
        action_type: 'deferral_change',
        action_description: '401k deferral rate changed',
        performed_by: admins[(index + 1) % admins.length],
        performed_by_name: admins[(index + 1) % admins.length].split('@')[0].replace('.', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }),
        entity_type: 'employee_deferral',
        entity_id: emp.id,
        entity_name: (emp.first_name || 'Employee') + ' ' + (emp.last_name || 'Unknown'),
        previous_value: oldRate + '%',
        new_value: newRate + '%',
        category: 'deferral'
      });
    });

    // 4. Another eligibility rule change
    var eligibilityChangeDate2 = new Date(today);
    eligibilityChangeDate2.setDate(today.getDate() - 120);
    auditLog.push({
      id: 'audit-eligibility-2',
      action_date: eligibilityChangeDate2.toISOString(),
      effective_date: eligibilityChangeDate2.toISOString(),
      action_type: 'eligibility_rule_change',
      action_description: 'Eligibility rule for part-time employees updated',
      performed_by: admins[1],
      performed_by_name: 'HR Administrator',
      entity_type: 'eligibility_rule',
      entity_id: 'rule-part-time-eligibility',
      previous_value: 'Not eligible',
      new_value: 'Eligible after 1 year',
      category: 'eligibility'
    });

    // 5. More enrollment actions
    employees.slice(3, 6).forEach(function(emp, index) {
      var enrollmentDate = new Date(today);
      enrollmentDate.setDate(today.getDate() - (index + 5) * 7);
      enrollmentDate.setHours(10, 15, 0, 0);
      
      auditLog.push({
        id: 'audit-enrollment-2-' + emp.id,
        action_date: enrollmentDate.toISOString(),
        effective_date: enrollmentDate.toISOString(),
        action_type: 'enrollment',
        action_description: 'Employee enrolled in 401k retirement plan',
        performed_by: admins[(index + 2) % admins.length],
        performed_by_name: admins[(index + 2) % admins.length].split('@')[0].replace('.', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }),
        entity_type: 'employee_enrollment',
        entity_id: emp.id,
        entity_name: (emp.first_name || 'Employee') + ' ' + (emp.last_name || 'Unknown'),
        previous_value: 'Not Enrolled',
        new_value: 'Enrolled - 401k',
        category: 'enrollment'
      });
    });

    // Sort by action date (most recent first)
    auditLog.sort(function(a, b) {
      return new Date(b.action_date) - new Date(a.action_date);
    });

    console.log("[Finch] Audit log prepared:", auditLog.length, "entries");
    res.json({ audit_log: auditLog, count: auditLog.length });

  } catch (err) {
    console.error("[Finch] Audit reports error:", err);
    handleApiError(err, res, "audit/compliance");
  }
});

// Enqueue a new automated sync job (data_sync_all)
app.post("/sync/enqueue", async function(req, res) {
  var token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Enqueueing automated sync job");

  try {
    var syncResp = await finch.fetch('https://api.tryfinch.com/jobs/automated', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Finch-API-Version': '2020-09-17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'data_sync_all'
      })
    });

    var syncData = await syncResp.json();

    if (!syncResp.ok) {
      console.error("[Finch] Sync job enqueue error:", syncResp.status, syncData);
      return res.status(syncResp.status || 500).json(syncData);
    }

    console.log("[Finch] Sync job enqueued successfully:", syncData.job_id);
    res.json(syncData);

  } catch (err) {
    console.error("[Finch] Sync job enqueue error:", err);
    handleApiError(err, res, "sync/enqueue");
  }
});

// Get webhook events (fake data based on real employee data)
app.get("/webhooks/changes", async function(req, res) {
  var token = getAccessToken(req);
  
  if (!token) {
    return res.status(401).json({ error: "No access token available" });
  }

  console.log("[Finch] Fetching webhook events");

  try {
    // Get all employees to generate realistic events
    var employees = [];
    var employmentMap = {};
    
    try {
      var directoryResp = await finch.fetch('https://api.tryfinch.com/employer/directory', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Finch-API-Version': '2020-09-17'
        }
      });

      var directoryData = await directoryResp.json();
      
      if (directoryData.individuals) {
        employees = directoryData.individuals;
      } else if (directoryData.employees) {
        employees = directoryData.employees;
      } else if (Array.isArray(directoryData)) {
        employees = directoryData;
      }

      // Get employment data for a few employees
      var sampleEmployees = employees.slice(0, 10);
      var employmentRequests = sampleEmployees.map(function(emp) {
        return { individual_id: emp.id };
      });
      
      if (employmentRequests.length > 0) {
        var employmentResp = await finch.fetch('https://api.tryfinch.com/employer/employment', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Finch-API-Version': '2020-09-17',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: employmentRequests })
        });

        var employmentData = await employmentResp.json();
        if (employmentData.responses) {
          employmentData.responses.forEach(function(response) {
            if (response.body) {
              employmentMap[response.body.id || response.body.individual_id] = response.body;
            }
          });
        }
      }
    } catch (err) {
      console.log("[Finch] Error fetching employees for webhooks, using mock data:", err.message);
      // Continue with empty arrays - we'll generate mock events
    }

    // Generate fake webhook events based on real data - matching exact Finch webhook structure
    // Reference: https://developer.tryfinch.com/developer-resources/Webhooks
    var events = [];
    var now = new Date();
    var connectionId = '0057d3d2-fb43-4815-9f71-01ba4862d09f';
    var companyId = '720be419-0293-4d32-a707-32179b0827ab';
    var accountId = 'fa872170-b49d-4fb5-aa39-fb1515db0925';

    // Helper function to generate UUID
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Helper function to format date as MM-DD-YYYY (as shown in docs)
    function formatPayDate(date) {
      var month = (date.getMonth() + 1).toString().padStart(2, '0');
      var day = date.getDate().toString().padStart(2, '0');
      var year = date.getFullYear();
      return month + '-' + day + '-' + year;
    }

    var eventIndex = 0;
    var sampleEmployees = employees.slice(0, 10);

    // If no employees, generate some mock employee IDs for events
    if (sampleEmployees.length === 0) {
      for (var i = 0; i < 5; i++) {
        sampleEmployees.push({ id: generateUUID() });
      }
    }

    // Generate directory.created events (exact format from docs)
    // Reference: https://developer.tryfinch.com/developer-resources/Webhooks
    sampleEmployees.slice(0, 2).forEach(function(emp) {
      events.push({
        company_id: companyId,
        account_id: accountId,
        connection_id: connectionId,
        event_type: 'directory.created',
        data: {
          individual_id: emp.id
        },
        entity_id: emp.id
      });
      eventIndex++;
    });

    // Generate directory.updated events
    sampleEmployees.slice(2, 4).forEach(function(emp) {
      events.push({
        company_id: companyId,
        account_id: accountId,
        connection_id: connectionId,
        event_type: 'directory.updated',
        data: {
          individual_id: emp.id
        },
        entity_id: emp.id
      });
      eventIndex++;
    });

    // Generate employment.created events (exact format from docs)
    sampleEmployees.slice(0, 2).forEach(function(emp) {
      var employment = employmentMap[emp.id];
      if (employment) {
        var employmentEntityId = employment.id || generateUUID();
        events.push({
          company_id: companyId,
          account_id: accountId,
          connection_id: connectionId,
          event_type: 'employment.created',
          data: {
            individual_id: emp.id
          },
          entity_id: employmentEntityId
        });
        eventIndex++;
      }
    });

    // Generate employment.updated events
    sampleEmployees.slice(2, 4).forEach(function(emp) {
      var employment = employmentMap[emp.id];
      if (employment) {
        var employmentEntityId = employment.id || generateUUID();
        events.push({
          company_id: companyId,
          account_id: accountId,
          connection_id: connectionId,
          event_type: 'employment.updated',
          data: {
            individual_id: emp.id
          },
          entity_id: employmentEntityId
        });
        eventIndex++;
      }
    });

    // Generate individual.updated events (exact format from docs)
    sampleEmployees.slice(0, 3).forEach(function(emp) {
      events.push({
        company_id: companyId,
        account_id: accountId,
        connection_id: connectionId,
        event_type: 'individual.updated',
        data: {
          individual_id: emp.id
        },
        entity_id: emp.id
      });
      eventIndex++;
    });

    // Generate payment.created events (exact format from docs - pay_date as MM-DD-YYYY)
    sampleEmployees.slice(0, 3).forEach(function(emp) {
      var payDate = new Date(now.getTime() - (eventIndex * 7 * 24 * 60 * 60 * 1000));
      var paymentId = generateUUID();
      events.push({
        company_id: companyId,
        account_id: accountId,
        connection_id: connectionId,
        event_type: 'payment.created',
        data: {
          payment_id: paymentId,
          pay_date: formatPayDate(payDate)
        },
        entity_id: paymentId
      });
      eventIndex++;
    });

    // Generate pay_statement.created events (exact format from docs)
    sampleEmployees.slice(0, 4).forEach(function(emp) {
      var paymentId = generateUUID();
      var payStatementEntityId = generateUUID();
      events.push({
        company_id: companyId,
        account_id: accountId,
        connection_id: connectionId,
        event_type: 'pay_statement.created',
        data: {
          payment_id: paymentId,
          individual_id: emp.id
        },
        entity_id: payStatementEntityId
      });
      eventIndex++;
    });

    // Generate job.data_sync_all.completed event (exact format from docs)
    var jobId = generateUUID();
    events.push({
      company_id: companyId,
      account_id: accountId,
      connection_id: connectionId,
      event_type: 'job.data_sync_all.completed',
      data: {
        job_id: jobId
      },
      entity_id: jobId
    });
    eventIndex++;

    // Generate account.updated event (exact format from docs)
    events.push({
      company_id: companyId,
      account_id: accountId,
      connection_id: connectionId,
      event_type: 'account.updated',
      data: {
        status: 'connected',
        authentication_method: 'oauth'
      },
      entity_id: connectionId
    });

    // Events are already in reverse chronological order (newest first)
    // No timestamp field in webhook payload per docs, so we keep the order as generated

    // Ensure we always have at least some events
    if (events.length === 0) {
      // Generate at least one mock event if no real data
      events.push({
        company_id: companyId,
        account_id: accountId,
        connection_id: connectionId,
        event_type: 'account.updated',
        data: {
          status: 'connected',
          authentication_method: 'oauth'
        },
        entity_id: connectionId
      });
    }

    console.log("[Finch] Generated", events.length, "webhook events");
    console.log("[Finch] Sample event:", JSON.stringify(events[0], null, 2));
    res.json({ events: events, count: events.length });

  } catch (err) {
    console.error("[Finch] Webhook events error:", err);
    handleApiError(err, res, "webhooks/changes");
  }
});

// Start server

app.listen(PORT, function() {
  console.log("🚀 Backend running on http://localhost:" + PORT);
});
