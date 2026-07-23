import React, { useState, useEffect } from "react";
import {
  Wind,
  Home,
  Activity,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  MapPin,
} from "lucide-react";

export default function HealthTips({ selectedRegion }) {
  const [tipsData, setTipsData] = useState({ status: "Loading...", tips: [] });
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const regionToFetch =
      !selectedRegion || selectedRegion === "All" ? "Ikeja" : selectedRegion;
    fetch(`${import.meta.env.VITE_API_URL || \http://localhost:8000\}/api/health-tips/${regionToFetch}`)
      .then((res) => res.json())
      .then((data) => setTipsData(data))
      .catch((err) => console.error("Error fetching tips:", err));
  }, [selectedRegion]);

  const getStatusColor = () => {
    if (tipsData.status === "Severe") return "rose";
    if (tipsData.status === "High") return "amber";
    if (tipsData.status === "Moderate") return "emerald";
    return "slate";
  };

  const c = getStatusColor();

  return (
    <div>
      <div className="w-full max-w-5xl mx-auto space-y-6 my-8 pointer-events-auto px-6">
        {/* Top Banner: Health Alert - Glassy Restored */}
        <div
          className={`relative p-6 sm:p-8 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
        >
          <div className="space-y-3 max-w-2xl">
            {/* Status Badges */}
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-${c}-500/20 text-${c}-300 border border-${c}-500/30 shadow-md`}
              >
                <span className={`w-2 h-2 rounded-full bg-${c}-400`}></span>
                {tipsData.status} Risk
              </span>
              <span className="text-xs font-semibold text-slate-300 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> ML Forecast
                Active
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              AI Health Directives
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              These preventative health interventions are dynamically generated
              by our machine learning model based on forecasted next-day air
              emissions. Act early to protect your community.
            </p>
          </div>

          {/* Right Gauge Badge */}
          <div className="flex-shrink-0 self-center md:self-auto">
            <div
              className={`relative w-32 h-32 rounded-full border-[6px] border-${c}-400/60 bg-slate-950/50 flex flex-col items-center justify-center shadow-lg shadow-${c}-500/20 backdrop-blur-md`}
            >
              <span
                className={`text-xl font-bold text-${c}-300 tracking-tight drop-shadow-md`}
              >
                {tipsData.status}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest text-${c}-200 mt-1`}
              >
                Forecast
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex flex-col items-center justify-center gap-2 mb-4 mt-6 pointer-events-auto w-fit mx-auto">
          <label
            htmlFor="tips-filter"
            className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center"
          >
            AI recommendation for agents of change
          </label>
          <select
            id="tips-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`w-fit px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900/60 text-white border transition-all cursor-pointer outline-none ${
              filterType === "All"
                ? "border-white/20"
                : `border-${c}-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]`
            }`}
          >
            <option value="All">Select Recommendation (All)</option>
            <option value="Policy">Government (Policy)</option>
            <option value="Individual">Individual Citizens</option>
            <option value="Medical">Medical Doctors</option>
            <option value="Event Planners">Event Planners</option>
            <option value="News">News Forecasters</option>
            <option value="International">International Bodies</option>
          </select>
        </div>
      </div>
      {/* Bottom Grid: Action Cards - Glassy Restored */}
      {(() => {
        const filteredTips = tipsData.tips.filter(
          (item) => filterType === "All" || item.type === filterType,
        );
        const gridCols =
          filteredTips.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2";

        return (
          <div
            className={`p-4 sm:p-6 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl grid grid-cols-1 ${gridCols} gap-8 w-fit mx-auto`}
          >
            {tipsData.tips.length === 0 ? (
              <p className="text-white w-full text-center">
                Analyzing multi-pollutant forecast data...
              </p>
            ) : filteredTips.length === 0 ? (
              <p className="text-white w-full text-center">
                No {filterType.toLowerCase()} tips available for this forecast.
              </p>
            ) : (
              filteredTips.map((item, idx) => {
                const isPolicy = item.type === "Policy";
                const isMedical = item.type === "Medical";
                const isEvent = item.type === "Event Planners";
                const isNews = item.type === "News";
                const isIntl = item.type === "International";

                let cardBg = "bg-white/5 border-white/5 hover:bg-white/10";
                let badgeStyle = "bg-slate-800 text-slate-300 border-white/10";

                if (isPolicy) {
                  cardBg =
                    "bg-amber-900/20 border-amber-500/20 hover:bg-amber-900/30";
                  badgeStyle =
                    "bg-amber-500/20 text-amber-300 border-amber-500/40";
                } else if (isMedical) {
                  cardBg =
                    "bg-rose-900/20 border-rose-500/20 hover:bg-rose-900/30";
                  badgeStyle =
                    "bg-rose-500/20 text-rose-300 border-rose-500/40";
                } else if (isEvent) {
                  cardBg =
                    "bg-emerald-900/20 border-emerald-500/20 hover:bg-emerald-900/30";
                  badgeStyle =
                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                } else if (isNews) {
                  cardBg =
                    "bg-blue-900/20 border-blue-500/20 hover:bg-blue-900/30";
                  badgeStyle =
                    "bg-blue-500/20 text-blue-300 border-blue-500/40";
                } else if (isIntl) {
                  cardBg =
                    "bg-purple-900/20 border-purple-500/20 hover:bg-purple-900/30";
                  badgeStyle =
                    "bg-purple-500/20 text-purple-300 border-purple-500/40";
                }

                return (
                  <div
                    key={idx}
                    className={`w-full max-w-sm space-y-3 group ${cardBg} p-4 rounded-2xl border transition-all shadow-inner`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Circular Icon */}
                      <div
                        className={`w-10 h-10 rounded-full bg-${c}-900/40 border border-${c}-500/40 flex items-center justify-center text-${c}-300 group-hover:scale-110 transition-transform shadow-md`}
                      >
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      {/* Badge */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${badgeStyle}`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3
                        className={`text-sm font-bold text-white group-hover:text-${c}-300 transition-colors drop-shadow-sm`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })()}
    </div>
  );
}
