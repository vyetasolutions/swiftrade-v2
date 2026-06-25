import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { request_id } = await req.json()
    if (!request_id) return new Response(JSON.stringify({ error: "request_id required" }), { status: 400, headers: corsHeaders })

    // Fetch the request
    const { data: request, error: reqErr } = await supabase
      .from("requests")
      .select("*, categories(name,slug)")
      .eq("id", request_id)
      .single()
    if (reqErr || !request) throw new Error("Request not found")

    // Fetch platform settings
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key,value")
      .in("key", ["matching_weights", "max_matches_per_request", "points_per_match"])

    const settingsMap: Record<string, any> = {}
    settings?.forEach(s => { settingsMap[s.key] = s.value })

    const weights     = settingsMap["matching_weights"]     || { category_match:40, keyword_match:25, location_match:15, capability_match:10, historical_performance:10 }
    const maxMatches  = Number(settingsMap["max_matches_per_request"] || 3)
    const pointsCost  = Number(settingsMap["points_per_match"] || 25)

    // Fetch eligible suppliers (active, enough points)
    const { data: suppliers, error: supErr } = await supabase
      .from("suppliers")
      .select("*, supplier_categories(category_id, categories(name,slug)), supplier_locations(*)")
      .eq("status", "active")
      .neq("subscription_status", "expired")
      .gte("point_balance", pointsCost)

    if (supErr) throw supErr
    if (!suppliers?.length) {
      await supabase.from("requests").update({ status: "matching" }).eq("id", request_id)
      return new Response(JSON.stringify({ matched: 0 }), { headers: corsHeaders })
    }

    // Score each supplier
    const scored = suppliers
      .map(supplier => {
        const breakdown = {
          category_match:         scoreCategoryMatch(supplier, request, weights.category_match),
          keyword_match:          scoreKeywordMatch(supplier, request, weights.keyword_match),
          location_match:         scoreLocationMatch(supplier, request, weights.location_match),
          capability_match:       scoreCapabilityMatch(supplier, request, weights.capability_match),
          historical_performance: scoreHistoricalPerformance(supplier, weights.historical_performance),
        }
        const total = Object.values(breakdown).reduce((a: number, b) => a + (b as number), 0)
        return { supplier, breakdown, total }
      })
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, maxMatches)

    // Insert matches and deduct points
    let matchCount = 0
    for (let i = 0; i < scored.length; i++) {
      const { supplier, breakdown, total } = scored[i]

      const matchCode = `MCH-${Date.now()}-${i}`

      const { error: matchErr } = await supabase.from("request_matches").insert({
        match_code:     matchCode,
        request_id:     request_id,
        supplier_id:    supplier.id,
        rank:           i + 1,
        total_score:    total,
        score_breakdown: breakdown,
        status:         "notified",
        points_charged: pointsCost,
        notified_at:    new Date().toISOString(),
      })

      if (matchErr) continue

      // Deduct points
      const newBalance = supplier.point_balance - pointsCost
      await supabase.from("suppliers").update({
        point_balance:  newBalance,
        points_spent:   (supplier.points_spent || 0) + pointsCost,
        total_matches:  (supplier.total_matches || 0) + 1,
      }).eq("id", supplier.id)

      // Log wallet transaction
      await supabase.from("wallet_transactions").insert({
        tx_code:      `TXN-${Date.now()}-${i}`,
        supplier_id:  supplier.id,
        type:         "debit",
        points:       -pointsCost,
        description:  `Match notification — ${request.reference_code}`,
        match_id:     null,
        balance_after: newBalance,
      })

      // Create notification for supplier
      await supabase.from("notifications").insert({
        user_id:  supplier.profile_id,
        type:     "match_found",
        title:    "New match found",
        body:     `You have a new match for: ${request.title}`,
        data:     { request_id, match_code: matchCode, rank: i + 1, score: total },
      })

      matchCount++
    }

    // Create notification for customer
    if (matchCount > 0) {
      await supabase.from("notifications").insert({
        user_id:  request.customer_id,
        type:     "match_found",
        title:    "Suppliers found",
        body:     `We matched ${matchCount} supplier${matchCount > 1 ? "s" : ""} to your request.`,
        data:     { request_id },
      })
    }

    // Update request status
    await supabase.from("requests").update({
      status:      matchCount > 0 ? "matching" : "matching",
      match_count: matchCount,
    }).eq("id", request_id)

    return new Response(
      JSON.stringify({ matched: matchCount, scored: scored.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("Matching error:", err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: corsHeaders
    })
  }
})

