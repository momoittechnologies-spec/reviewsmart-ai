"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Building,
  HelpCircle,
  Loader2,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CategoryStat {
  name: string;
  avgOrderValue: number;
  dailyFootfall: number;
}

const CATEGORY_STATS: Record<string, CategoryStat> = {
  restaurant: { name: "Restaurant & Cloud Kitchen", avgOrderValue: 450, dailyFootfall: 60 },
  clinic: { name: "Doctor & Dental Clinic", avgOrderValue: 1200, dailyFootfall: 25 },
  boutique: { name: "Boutique & Clothing Store", avgOrderValue: 1800, dailyFootfall: 20 },
  salon: { name: "Salon, Beauty & Spa", avgOrderValue: 750, dailyFootfall: 30 },
  repair: { name: "Appliance & AC Repair", avgOrderValue: 950, dailyFootfall: 15 },
  jewellery: { name: "Gold & Jewellery Store", avgOrderValue: 8500, dailyFootfall: 10 },
};

export default function ReviewGapCalculator() {
  const [selectedCat, setSelectedCat] = useState("restaurant");
  const [currentRating, setCurrentRating] = useState(4.1);
  const [currentReviews, setCurrentReviews] = useState(35);
  const [competitorReviews, setCompetitorReviews] = useState(140);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const catData = CATEGORY_STATS[selectedCat] || CATEGORY_STATS.restaurant;

  // Real formula: Reviews needed to match competitor + reach 4.8★
  const reviewGap = Math.max(15, competitorReviews - currentReviews + 10);
  const reviewsPerDayWithNfc = Math.max(3, Math.round(catData.dailyFootfall * 0.12));
  const daysToBeatCompetitor = Math.max(7, Math.ceil(reviewGap / reviewsPerDayWithNfc));
  const estimatedNewCustomersMonthly = Math.round(reviewGap * 1.8);
  const estimatedMonthlyRevenueGain = estimatedNewCustomersMonthly * catData.avgOrderValue;

  const handleGetReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      alert("Please enter a valid 10-digit WhatsApp phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: `${catData.name} Lead`,
          category: catData.name,
          phone,
          source: "GAP_CALCULATOR",
          notes: `Current: ${currentRating}★ (${currentReviews} revs) vs Comp: ${competitorReviews} revs. Gap: ${reviewGap} reviews in ${daysToBeatCompetitor} days.`,
        }),
      });

      setSubmitted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      const whatsappMsg = encodeURIComponent(
        `Hi ReviewSmart AI! I used your Review Gap Calculator for my *${catData.name}*. I currently have ${currentReviews} reviews (${currentRating}★) and my competitor has ${competitorReviews}. Please send me the custom ${daysToBeatCompetitor}-day action plan to reach #1 on Google Maps.`
      );

      setTimeout(() => {
        window.open(`https://wa.me/918639831132?text=${whatsappMsg}`, "_blank");
      }, 1200);
    } catch (err) {
      console.error(err);
      window.open(`https://wa.me/918639831132`, "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="ranking-calculator" className="py-16 sm:py-24 relative overflow-hidden bg-slate-50/70 border-t border-slate-200/80">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-sm">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>AI GOOGLE MAPS RANKING AUDIT</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Calculate How Many Reviews You Need To <br />
            <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
              Overtake Your Top Local Competitor
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Google Maps ranks businesses with higher review velocity and higher ratings. Adjust the sliders below to see your personalized growth timeline.
          </p>
        </div>

        {/* 2-Column Calculator Box */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* LEFT: Interactive Controls & Sliders */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Select Your Business Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(CATEGORY_STATS).map((key) => {
                    const item = CATEGORY_STATS[key];
                    const isSelected = selectedCat === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCat(key)}
                        className={`p-2.5 rounded-xl text-[11px] font-bold text-left transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-600"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {item.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider 1: Your Current Reviews */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Your Current Reviews on Google:</span>
                  <span className="text-amber-600 text-sm font-black">{currentReviews} Reviews</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={300}
                  step={5}
                  value={currentReviews}
                  onChange={(e) => setCurrentReviews(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>5 Reviews</span>
                  <span>150 Reviews</span>
                  <span>300+ Reviews</span>
                </div>
              </div>

              {/* Slider 2: Top Competitor's Reviews */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Your Top Competitor's Reviews:</span>
                  <span className="text-rose-600 text-sm font-black">{competitorReviews} Reviews</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={500}
                  step={10}
                  value={competitorReviews}
                  onChange={(e) => setCompetitorReviews(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>30 Reviews</span>
                  <span>250 Reviews</span>
                  <span>500+ Reviews</span>
                </div>
              </div>

              {/* Slider 3: Current Rating */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Your Current Google Rating:</span>
                  <span className="text-amber-500 text-sm font-black flex items-center gap-1">
                    <span>{currentRating.toFixed(1)}</span>
                    <span>★</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={3.0}
                  max={4.9}
                  step={0.1}
                  value={currentRating}
                  onChange={(e) => setCurrentRating(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>3.0 ★</span>
                  <span>4.0 ★</span>
                  <span>4.9 ★</span>
                </div>
              </div>
            </div>

            {/* RIGHT: AI Growth Projection & Lead Form */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-indigo-50/50 via-white to-purple-50/30 border-2 border-indigo-200/80 p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Growth Projection</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Target: 4.8★
                </span>
              </div>

              {/* 3 Metric Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs border border-amber-200">
                      ★
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">5-Star Reviews Needed</p>
                      <p className="text-[10px] text-slate-500">To match &amp; surpass competitor</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-600">+{reviewGap}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-200">
                      ⚡
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Time to Overtake</p>
                      <p className="text-[10px] text-slate-500">With 1 ReviewSmart Standee</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-600">{daysToBeatCompetitor} Days</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-200">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Est. Monthly Revenue Gain</p>
                      <p className="text-[10px] text-slate-500">From Google Map 3-Pack SEO</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-indigo-600">
                    +₹{estimatedMonthlyRevenueGain.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Direct Lead Capture to get custom 14-day growth roadmap */}
              {!submitted ? (
                <form onSubmit={handleGetReport} className="pt-2 space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Send full 14-day SEO growth roadmap to WhatsApp:
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter WhatsApp Number"
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2.5 rounded-r-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/20 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-emerald-300" />
                    )}
                    <span>Get Free 14-Day Roadmap on WhatsApp &rarr;</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Roadmap Dispatched!
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    Redirecting to WhatsApp to chat with your dedicated growth consultant...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
