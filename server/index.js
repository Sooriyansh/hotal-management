import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  getActiveOffers,
  getAvailableRooms,
  getAvailableTables,
  getRestaurantMenu,
  getSpaServices,
  getWeddingPackages,
  hotelData
} from "./hotelData.js";

const port = Number(process.env.PORT || 5050);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

loadDotEnv();

const toolHandlers = {
  getAvailableRooms,
  getActiveOffers,
  getRestaurantMenu,
  getAvailableTables,
  getWeddingPackages,
  getSpaServices,
  getEvents: () => hotelData.events,
  getHotelContact: () => hotelData.hotel
};

const systemPrompt = `You are Grand Luxury Hotel & Restaurant's Official AI Concierge.

Rules:
1. Always represent the hotel professionally.
2. Support Hindi, English and Hinglish.
3. Answer only using information provided by hotel database and APIs.
4. Never hallucinate.
5. Never create fake room prices.
6. Never create fake offers.
7. If information is unavailable say: "Please contact our reception team for the latest information."
8. Be friendly, professional and luxury hospitality focused.
9. Recommend rooms, food, events and spa services whenever helpful.
10. Maintain conversational memory during the session.
11. Keep responses clear and concise.
12. Act like a real 5-star hotel concierge.`;

const server = createServer(async (request, response) => {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && request.url === "/api/concierge/context") {
      sendJson(response, { hotel: hotelData.hotel, quickActions: quickActions() });
      return;
    }

    if (request.method === "GET" && request.url === "/api/admin/ai-insights") {
      sendJson(response, hotelData.analytics);
      return;
    }

    if (request.method === "POST" && request.url === "/api/concierge/chat") {
      const body = await readJson(request);
      const result = await handleChat(body);
      sendJson(response, result);
      return;
    }

    sendJson(response, { error: "Not found" }, 404);
  } catch (error) {
    sendJson(response, { error: error.message || "Server error" }, 500);
  }
});

server.listen(port, () => {
  console.log(`AI Concierge API running on http://localhost:${port}`);
});

function loadDotEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
  }
}

async function handleChat({ message = "", history = [] }) {
  const toolsUsed = selectTools(message);
  const apiResults = Object.fromEntries(toolsUsed.map((tool) => [tool, toolHandlers[tool] ? toolHandlers[tool]() : null]));

  if (!process.env.GEMINI_API_KEY) {
    return {
      reply: buildGroundedFallback(message, apiResults),
      toolsUsed,
      source: "hotel-api"
    };
  }

  try {
    const reply = await callGemini(message, history, apiResults);
    return { reply, toolsUsed, source: "gemini" };
  } catch (error) {
    console.error(`Gemini unavailable, using hotel data fallback: ${error.message}`);
    return {
      reply: buildGroundedFallback(message, apiResults),
      toolsUsed,
      source: "hotel-api"
    };
  }
}

function selectTools(message) {
  const value = message.toLowerCase();
  const selected = new Set(["getHotelContact"]);

  if (/(room|kamra|deluxe|suite|family|available|availability|price|rate|capacity)/i.test(value)) selected.add("getAvailableRooms");
  if (/(offer|discount|coupon|deal|grand20|aaj|today)/i.test(value)) selected.add("getActiveOffers");
  if (/(menu|food|dish|chinese|indian|italian|breakfast|dinner|lunch|chef|khana)/i.test(value)) selected.add("getRestaurantMenu");
  if (/(table|reserve|reservation|restaurant booking)/i.test(value)) selected.add("getAvailableTables");
  if (/(wedding|conference|birthday|corporate|event|hall|package)/i.test(value)) selected.add("getWeddingPackages");
  if (/(spa|massage|wellness|therapy)/i.test(value)) selected.add("getSpaServices");

  if (selected.size === 1) {
    selected.add("getAvailableRooms");
    selected.add("getRestaurantMenu");
    selected.add("getActiveOffers");
  }

  return [...selected];
}

async function callGemini(message, history, apiResults) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const contents = [
    ...history.slice(-10).map((item) => ({
      role: item.from === "bot" ? "model" : "user",
      parts: [{ text: item.text }]
    })),
    {
      role: "user",
      parts: [{
        text: `Customer message: ${message}

Live hotel API results:
${JSON.stringify(apiResults, null, 2)}

Answer in the customer's language. Use only the live API results.`
      }]
    }
  ];

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 420
    }
  };

  const geminiResponse = await fetchWithRetry(endpoint, payload);
  const data = await geminiResponse.json();
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("").trim() || "Please contact our reception team for the latest information.";
}

async function fetchWithRetry(endpoint, payload) {
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (geminiResponse.ok) return geminiResponse;

    const details = await geminiResponse.text();
    lastError = new Error(formatGeminiError(geminiResponse.status, details));

    if (!isTransientGeminiError(geminiResponse.status) || attempt === maxAttempts) {
      throw lastError;
    }

    await wait(450 * attempt);
  }

  throw lastError || new Error("Gemini request failed");
}

function isTransientGeminiError(status) {
  return status === 429 || status === 503 || status === 504;
}

function formatGeminiError(status, details) {
  try {
    const parsed = JSON.parse(details);
    const message = parsed.error?.message || details;
    return `Gemini ${status}: ${message}`;
  } catch {
    return `Gemini ${status}: ${details}`;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildGroundedFallback(message, apiResults) {
  const value = message.toLowerCase();
  const menu = apiResults.getRestaurantMenu;
  if (menu) {
    const categoryMatches = [
      ["chinese", "Chinese Cuisine"],
      ["indian", "Indian Cuisine"],
      ["italian", "Italian Cuisine"],
      ["breakfast", "Breakfast"],
      ["dessert", "Desserts"],
      ["beverage", "Beverages"],
      ["dinner", "Dinner"]
    ];
    const category = categoryMatches.find(([keyword]) => value.includes(keyword))?.[1];
    const matches = category ? menu.filter((item) => item.category === category) : menu.filter((item) => item.tags?.some((tag) => /chef special|popular|favorite/i.test(tag)));
    if (matches.length) {
      const items = matches.slice(0, 4).map((item) => `${item.name} $${item.price} (${item.rating}/5)`).join("; ");
      return /(hindi|hinglish|bhai|kya|dikhao|batao|chahiye|khana)/i.test(value)
        ? `${category || "Chef picks"} me best options: ${items}.`
        : `${category || "Chef picks"}: ${items}.`;
    }
  }

  if (/(hindi|hinglish|bhai|kya|dikhao|batao|chahiye|kamra|khana|shaadi|kal|aaj)/i.test(value)) {
    if (apiResults.getAvailableRooms) return `Available rooms: ${apiResults.getAvailableRooms.map((room) => `${room.name} $${room.price}, capacity ${room.capacity}`).join("; ")}. Booking ke liye date, guests aur preferred room batayein.`;
    if (menu) return `Menu me chef picks: ${menu.slice(0, 4).map((item) => `${item.name} $${item.price}`).join("; ")}.`;
  }

  if (apiResults.getActiveOffers) return `Active offers: ${apiResults.getActiveOffers.map((offer) => `${offer.name} - ${offer.discount}`).join("; ")}.`;
  if (menu) return `Menu highlights: ${menu.slice(0, 4).map((item) => `${item.name} ($${item.price})`).join(", ")}.`;
  return "Please contact our reception team for the latest information.";
}

function quickActions() {
  return ["Available Rooms", "Book Room", "Restaurant Menu", "Reserve Table", "Today's Offers", "Spa Services", "Wedding Packages", "Contact Reception"];
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}
