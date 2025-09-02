import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the request body coming from the client
    const body = await req.json();

    // Get the auth token from the request headers (sent by client)
    const authHeader = req.headers.get("authorization");

    // Forward the request to the original API endpoint
    const response = await fetch(
      "https://marketplace.betalearnings.com/api/v1/Marketv2/save_prebook_gifts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    // Return the response back to the client
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("🔴 Prebook API Error:", error);
    return NextResponse.json(
      { status: "error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
