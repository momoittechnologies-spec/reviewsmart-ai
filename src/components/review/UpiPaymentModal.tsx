"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  CreditCard,
  IndianRupee,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { buildUpiLinks } from "@/lib/upi-engine";
import { copyToClipboard } from "@/lib/clipboard";

export default function UpiPaymentModal({
  businessName,
  category,
  customUpi,
  payeeOwnerName,
  cleanMobile,
  onClose,
}: {
  businessName: string;
  category?: string | null;
  customUpi: string;
  payeeOwnerName: string;
  cleanMobile: string;
  onClose: () => void;
}) {
  const [upiQrDataUrl, setUpiQrDataUrl] = useState("");
  const [upiCopied, setUpiCopied] = useState(false);
  const [mobileCopied, setMobileCopied] = useState(false);

  const upiBundle = useMemo(
    () =>
      buildUpiLinks({
        upiId: customUpi,
        payeeName: businessName,
        category,
      }),
    [customUpi, businessName, category]
  );

  useEffect(() => {
    if (!upiBundle?.qrPayload) return;
    QRCode.toDataURL(upiBundle.qrPayload, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M",
      color: { dark: "#020617", light: "#ffffff" },
    })
      .then(setUpiQrDataUrl)
      .catch(() => {});
  }, [upiBundle?.qrPayload]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`UPI payment for ${businessName}`}
    >
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          aria-label="Close Payment Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{businessName}</h3>
          {payeeOwnerName && (
            <p className="text-xs text-slate-300">
              Payee: <span className="text-white font-semibold">{payeeOwnerName}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-left">
          <a
            href={upiBundle.phonepeUrl}
            className="py-3 px-2 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-500/60 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-300" />
            <span>PhonePe</span>
          </a>
          <a
            href={upiBundle.gpayUrl}
            className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-blue-500/60 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Pay</span>
          </a>
          <a
            href={upiBundle.paytmUrl}
            className="py-3 px-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paytm</span>
          </a>
          <a
            href={upiBundle.standardUrl}
            className="py-3 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>All UPI Apps</span>
          </a>
        </div>

        <div className="space-y-2 text-left">
          {cleanMobile && (
            <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Mobile Number</span>
                <span className="text-xs font-mono font-bold text-white">{cleanMobile}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(cleanMobile);
                  setMobileCopied(true);
                  setTimeout(() => setMobileCopied(false), 2000);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1 shrink-0"
              >
                {mobileCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{mobileCopied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}

          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">UPI ID</span>
              <span className="text-xs font-mono font-bold text-emerald-400 truncate block">{customUpi}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                copyToClipboard(customUpi);
                setUpiCopied(true);
                setTimeout(() => setUpiCopied(false), 2000);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1 shrink-0"
            >
              {upiCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{upiCopied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Direct merchant payment (0% fee)</span>
          </div>
          <p className="text-slate-300">
            Scan the QR below or tap an app button to pay {businessName} directly.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl">
          {upiQrDataUrl ? (
            <img src={upiQrDataUrl} alt={`UPI QR code for ${businessName}`} className="w-44 h-44 object-contain" />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-slate-500 text-xs">
              Preparing QR...
            </div>
          )}
          <span className="text-[11px] font-mono font-bold text-slate-800 mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            PhonePe · GPay · Paytm
          </span>
        </div>
      </div>
    </div>
  );
}
