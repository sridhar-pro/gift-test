// app/api/proxy/categories/route.js
export async function GET() {
  try {
    const res = await fetch(
      "https://marketplace.betalearnings.com/api/category"
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      { status: 500 }
    );
  }
}
