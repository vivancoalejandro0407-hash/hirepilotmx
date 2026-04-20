S
Copiar

const Anthropic = require("@anthropic-ai/sdk");
 
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
 
  try {
    const body = JSON.parse(event.body);
 
    let messages;
 
    if (body.pdf) {
      // CV llega como PDF en base64 — mandarlo como documento a Claude
      messages = [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: body.pdf,
              },
            },
            {
              type: "text",
              text: body.prompt,
            },
          ],
        },
      ];
    } else {
      // Texto plano normal
      messages = [
        {
          role: "user",
          content: body.prompt,
        },
      ];
    }
 
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: body.system || "Eres un asistente experto en recursos humanos y optimización de CVs para el mercado laboral mexicano.",
      messages,
    });
 
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
 
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