// ── Scoring functions ──────────────────────────────────────────

function scoreCategoryMatch(supplier: any, request: any, weight: number): number {
  if (!request.category_id) return 0
  const cats = supplier.supplier_categories || []
  const match = cats.some((sc: any) => sc.category_id === request.category_id)
  return match ? weight : 0
}

function scoreKeywordMatch(supplier: any, request: any, weight: number): number {
  if (!supplier.keywords?.length) return 0
  const text = `${request.title} ${request.description}`.toLowerCase()
  const kws  = supplier.keywords.map((k: string) => k.toLowerCase())
  const hits  = kws.filter((k: string) => text.includes(k)).length
  const ratio = Math.min(hits / Math.max(kws.length, 1), 1)
  return Math.round(ratio * weight * 10) / 10
}

function scoreLocationMatch(supplier: any, request: any, weight: number): number {
  const locs = supplier.supplier_locations || []
  if (!locs.length) return 0

  // Scope check
  const scope = request.sourcing_scope
  if (scope === "local" && supplier.sourcing_scope === "international") return 0
  if (scope === "international" && supplier.sourcing_scope === "local") return 0

  // International request — country match
  if (scope === "international" || scope === "both") {
    const preferred = request.countries_preferred || ["ZM"]
    const served    = supplier.countries_served    || ["ZM"]
    const countryHit = preferred.some((c: string) => served.includes(c))
    if (countryHit) return weight * 0.6
  }

  // Local match — province/city
  const reqProvince = request.location_province?.toLowerCase() || ""
  const reqCity     = request.location_city?.toLowerCase()     || ""

  let best = 0
  for (const loc of locs) {
    const locProvince = loc.province?.toLowerCase() || ""
    const locCity     = loc.city?.toLowerCase()     || ""
    let score = 0
    if (reqProvince && locProvince && reqProvince === locProvince) score += weight * 0.6
    if (reqCity     && locCity     && reqCity     === locCity)     score += weight * 0.4
    if (score > best) best = score
  }
  return Math.round(best * 10) / 10
}

function scoreCapabilityMatch(supplier: any, request: any, weight: number): number {
  let score = 0
  const half = weight / 2

  // Budget overlap
  if (request.budget_max_zmw && supplier.budget_min_zmw) {
    if (request.budget_max_zmw >= supplier.budget_min_zmw) score += half
  } else {
    score += half * 0.5 // partial credit when budget not specified
  }

  // Scope match
  const scopeMap: Record<string, string[]> = {
    local:         ["local","both"],
    international: ["international","both"],
    both:          ["local","international","both"],
  }
  const reqScope  = request.sourcing_scope  || "local"
  const supScope  = supplier.sourcing_scope || "local"
  if (scopeMap[reqScope]?.includes(supScope)) score += half

  return Math.round(score * 10) / 10
}

function scoreHistoricalPerformance(supplier: any, weight: number): number {
  const matches = supplier.total_matches || 0
  if (matches < 3) return weight * 0.5 // neutral score for new suppliers

  const responseRate = (supplier.response_rate || 0) / 100
  const closureRate  = (supplier.closure_rate  || 0) / 100
  const composite    = responseRate * 0.6 + closureRate * 0.4

  return Math.round(composite * weight * 10) / 10
}
