const axios = require("axios");

// Function to generate a risk summary from zone data
async function generateRiskSummary(zones) {
  // Create a text summary of all zones
  let zoneText = zones
    .map(z => `Zone ${z._id}: Density ${z.density}`)
    .join("\n");

  // Build the prompt for the AI
  let prompt = `You are a crowd risk AI assistant.
The density is from 0 to 10. Above 7 is considered risky.
Here's the current data:
${zoneText}

Write a short 2–3 line risk summary. Mention any risky zones, suggest evacuation if needed.`;

  try {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7 //  Required field (was missing)
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5000", //  Required by OpenRouter
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
} catch (err) {
  console.error(" OpenRouter Full Error:");
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Data:", err.response.data);
  } else {
    console.error("Message:", err.message);
  }
  return "Unable to generate risk summary due to AI error.";
}

  }


module.exports = generateRiskSummary;
