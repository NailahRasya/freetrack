import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
    }

    // 2. Parse request body
    let body: { milestone_id: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { milestone_id } = body;
    if (!milestone_id) {
      return NextResponse.json({ error: "Missing required field: milestone_id" }, { status: 400 });
    }

    // 3. Fetch milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", milestone_id)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json({ error: "Milestone tidak ditemukan." }, { status: 404 });
    }

    if (!milestone.amount || milestone.amount <= 0) {
      return NextResponse.json({ error: "Nominal milestone tidak valid." }, { status: 400 });
    }

    // 4. Check Midtrans configurations
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { error: "Midtrans Server Key is not configured in environment variables." },
        { status: 500 }
      );
    }

    // Generate unique order ID for Midtrans to prevent duplicate transaction errors
    const orderId = `FT-${milestone.id.substring(0, 8)}-${Date.now()}`;

    // 5. Prepare payload for Midtrans Snap API
    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: milestone.amount,
      },
      item_details: [
        {
          id: milestone.id,
          price: milestone.amount,
          quantity: 1,
          name: milestone.title.length > 50 ? milestone.title.substring(0, 47) + "..." : milestone.title,
        },
      ],
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: user.user_metadata?.full_name || "Client",
        email: user.email,
      },
    };

    // 6. Make request to Midtrans Snap Sandbox
    const midtransRes = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(payload),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      console.error("Midtrans API Error response:", midtransData);
      return NextResponse.json(
        { error: midtransData.error_messages?.[0] || "Gagal menghubungi API Midtrans." },
        { status: midtransRes.status }
      );
    }

    // 7. Return Midtrans Snap Token and redirect URL
    return NextResponse.json({
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      order_id: orderId,
    });
  } catch (err: any) {
    console.error("API /api/midtrans/token error:", err);
    return NextResponse.json({ error: "Internal server error: " + err.message }, { status: 500 });
  }
}
