#!/usr/bin/env node
import axios from "axios";

const BASE = process.env.API_BASE || "http://localhost:3000/services-used";
const args = process.argv.slice(2);
const doMutate = args.includes("--mutate");

// Token can be provided via --token <token> or env var API_TOKEN
let tokenFromArg = null;
const tokenArgIndex = args.findIndex(a => a === '--token');
if (tokenArgIndex !== -1 && args.length > tokenArgIndex + 1) {
  tokenFromArg = args[tokenArgIndex + 1];
}

const TOKEN = tokenFromArg || process.env.API_TOKEN || process.env.ACCESS_TOKEN || null;

const client = axios.create({
  headers: { 'Content-Type': 'application/json' }
});

if (TOKEN) {
  client.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;
}

async function run() {
  console.log("Testing API base:", BASE);
  if (!TOKEN) console.log("No token provided — requests may return 401. Provide with --token or API_TOKEN env var.");

  try {
    const resAll = await client.get(`${BASE}/getAll`, { params: { page: 1, pageSize: 10 } });
    console.log("GET /getAll ->", resAll.status, "items:", resAll.data?.data?.items?.length ?? "unknown");
  } catch (e) {
    const msg = e?.response ? `${e.response.status} ${e.response.statusText}` : e?.message ?? e;
    console.error("GET /getAl failed:", msg);
  }

  try {
    const resById = await client.get(`${BASE}/getById/1`);
    console.log("GET /getById/1 ->", resById.status, "hasData:", !!resById.data?.data);
  } catch (e) {
    const msg = e?.response ? `${e.response.status} ${e.response.statusText}` : e?.message ?? e;
    console.error("GET /getById/1 failed:", msg);
  }

  if (doMutate) {
    try {
      const createRes = await client.post(`${BASE}`, {
        serviceName: "Test Service",
        price: 100,
        capacity: 10,
        description: "A test service",
        status: 1,
      });
      console.log("POST / ->", createRes.status, "created id:", createRes.data?.data?.serviceId ?? "unknown");
    } catch (e) {
      const msg = e?.response ? `${e.response.status} ${e.response.statusText}` : e?.message ?? e;
      console.error("POST / failed:", msg);
    }

    try {
      const updateRes = await client.put(`${BASE}/1`, {
        serviceName: "Test Update",
        price: 123,
        capacity: 1,
        description: "test",
        status: 1,
      });
      console.log("PUT /1 ->", updateRes.status);
    } catch (e) {
      const msg = e?.response ? `${e.response.status} ${e.response.statusText}` : e?.message ?? e;
      console.error("PUT /1 failed:", msg);
    }
  } else {
    console.log("Skipping destructive tests. Run with --mutate to enable POST and PUT.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
