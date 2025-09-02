// /app/api/products/route.js
export async function POST() {
  try {
    const res = await fetch(
      "https://marketplace.betalearnings.com/api/v1/Marketv2/getProducts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch products",
          status: res.status,
          body: text,
        }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!text) {
      return new Response(
        JSON.stringify({ error: "API returned empty response" }),
        { status: 204, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(text);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
