import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Battery, BatteryLow, Clock, MapPin, Truck, Zap, Leaf, Activity,
  CheckCircle2, AlertTriangle, Gauge, ShieldCheck, Timer, ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChargeRunner — Manheim EV Dispatch Control Tower" },
      { name: "description", content: "ChargeRunner turns EV charging downtime into auction intelligence." },
    ],
  }),
  component: Dashboard,
});

type Vehicle = {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  lot: string;
  soc: number;
  targetSoc: number;
  auctionInHours: number;
  transportInHours: number;
  batteryHealth: "complete" | "missing";
  daysOnLot: number;
  estValue: number;
  serviceStatus: "pending" | "in_progress" | "completed";
  transportReady: boolean;
};

const SEED: Vehicle[] = [
  { id: "1", vin: "5YJ3E1EA7KF000123", year: 2023, make: "Tesla", model: "Model 3 LR", lot: "G-4", soc: 12, targetSoc: 85, auctionInHours: 1.5, transportInHours: 6, batteryHealth: "missing", daysOnLot: 14, estValue: 38500, serviceStatus: "pending", transportReady: false },
  { id: "2", vin: "1FT6W1EV5PWG12345", year: 2024, make: "Ford", model: "F-150 Lightning", lot: "B-12", soc: 18, targetSoc: 90, auctionInHours: 3.5, transportInHours: 3, batteryHealth: "missing", daysOnLot: 9, estValue: 62000, serviceStatus: "pending", transportReady: false },
  { id: "3", vin: "KM8K33AGXMU123987", year: 2024, make: "Hyundai", model: "Ioniq 5", lot: "C-7", soc: 28, targetSoc: 80, auctionInHours: 1.75, transportInHours: 8, batteryHealth: "complete", daysOnLot: 6, estValue: 41200, serviceStatus: "pending", transportReady: false },
  { id: "4", vin: "WBY8P2C09M7H44556", year: 2023, make: "BMW", model: "i4 M50", lot: "A-2", soc: 22, targetSoc: 85, auctionInHours: 8, transportInHours: 12, batteryHealth: "missing", daysOnLot: 12, estValue: 56800, serviceStatus: "pending", transportReady: false },
  { id: "5", vin: "1G1FY6S03P4100234", year: 2024, make: "Chevrolet", model: "Equinox EV", lot: "F-9", soc: 45, targetSoc: 80, auctionInHours: 5, transportInHours: 10, batteryHealth: "complete", daysOnLot: 4, estValue: 34900, serviceStatus: "pending", transportReady: false },
  { id: "6", vin: "WP0AB2A75NL230456", year: 2023, make: "Porsche", model: "Taycan 4S", lot: "D-1", soc: 31, targetSoc: 85, auctionInHours: 3.9, transportInHours: 5, batteryHealth: "missing", daysOnLot: 11, estValue: 89000, serviceStatus: "pending", transportReady: false },
  { id: "7", vin: "5YJSA1E26MF000789", year: 2022, make: "Tesla", model: "Model S", lot: "G-1", soc: 55, targetSoc: 85, auctionInHours: 24, transportInHours: 30, batteryHealth: "complete", daysOnLot: 3, estValue: 51200, serviceStatus: "pending", transportReady: false },
  { id: "8", vin: "1N4BZ1CV5LC300321", year: 2024, make: "Nissan", model: "Ariya", lot: "E-5", soc: 19, targetSoc: 80, auctionInHours: 6, transportInHours: 9, batteryHealth: "complete", daysOnLot: 8, estValue: 32500, serviceStatus: "pending", transportReady: false },
  { id: "9", vin: "JN1AZ4EH8FM550112", year: 2023, make: "Rivian", model: "R1T", lot: "H-3", soc: 38, targetSoc: 90, auctionInHours: 4.5, transportInHours: 7, batteryHealth: "missing", daysOnLot: 13, estValue: 71500, serviceStatus: "pending", transportReady: false },
  { id: "10", vin: "WAUEAAFR1MA660998", year: 2024, make: "Audi", model: "Q8 e-tron", lot: "B-6", soc: 62, targetSoc: 85, auctionInHours: 12, transportInHours: 18, batteryHealth: "complete", daysOnLot: 2, estValue: 68900, serviceStatus: "pending", transportReady: true },
];

type Scored = Vehicle & { score: number; reasons: string[]; recommended: string };

function scoreVehicle(v: Vehicle): Scored {
  let score = 0;
  const reasons: string[] = [];
  if (v.soc < 20) { score += 35; reasons.push("Critical SoC <20%"); }
  else if (v.soc < 35) { score += 20; reasons.push("Low SoC 20–35%"); }
  if (v.auctionInHours <= 2) { score += 30; reasons.push("Auction <2h"); }
  else if (v.auctionInHours <= 4) { score += 15; reasons.push("Auction <4h"); }
  if (v.transportInHours <= 4) { score += 25; reasons.push("Transport <4h"); }
  if (v.batteryHealth === "missing") { score += 20; reasons.push("Battery report missing"); }
  if (v.daysOnLot > 10) { score += 10; reasons.push("Aged inventory >10d"); }
  if (v.estValue > 45000) { score += 10; reasons.push("High value >$45k"); }

  let recommended = "Schedule charging in next 4h window";
  if (v.serviceStatus === "completed") recommended = "Ready for auction — no action";
  else if (score >= 70) recommended = `Dispatch mobile unit NOW to Grid ${v.lot}`;
  else if (score >= 40) recommended = `Queue dispatch to Grid ${v.lot} within 60 min`;

  return { ...v, score, reasons, recommended };
}

