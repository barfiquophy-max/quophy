"use client";

import { useMemo, useState } from "react";

const STORES = [
  { name: "Emporio Armani New York", address: "601 Madison Avenue, New York, NY 10022", phone: "+1 212 317 0800", hours: "Mon–Sat 10am–7pm, Sun 12pm–6pm" },
  { name: "Emporio Armani Beverly Hills", address: "436 North Rodeo Drive, Beverly Hills, CA 90210", phone: "+1 310 271 5555", hours: "Mon–Sat 10am–6pm" },
  { name: "Emporio Armani Chicago", address: "800 North Michigan Avenue, Chicago, IL 60611", phone: "+1 312 573 4220", hours: "Mon–Sat 10am–7pm" },
  { name: "Emporio Armani Miami Design District", address: "115 NE 39th Street, Miami, FL 33137", phone: "+1 305 573 4331", hours: "Mon–Sat 11am–7pm" },
  { name: "Emporio Armani San Francisco", address: "1 Grant Avenue, San Francisco, CA 94108", phone: "+1 415 677 9400", hours: "Mon–Sat 10am–6pm" },
  { name: "Emporio Armani Houston", address: "5135 West Alabama Street, Houston, TX 77056", phone: "+1 713 850 8871", hours: "Mon–Sat 10am–7pm" },
  { name: "Emporio Armani Boston", address: "22 Newbury Street, Boston, MA 02116", phone: "+1 617 267 3200", hours: "Mon–Sat 10am–6pm" },
  { name: "Emporio Armani Las Vegas", address: "3500 Las Vegas Blvd S, Las Vegas, NV 89109", phone: "+1 702 893 8327", hours: "Daily 10am–11pm" },
];

export default function StoresPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return STORES;
    return STORES.filter((store) =>
      `${store.name} ${store.address}`.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <div className="site-padding py-12">
      <h1 className="text-xl uppercase tracking-[0.1em]">Store locator</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Find an Emporio Armani boutique and book an appointment with a client advisor.
      </p>

      <input
        className="field mt-8 max-w-md"
        placeholder="Search by city or store name"
        aria-label="Search stores"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        data-testid="store-search"
      />

      <ul className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2" data-testid="store-results">
        {results.map((store) => (
          <li key={store.name} className="bg-white p-6">
            <h2 className="text-label uppercase tracking-[0.08em]">{store.name}</h2>
            <p className="mt-2 text-sm text-muted">{store.address}</p>
            <p className="text-sm text-muted">{store.phone}</p>
            <p className="mt-2 text-tiny text-muted">{store.hours}</p>
          </li>
        ))}
      </ul>
      {results.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No stores match your search.</p>
      ) : null}
    </div>
  );
}
