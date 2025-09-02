// app/api/categories/route.js
export async function GET() {
  try {
    const res = await fetch(
      "https://marketplace.betalearnings.com/api/v1/Marketv2/giftCategory",
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch categories" }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();

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
