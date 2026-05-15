import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

export default function DashboardCharts({ type, data, colors, palette }) {
  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="g-users" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.users} stopOpacity={0.32} />
              <stop offset="100%" stopColor={colors.users} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="g-newsletter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.newsletter} stopOpacity={0.32} />
              <stop offset="100%" stopColor={colors.newsletter} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
            }}
            interval="preserveStartEnd"
            minTickGap={32}
            stroke="#cbd5e1"
          />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" width={36} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
            labelFormatter={(v) => new Date(v).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            formatter={(v) => (v === "users" ? "Comunidade" : v === "newsletter" ? "Newsletter" : v)}
          />
          <Area type="monotone" dataKey="users" stroke={colors.users} strokeWidth={2} fill="url(#g-users)" />
          <Area type="monotone" dataKey="newsletter" stroke={colors.newsletter} strokeWidth={2} fill="url(#g-newsletter)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "donut") {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={2}
                strokeWidth={1}
                stroke="#fff"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(v, _, p) => [`${v} (${Math.round((v / total) * 100)}%)`, p.payload.name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 12.5, flex: 1, minWidth: 0 }}>
          {data.map((d, i) => {
            const pct = total ? Math.round((d.value / total) * 100) : 0;
            return (
              <li key={d.name + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0", color: "#475569" }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: palette[i % palette.length], flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.name}
                </span>
                <span style={{ color: "#94a3b8", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {d.value} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return null;
}