function socColor(soc: number) {
  if (soc < 20) return "text-red-600";
  if (soc < 35) return "text-amber-600";
  return "text-emerald-600";
}

function scoreBadge(score: number) {
  if (score >= 70) return "bg-red-100 text-red-700 border-red-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED);
  const [selectedId, setSelectedId] = useState<string>("1");

  const scored = useMemo(
    () => vehicles.map(scoreVehicle).sort((a, b) => b.score - a.score),
    [vehicles]
  );

  const selected = scored.find((v) => v.id === selectedId) ?? scored[0];

  const metrics = useMemo(() => {
    const critical = scored.filter((v) => v.score >= 70).length;
    const pending = scored.filter((v) => v.serviceStatus !== "completed").length;
    const ready = scored.filter((v) => v.transportReady).length;
    const avgSoc = Math.round(scored.reduce((s, v) => s + v.soc, 0) / scored.length);
    const missingHealth = scored.filter((v) => v.batteryHealth === "missing").length;
    const completed = scored.filter((v) => v.serviceStatus === "completed").length;
    return { critical, pending, ready, avgSoc, missingHealth, completed };
  }, [scored]);

  const completeService = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, soc: v.targetSoc, batteryHealth: "complete", transportReady: true, serviceStatus: "completed" }
          : v
      )
    );
  };

  const dispatchUnit = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, serviceStatus: "in_progress" } : v))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">ChargeRunner</div>
              <div className="text-xs text-slate-500">Manheim · Atlanta Lot · Control Tower</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm md:flex">
            <div className="flex items-center gap-2 text-slate-600"><Activity className="h-4 w-4 text-emerald-500" /> Live · 12 mobile units</div>
            <div className="text-slate-500">Tue · Jun 16, 2026 · 09:42 ET</div>
          </div>
        </div>
      </header>

      {/* Hero / pitch */}
      <section className="border-b bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white">
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-sky-300">EV Dispatch Intelligence</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                ChargeRunner turns EV charging downtime into auction intelligence.
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-300">
                A software layer over Manheim's existing vehicle location, EV battery-health, and mobile fleet
                service capabilities — deciding what should charge next, and why.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div><div className="text-xs text-slate-400">Connected systems</div><div className="font-medium">Lot Vision · Mobile Service · AuctionOS</div></div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Metric icon={<AlertTriangle className="h-4 w-4" />} label="Critical priority" value={metrics.critical} tone="red" />
          <Metric icon={<Truck className="h-4 w-4" />} label="Pending service" value={metrics.pending} tone="amber" />
          <Metric icon={<CheckCircle2 className="h-4 w-4" />} label="Transport ready" value={metrics.ready} tone="emerald" />
          <Metric icon={<Gauge className="h-4 w-4" />} label="Avg fleet SoC" value={`${metrics.avgSoc}%`} tone="sky" />
          <Metric icon={<ShieldCheck className="h-4 w-4" />} label="Missing BH report" value={metrics.missingHealth} tone="violet" />
          <Metric icon={<Leaf className="h-4 w-4" />} label="Services completed" value={metrics.completed} tone="slate" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Queue */}
          <Card className="lg:col-span-2 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Vehicle Priority Queue</div>
                <div className="text-xs text-slate-500">Ranked by ChargeRunner priority score · {scored.length} vehicles</div>
              </div>
              <Badge variant="outline" className="text-xs">Auto-refresh · 30s</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Vehicle</th>
                    <th className="px-4 py-2 text-left">Lot</th>
                    <th className="px-4 py-2 text-left">SoC</th>
                    <th className="px-4 py-2 text-left">Auction</th>
                    <th className="px-4 py-2 text-left">BH</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scored.map((v, idx) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`cursor-pointer border-t transition-colors hover:bg-sky-50/60 ${selected?.id === v.id ? "bg-sky-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{v.year} {v.make} {v.model}</div>
                        <div className="text-xs text-slate-500">{v.vin}</div>
                      </td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1 text-slate-700"><MapPin className="h-3 w-3" />{v.lot}</div></td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 font-medium ${socColor(v.soc)}`}>
                          {v.soc < 20 ? <BatteryLow className="h-4 w-4" /> : <Battery className="h-4 w-4" />}
                          {v.soc}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700"><div className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.auctionInHours}h</div></td>
                      <td className="px-4 py-3">
                        {v.batteryHealth === "complete"
                          ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Complete</Badge>
                          : <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Missing</Badge>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {v.serviceStatus === "completed" && <span className="text-emerald-600">Completed</span>}
                        {v.serviceStatus === "in_progress" && <span className="text-sky-600">In progress</span>}
                        {v.serviceStatus === "pending" && <span className="text-slate-500">Pending</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex min-w-[2.5rem] justify-center rounded-md border px-2 py-0.5 text-xs font-semibold ${scoreBadge(v.score)}`}>{v.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Detail panel */}
          <div className="space-y-6">
            {selected && (
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">Vehicle Detail</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{selected.year} {selected.make} {selected.model}</div>
                    <div className="text-xs text-slate-500">{selected.vin}</div>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${scoreBadge(selected.score)}`}>Score {selected.score}</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>State of charge</span>
                      <span className={socColor(selected.soc)}>{selected.soc}% → {selected.targetSoc}%</span>
                    </div>
                    <Progress value={selected.soc} className="h-2" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <Field label="Lot location" value={`Grid ${selected.lot}`} />
                    <Field label="Days on lot" value={`${selected.daysOnLot} days`} />
                    <Field label="Auction in" value={`${selected.auctionInHours}h`} />
                    <Field label="Transport deadline" value={`${selected.transportInHours}h`} />
                    <Field label="Est. value" value={`$${selected.estValue.toLocaleString()}`} />
                    <Field label="Battery health" value={selected.batteryHealth === "complete" ? "Complete" : "Missing"} />
                    <Field label="Service status" value={selected.serviceStatus.replace("_", " ")} />
                    <Field label="Transport ready" value={selected.transportReady ? "Yes" : "No"} />
                  </div>

                  <Separator />

                  <div>
                    <div className="text-xs font-medium text-slate-700">Reason tags</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.reasons.length === 0 && <span className="text-xs text-slate-400">No active triggers</span>}
                      {selected.reasons.map((r) => (
                        <Badge key={r} variant="outline" className="text-[11px] font-normal text-slate-600">{r}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Dispatch recommendation */}
            {selected && (
              <Card className="overflow-hidden p-0">
                <div className="bg-gradient-to-br from-indigo-600 to-sky-600 px-5 py-4 text-white">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
                    <Zap className="h-3.5 w-3.5" /> Dispatch Recommendation
                  </div>
                  <div className="mt-1 text-base font-semibold leading-snug">{selected.recommended}</div>
                  <div className="mt-1 text-xs opacity-80">Based on SoC, auction window, transport SLA, BH report, and value.</div>
                </div>
                <div className="flex flex-col gap-2 p-4 sm:flex-row">
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={selected.serviceStatus === "completed"}
                    onClick={() => dispatchUnit(selected.id)}
                  >
                    <Truck className="mr-2 h-4 w-4" /> Dispatch Mobile Unit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={selected.serviceStatus === "completed"}
                    onClick={() => completeService(selected.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Service
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Timeline + ESG */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-indigo-600" />
              <div className="text-sm font-semibold text-slate-900">While It Plugs In</div>
              <Badge variant="outline" className="ml-2 text-[11px]">Per-vehicle workflow</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              <TimelineStep t="Min 0" title="Mobile unit arrives" desc="Tech reaches the EV at Grid location." />
              <TimelineStep t="Min 1–5" title="Battery health workflow" desc="Diagnostic runs; report attached to VIN." />
              <TimelineStep t="Min 5–25" title="Charge to target SoC" desc="DC fast charge to listed auction target." />
              <TimelineStep t="Min 26" title="ESG + ops log" desc="kWh, CO₂, dwell time recorded automatically." />
              <TimelineStep t="Next" title="Dispatch next EV" desc="System routes unit to highest-priority vehicle." last />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <div className="text-sm font-semibold text-slate-900">ESG & Operations</div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <EsgRow label="kWh delivered today" value="1,284 kWh" />
              <EsgRow label="CO₂ offset vs. tow-to-charger" value="412 kg" />
              <EsgRow label="Avg dwell reduction" value="−2.3 days" />
              <EsgRow label="Mobile unit utilization" value="78%" />
              <EsgRow label="On-time auction readiness" value="96.4%" />
              <EsgRow label="Battery reports attached" value={`${metrics.completed + scored.filter(v=>v.batteryHealth==='complete').length}/${scored.length}`} />
            </div>
          </Card>
        </div>

        <footer className="mt-8 pb-8 text-center text-xs text-slate-400">
          ChargeRunner · prototype · mock data · Cox Automotive / Manheim concept
        </footer>
      </main>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: "red"|"amber"|"emerald"|"sky"|"violet"|"slate" }) {
  const tones: Record<string, string> = {
    red: "bg-red-50 text-red-700 ring-red-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ${tones[tone]}`}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 font-medium text-slate-800">{value}</div>
    </div>
  );
}

function TimelineStep({ t, title, desc, last }: { t: string; title: string; desc: string; last?: boolean }) {
  return (
    <div className="relative rounded-lg border bg-slate-50/50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">{t}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{title}</div>
      <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
      {!last && <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 md:block" />}
    </div>
  );
}

function EsgRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed pb-2 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
