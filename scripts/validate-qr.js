/**
 * Validates the QR endpoint's URL construction and that the generated PNG
 * decodes back to the exact same URL — i.e. that a phone camera scanning
 * the QR will open the right page.
 *
 * Run: node scripts/validate-qr.js
 */
const QRCode = require("qrcode")
const jsQR = require("jsqr")
const { PNG } = require("pngjs")

// Mirror of the logic in pages/api/qr/[eventoId].js
function buildCheckinUrl({ host, eventoId, forwardedProto, siteUrl }) {
  const proto =
    forwardedProto ||
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https")
  const base = siteUrl || `${proto}://${host}`
  return `${base.replace(/\/$/, "")}/checkin/${eventoId}`
}

async function generateAndDecode(url) {
  const buffer = await QRCode.toBuffer(url, {
    width: 800,
    margin: 2,
    errorCorrectionLevel: "M",
  })

  // Quick sanity check on PNG magic bytes
  if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4e || buffer[3] !== 0x47) {
    throw new Error("Output is not a valid PNG")
  }

  const png = PNG.sync.read(buffer)
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
  if (!decoded) throw new Error("jsQR could not decode the generated PNG")
  return { decodedUrl: decoded.data, pngBytes: buffer.length, width: png.width }
}

function assertEq(label, got, expected) {
  if (got === expected) {
    console.log(`   ✅ ${label}`)
    return true
  }
  console.log(`   ❌ ${label}\n      expected: ${expected}\n      got:      ${got}`)
  return false
}

async function main() {
  let pass = 0, fail = 0
  const record = (ok) => ok ? pass++ : fail++

  console.log("→ Test 1: localhost host → http scheme")
  {
    const url = buildCheckinUrl({ host: "localhost:3000", eventoId: "abc-123" })
    record(assertEq("URL", url, "http://localhost:3000/checkin/abc-123"))
    const { decodedUrl, pngBytes, width } = await generateAndDecode(url)
    record(assertEq(`decodes back (PNG ${pngBytes}B, ${width}px)`, decodedUrl, url))
  }

  console.log("\n→ Test 2: production host (no forwarded-proto) → https")
  {
    const url = buildCheckinUrl({ host: "neogeneralista.pt", eventoId: "f5ae8cea-1078-4c8f-83c4-ef80d7519ef6" })
    record(assertEq("URL", url, "https://neogeneralista.pt/checkin/f5ae8cea-1078-4c8f-83c4-ef80d7519ef6"))
    const { decodedUrl } = await generateAndDecode(url)
    record(assertEq("decodes back", decodedUrl, url))
  }

  console.log("\n→ Test 3: Vercel proxy forwards https → respects forwarded-proto")
  {
    const url = buildCheckinUrl({ host: "neogeneralista.pt", eventoId: "xyz", forwardedProto: "https" })
    record(assertEq("URL", url, "https://neogeneralista.pt/checkin/xyz"))
  }

  console.log("\n→ Test 4: SITE_URL env overrides everything")
  {
    const url = buildCheckinUrl({ host: "internal", eventoId: "xyz", siteUrl: "https://custom.example.com" })
    record(assertEq("URL", url, "https://custom.example.com/checkin/xyz"))
  }

  console.log("\n→ Test 5: SITE_URL with trailing slash is normalised")
  {
    const url = buildCheckinUrl({ host: "x", eventoId: "abc", siteUrl: "https://neogeneralista.pt/" })
    record(assertEq("URL", url, "https://neogeneralista.pt/checkin/abc"))
  }

  console.log("\n→ Test 6: realistic event id roundtrip at full size (800px)")
  {
    const url = buildCheckinUrl({
      host: "neogeneralista.pt",
      eventoId: "8889918e-a009-4f10-b4e8-6d59b3d9c548",
    })
    const { decodedUrl, pngBytes, width } = await generateAndDecode(url)
    record(assertEq(`decodes back (PNG ${pngBytes}B, ${width}px)`, decodedUrl, url))
  }

  console.log(`\n${"=".repeat(40)}`)
  console.log(`RESULTS: ${pass} passed, ${fail} failed`)
  console.log("=".repeat(40))
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error("\n💥", e)
  process.exit(1)
})
