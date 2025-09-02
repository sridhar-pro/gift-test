// pages/api/sendGiftBox.js

export default async function handler(req, res) {
  //   if (req.method !== "POST") {
  //     return res.status(405).json({ error: "Method not allowed" });
  //   }
  console.log("hi");

  try {
    const {
      selected_country,
      historypincode,
      product_ids,
      box_id,
      addons_id,
      box_text,
    } = req.body;

    // Validate required fields
    if (!product_ids?.length || !box_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Forward the request to the external API
    const apiResponse = await fetch(
      "https://marketplace.betalearnings.com/api/v1/Marketv2/addGiftCard",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selected_country,
          historypincode,
          product_ids,
          box_id,
          addons_id,
          box_text,
        }),
      }
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("External API Error:", result);
      return res.status(apiResponse.status).json({
        error: result?.message || "Something went wrong with external API",
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
