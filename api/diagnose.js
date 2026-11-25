export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { model, issue } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "Error: GEMINI_API_KEY is missing in Vercel settings." });
    }

    const prompt = `You are an expert UK Land Rover Master Technician. A user has a ${model} with the following issue: "${issue}". 
    Provide a clear, structured diagnosis in British English:
    1. Likely Causes (Bullet points)
    2. DIY Checks they can do at home
    3. UK MOT Impact (Will this fail an MOT?)
    4. Estimated UK Garage Repair Cost (in £ GBP)
    Keep it practical, helpful, and easy to read.`;

    try {
        const response = await fetch(`https://googleapis.com{apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: "API Error: " + data.error.message });
        }

        const candidate = data.candidates ? data.candidates.at(0) : null;
        const part = candidate && candidate.content && candidate.content.parts ? candidate.content.parts.at(0) : null;
        const replyText = part ? part.text : "No response generated. Please try again.";

        res.status(200).json({ reply: replyText });
    } catch (error) {
        res.status(200).json({ reply: "System Error: " + error.message });
    }
}
