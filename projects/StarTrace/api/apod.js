export default async function handler(req, res) {
  const { date } = req.query;
  const apiKey = process.env.NASA_API_KEY;

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`);
    if (!response.ok) {
      const error = await response.text();
      console.error("NASA API error:", error);
      return res.status(500).json({ error: "Failed to fetch APOD" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API call error:", error);
    res.status(500).json({ error: "Failed to fetch APOD" });
  }
}
