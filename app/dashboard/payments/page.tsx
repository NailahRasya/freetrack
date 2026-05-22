"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Wallet, CheckCircle, AlertCircle, ArrowLeft, Clock, Shield, ShieldCheck, Lock, Loader2, QrCode, Landmark, Check, Copy, X, ArrowUpRight, TrendingUp, HelpCircle, Receipt } from "lucide-react";
import Swal from "sweetalert2";
import { useUser } from "../layout";
import { formatRupiah } from "@/utils/format";

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, user } = useUser();
  
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Freelancer Wallet States
  const [allMilestones, setAllMilestones] = useState<any[]>([]);
  const [sessionWithdrawn, setSessionWithdrawn] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawBank, setWithdrawBank] = useState<"BCA" | "Mandiri" | "GoPay" | "OVO">("BCA");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawLoaderStatus, setWithdrawLoaderStatus] = useState("Menghubungkan ke Bank Gateway...");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  
  // New step-by-step PIN states for fintech best practices
  const [withdrawStep, setWithdrawStep] = useState<"input" | "review" | "pin">("input");
  const [withdrawPin, setWithdrawPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Notification payout animation states
  const [showApprovedPulse, setShowApprovedPulse] = useState(false);
  const [pulseAmount, setPulseAmount] = useState<number>(0);

  // Persistent withdrawals tracker
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [selectedWithdrawalReceipt, setSelectedWithdrawalReceipt] = useState<any | null>(null);

  // Custom Payment Modal states
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "qris" | "card" | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [paymentLoaderStatus, setPaymentLoaderStatus] = useState("Memproses Pembayaran...");

  // Load persistent withdrawals from localStorage based on authenticated user ID
  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      const withdrawalsKey = `freetrack_withdrawals_${user.id}`;
      const storedWithdrawals = localStorage.getItem(withdrawalsKey);
      if (storedWithdrawals) {
        try {
          const parsed = JSON.parse(storedWithdrawals);
          setWithdrawals(parsed);
          
          // Calculate total withdrawn
          const total = parsed.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);
          setSessionWithdrawn(total);
        } catch (e) {
          console.error("Failed to parse withdrawals from localStorage:", e);
        }
      } else {
        setWithdrawals([]);
        setSessionWithdrawn(0);
      }
    }
  }, [user?.id]);

  // Pre-fill destination bank account based on selected bank option (FinTech best practice)
  useEffect(() => {
    if (showWithdrawModal) {
      if (withdrawBank === "BCA") {
        setWithdrawAccount("884901283912");
      } else if (withdrawBank === "Mandiri") {
        setWithdrawAccount("1370092813912");
      } else if (withdrawBank === "GoPay") {
        setWithdrawAccount("081234567890");
      } else if (withdrawBank === "OVO") {
        setWithdrawAccount("089876543210");
      }
    }
  }, [withdrawBank, showWithdrawModal]);

  useEffect(() => {
    fetchPendingMilestones();
  }, []);

  // Listen to approved milestone payout redirect parameters
  useEffect(() => {
    if (!loading && searchParams) {
      const isApprovedNotif = searchParams.get("approved_notification") === "true";
      if (isApprovedNotif) {
        const amountStr = searchParams.get("amount") || "0";
        const titleStr = searchParams.get("title") || "Milestone";
        const amt = Number(amountStr);

        // Switch to history tab to show the payouts immediately
        setActiveTab("history");

        // Trigger visual pulsing highlight on the balance card
        setShowApprovedPulse(true);
        setPulseAmount(amt);

        // Success Alert celebrating payout
        Swal.fire({
          title: "🎉 Dana Escrow Cair!",
          html: `
            <div style="text-align: center; padding: 8px 12px; font-family: inherit;">
              <div style="font-size: 56px; margin-bottom: 18px; animation: bounce 1.2s infinite;">🚀</div>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 18px;">
                Selamat! Milestone <strong style="color: #fff;">"${decodeURIComponent(titleStr)}"</strong> telah disetujui oleh klien.
              </p>
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 14px; margin-bottom: 18px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.02);">
                <span style="display: block; font-size: 11px; color: rgba(226,232,240,0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px;">Dana Dicairkan:</span>
                <span style="font-size: 22px; font-weight: 900; color: #00FFA3; text-shadow: 0 0 10px rgba(0, 255, 163, 0.25);">
                  + ${formatCurrency(amt)}
                </span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
                Dana tersebut telah ditambahkan secara instan ke <strong>Saldo Aktif FreeTrack</strong> Anda dan siap untuk ditarik ke rekening bank Anda.
              </p>
            </div>
          `,
          background: "#0F1B2E",
          color: "#fff",
          confirmButtonText: "Lihat Dompet Saya",
          confirmButtonColor: "#10b981",
          customClass: {
            popup: "rounded-2xl border border-white/10 shadow-2xl"
          }
        });

        // Clean query parameters from URL safely without causing React state reload
        if (typeof window !== "undefined") {
          const newUrl = window.location.pathname;
          window.history.replaceState(null, '', newUrl);
        }

        // Set visual pulsing animation timeout
        const timer = setTimeout(() => {
          setShowApprovedPulse(false);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, searchParams]);

  const fetchPendingMilestones = async () => {
    try {
      const res = await fetch("/api/milestones");
      const data = await res.json();
      const list = data.data || [];
      setAllMilestones(list);
      
      // Filter milestone yang statusnya "Menunggu DP"
      const pending = list.filter(
        (m: any) => m.status === "Menunggu DP"
      );
      
      setMilestones(pending);
    } catch (err) {
      console.error("Failed to fetch milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayDP = (milestone: any) => {
    setSelectedMilestone(milestone);
    setPaymentMethod(null);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setIsCopied(false);
  };

  const processPayment = async () => {
    if (!selectedMilestone || !paymentMethod) return;

    setIsPaying(true);
    setPaymentLoaderStatus("Memproses Pembayaran...");

    try {
      // 1. Simulates realistic payment loading steps
      await new Promise(resolve => setTimeout(resolve, 800));
      setPaymentLoaderStatus("Memverifikasi Escrow...");
      await new Promise(resolve => setTimeout(resolve, 800));
      setPaymentLoaderStatus("Menyinkronkan Auto-Invoice...");
      await new Promise(resolve => setTimeout(resolve, 600));

      // Determine textual method for invoices
      let methodText = "Bank Transfer";
      if (paymentMethod === "qris") {
        methodText = "E-Wallet (QRIS)";
      } else if (paymentMethod === "card") {
        methodText = "Kartu Kredit";
      }

      // 2. Update milestone status to "In Progress" & payment_status to "Escrowed"
      const milestoneRes = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMilestone.id,
          status: "In Progress",
          payment_status: "Escrowed",
        }),
      });

      if (!milestoneRes.ok) {
        const data = await milestoneRes.ok;
        throw new Error("Failed to process milestone payment update");
      }

      // 3. Create the auto-invoice immediately
      const invoiceRes = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_id: selectedMilestone.id,
          payment_method: methodText,
        }),
      });

      if (!invoiceRes.ok) {
        console.error("Auto-invoice creation failed");
      }

      // 4. Success alert
      await Swal.fire({
        icon: "success",
        title: "Pembayaran Berhasil!",
        html: `
          <div style="text-align: center; padding: 20px;">
            <p style="margin-bottom: 12px; color: #10b981; font-size: 16px; font-weight: 600;">
              ✅ DP sebesar Rp ${selectedMilestone.amount?.toLocaleString("id-ID") || "0"} telah disimpan di escrow
            </p>
            <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 8px;">
              Metode Pembayaran: <strong>${methodText}</strong>
            </p>
            <p style="color: #94a3b8; font-size: 13px;">
              Freelancer sekarang dapat mulai mengerjakan milestone ini. Invoice Anda telah berhasil digenerate di menu Invoice.
            </p>
          </div>
        `,
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: "Selesai",
        confirmButtonColor: "#10b981",
      });

      // Close modal & refresh
      setSelectedMilestone(null);
      fetchPendingMilestones();

    } catch (err: any) {
      console.error("Payment error:", err);
      let errorMessage = err.message || "Terjadi kesalahan saat memproses pembayaran";
      
      Swal.fire({
        icon: "error",
        title: "Pembayaran Gagal",
        text: errorMessage,
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatInputRupiah = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID").format(Number(clean));
  };

    // 1. Calculate dynamic balances
    const approvedMilestones = allMilestones.filter(
      (m: any) => m.status === "Approved" || m.status === "Completed"
    );
    const approvedAmount = approvedMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    
    // Base balance starts at 0 (real data only)
    const baseBalance = 0;
    const activeBalance = baseBalance + approvedAmount - sessionWithdrawn;

    // Combine approved milestones (incoming) and withdrawals (outgoing)
    const historyItems = [
      ...approvedMilestones.map((m: any) => ({
        id: m.id,
        title: m.title,
        amount: m.amount || 0,
        created_at: m.updated_at || m.created_at || new Date().toISOString(),
        type: "payout",
        milestone: m
      })),
      ...withdrawals.map((w: any) => ({
        id: w.id,
        title: w.title,
        amount: w.amount,
        created_at: w.created_at,
        type: "withdrawal",
        withdrawal: w
      }))
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Escrow amount
    const escrowedMilestones = allMilestones.filter(
      (m: any) => m.status === "In Progress" || m.status === "Waiting for Approval" || m.status === "Menunggu Persetujuan"
    );
    const escrowAmount = escrowedMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);

    // Filter milestones for active list tab
    const activeMilestones = allMilestones.filter(
      (m: any) => m.status === "Menunggu DP" || m.status === "In Progress" || m.status === "Waiting for Approval" || m.status === "Menunggu Persetujuan"
    );

    // Mock Withdrawal Handler
    const handleConfirmWithdraw = async () => {
      const amt = Number(withdrawAmount.replace(/\D/g, ""));
      if (!withdrawAccount || !withdrawAmount || isNaN(amt) || amt <= 0) {
        Swal.fire({
          icon: "error",
          title: "Input Tidak Valid",
          text: "Silakan isi nomor rekening dan jumlah penarikan dengan benar.",
          background: "rgba(13, 27, 62, 0.95)",
          color: "#fff",
          confirmButtonColor: "var(--cyan)",
        });
        return;
      }

      if (amt > activeBalance) {
        Swal.fire({
          icon: "error",
          title: "Saldo Tidak Mencukupi",
          text: `Saldo aktif Anda tidak mencukupi untuk melakukan penarikan sebesar ${formatCurrency(amt)}.`,
          background: "rgba(13, 27, 62, 0.95)",
          color: "#fff",
          confirmButtonColor: "var(--cyan)",
        });
        return;
      }

      setIsWithdrawing(true);
      setWithdrawLoaderStatus("Menghubungkan ke Bank Gateway...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setWithdrawLoaderStatus("Memverifikasi Keamanan PIN...");
      await new Promise((resolve) => setTimeout(resolve, 700));
      setWithdrawLoaderStatus(`Mentransfer dana ke rekening ${withdrawBank}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWithdrawLoaderStatus("Menyinkronkan transaksi FreeTrack...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Add a persistent withdrawal transaction
      const newWithdrawal = {
        id: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
        title: `Penarikan Dana ke ${withdrawBank}`,
        amount: amt,
        bank: withdrawBank,
        account: withdrawAccount,
        created_at: new Date().toISOString(),
        status: "Success",
        type: "withdrawal"
      };

      const updatedWithdrawals = [newWithdrawal, ...withdrawals];
      setWithdrawals(updatedWithdrawals);
      
      const newTotalWithdrawn = sessionWithdrawn + amt;
      setSessionWithdrawn(newTotalWithdrawn);

      if (typeof window !== "undefined" && user?.id) {
        localStorage.setItem(`freetrack_withdrawals_${user.id}`, JSON.stringify(updatedWithdrawals));
      }

      setIsWithdrawing(false);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
      setWithdrawPin("");
      setWithdrawStep("input");

      Swal.fire({
        icon: "success",
        title: "Penarikan Berhasil!",
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="color: #10b981; font-weight: 700; font-size: 16px; margin-bottom: 12px;">
              ✅ Dana sebesar ${formatCurrency(amt)} telah dikirim!
            </p>
            <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
              Tujuan: <strong>${withdrawBank} (${withdrawAccount})</strong><br/>
              Status: <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">BERHASIL</span>
            </p>
          </div>
        `,
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        confirmButtonText: "Selesai",
        confirmButtonColor: "#10b981",
      });
    };

    // Helper functions for PIN step
    const handlePinClick = (digit: string) => {
      setPinError(null);
      setWithdrawPin((prev) => {
        if (prev.length < 6) {
          const nextPin = prev + digit;
          if (nextPin.length === 6) {
            // Auto-trigger verify inside a small delay for typing visual feedback
            setTimeout(() => {
              if (nextPin === "123456") {
                handleConfirmWithdraw();
              } else {
                setPinError("PIN Transaksi Salah! Silakan coba lagi.");
                setWithdrawPin("");
              }
            }, 300);
          }
          return nextPin;
        }
        return prev;
      });
    };

    const handlePinBackspace = () => {
      setPinError(null);
      setWithdrawPin((prev) => prev.slice(0, -1));
    };

    const handlePinCancel = () => {
      setWithdrawStep("review");
      setWithdrawPin("");
      setPinError(null);
    };

    // Handle physical keyboard input for the PIN screen
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!showWithdrawModal || withdrawStep !== "pin" || isWithdrawing) return;
        
        if (e.key >= "0" && e.key <= "9") {
          handlePinClick(e.key);
        } else if (e.key === "Backspace") {
          handlePinBackspace();
        } else if (e.key === "Escape") {
          handlePinCancel();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showWithdrawModal, withdrawStep, isWithdrawing]);
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <div style={{ width: "24px", height: "24px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid var(--primary-light)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading payments...</span>
      </div>
    );
  }

  // ── Freelancer: Read-only view (status pembayaran saja, tanpa tombol bayar) ──
  if (role === "freelancer") {

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 16px", borderRadius: "10px",
              color: "rgba(226,232,240,0.6)", fontSize: "14px", fontWeight: "600",
              cursor: "pointer", marginBottom: "20px", transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(226,232,240,0.6)"; }}
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={18} style={{ color: "#10b981" }} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
              Dompet & Keuangan Freelancer
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", paddingLeft: "46px" }}>
            Kelola pendapatan Anda, pantau dana di escrow, dan tarik hasil pencairan milestone Anda.
          </p>
        </motion.div>

        {/* ── SECTION 1: GLOWING WALLET CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {/* Card 1: Active Wallet Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: showApprovedPulse 
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(0, 255, 163, 0.12) 100%)"
                : "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)",
              border: showApprovedPulse 
                ? "2px solid #00FFA3" 
                : "1px solid rgba(16, 185, 129, 0.25)",
              boxShadow: showApprovedPulse
                ? "0 0 35px rgba(0, 255, 163, 0.35), inset 0 1px 1px rgba(255,255,255,0.1)"
                : "0 8px 32px rgba(16, 185, 129, 0.08), inset 0 1px 1px rgba(255,255,255,0.05)",
              borderRadius: "24px",
              padding: "26px 28px",
              position: "relative",
              overflow: "hidden",
              animation: showApprovedPulse ? "pulseGlow 1.5s infinite" : "none",
              transition: "all 0.5s ease",
            }}
          >
            {/* Glowing background circles */}
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: showApprovedPulse ? "rgba(0, 255, 163, 0.25)" : "rgba(16, 185, 129, 0.2)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", background: "rgba(6, 182, 212, 0.15)", filter: "blur(50px)", pointerEvents: "none" }} />

            {/* Content layout */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: showApprovedPulse ? "#00FFA3" : "rgba(226,232,240,0.5)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px", transition: "color 0.5s" }}>
                  Saldo Aktif FreeTrack
                </span>
                <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                  {formatCurrency(activeBalance)}
                  {showApprovedPulse && (
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "900",
                      color: "#00FFA3",
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(0, 255, 163, 0.3)",
                      padding: "2px 8px",
                      borderRadius: "8px",
                      animation: "floatUp 5s forwards",
                      boxShadow: "0 0 10px rgba(0, 255, 163, 0.2)",
                    }}>
                      + {formatCurrency(pulseAmount)}
                    </span>
                  )}
                </h3>
              </div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                <Wallet size={20} />
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", marginBottom: "24px", lineHeight: "1.4" }}>
              Semua dana dari milestone yang disetujui otomatis masuk ke sini dan siap ditarik ke rekening lokal Anda.
            </p>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() => {
                  setWithdrawStep("input");
                  setWithdrawPin("");
                  setPinError(null);
                  setShowWithdrawModal(true);
                }}
                disabled={activeBalance <= 0}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: activeBalance <= 0 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  borderRadius: "12px",
                  color: activeBalance <= 0 ? "rgba(226,232,240,0.3)" : "#fff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: activeBalance <= 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: activeBalance <= 0 ? "none" : "0 4px 15px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  if (activeBalance > 0) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.3)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = activeBalance <= 0 ? "none" : "0 4px 15px rgba(16, 185, 129, 0.2)";
                }}
              >
                <ArrowUpRight size={16} /> Tarik Dana
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Informasi Akun Rekening",
                    html: `
                      <div style="text-align: left; padding: 8px 12px; color: #cbd5e1; font-size: 14px; line-height: 1.8;">
                        <p style="margin-bottom: 8px;"><strong>Nama Penerima:</strong> Eko Muhammad F (Freelancer)</p>
                        <p style="margin-bottom: 8px;"><strong>Rekening Utama:</strong> BCA · **** 9012</p>
                        <p style="margin-bottom: 8px;"><strong>Status Akun:</strong> <span style="color: #10b981; font-weight: bold;">Verified ✔</span></p>
                        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 12px 0;"/>
                        <span style="font-size: 12px; color: #94a3b8;">Untuk mengubah nomor rekening penarikan utama Anda, silakan masuk ke menu Pengaturan Profil.</span>
                      </div>
                    `,
                    background: "rgba(13, 27, 62, 0.95)",
                    color: "#fff",
                    confirmButtonText: "Mengerti",
                    confirmButtonColor: "var(--cyan)",
                  });
                }}
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "rgba(226,232,240,0.6)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(226,232,240,0.6)"; }}
              >
                Detail Rekening
              </button>
            </div>
          </motion.div>

          {/* Card 2: Escrow Locked Balance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              boxShadow: "0 8px 32px rgba(245, 158, 11, 0.05), inset 0 1px 1px rgba(255,255,255,0.05)",
              borderRadius: "24px",
              padding: "26px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glowing background circles */}
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "rgba(245, 158, 11, 0.15)", filter: "blur(60px)", pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(245, 158, 11, 0.7)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>
                  Dana Escrow Ditahan
                </span>
                <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#f59e0b", letterSpacing: "-0.5px" }}>
                  {formatCurrency(escrowAmount)}
                </h3>
              </div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                <Lock size={20} />
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", marginBottom: "24px", lineHeight: "1.4" }}>
              Dana DP proyek yang telah didepositkan klien ke platform FreeTrack. Aman terlindungi di sistem escrow kami.
            </p>

            <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={14} style={{ color: "#f59e0b", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.5)", fontWeight: "500" }}>
                Otomatis cair ke Saldo Aktif setelah hasil pekerjaan disetujui klien.
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── SECTION 2: FUND LIFECYCLE FLOW ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: "20px 24px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(255,255,255,0.01)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HelpCircle size={15} style={{ color: "var(--cyan)" }} />
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Bagaimana Alur Pencairan Escrow FreeTrack Bekerja?
            </h4>
          </div>
          
          {/* Timeline Nodes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", position: "relative" }}>
            {[
              { step: "1", title: "DP di Escrow", desc: "Klien bayar DP proyek, dana terkunci di escrow aman.", icon: Lock, color: "rgba(245,158,11,0.15)", iconColor: "#f59e0b" },
              { step: "2", title: "Kerjakan Milestone", desc: "Anda bekerja tenang dengan jaminan dana terbayar.", icon: Clock, color: "rgba(6,182,212,0.15)", iconColor: "var(--cyan)" },
              { step: "3", title: "Kirim & Review", desc: "Unggah bukti kerja untuk dicek & disetujui klien.", icon: ShieldCheck, color: "rgba(168,85,247,0.15)", iconColor: "#a855f7" },
              { step: "4", title: "Dana Cair! 🚀", desc: "Persetujuan instan memindahkan dana ke Saldo Aktif Anda.", icon: CheckCircle, color: "rgba(16,185,129,0.15)", iconColor: "#10b981" }
            ].map((node, i) => {
              const NodeIcon = node.icon;
              return (
                <div key={i} style={{ display: "flex", gap: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "14px", borderRadius: "14px", position: "relative" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: node.color, border: `1px solid ${node.iconColor}22`, display: "flex", alignItems: "center", justifyContent: "center", color: node.iconColor, flexShrink: 0 }}>
                    <NodeIcon size={16} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: "800", color: "#fff", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", color: node.iconColor, background: node.color, padding: "1px 5px", borderRadius: "4px" }}>{node.step}</span>
                      {node.title}
                    </h5>
                    <p style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)", lineHeight: "1.4" }}>{node.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── SECTION 3: TABS FOR ACTIVE MILESTONES & HISTORY ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Tabs switch */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1px" }}>
            <button
              onClick={() => setActiveTab("active")}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom: activeTab === "active" ? "2px solid var(--cyan)" : "2px solid transparent",
                color: activeTab === "active" ? "#fff" : "rgba(226,232,240,0.4)",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Milestone Aktif ({activeMilestones.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom: activeTab === "history" ? "2px solid var(--cyan)" : "2px solid transparent",
                color: activeTab === "history" ? "#fff" : "rgba(226,232,240,0.4)",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Riwayat Pencairan ({approvedMilestones.length})
            </button>
          </div>

          {/* TAB 1: ACTIVE MILESTONES */}
          {activeTab === "active" && (
            <>
              {activeMilestones.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center", color: "rgba(226,232,240,0.4)" }}>
                  <CheckCircle size={28} style={{ color: "rgba(226,232,240,0.2)", marginBottom: "12px" }} />
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>Tidak Ada Milestone Aktif</h4>
                  <p style={{ fontSize: "12px" }}>Semua milestone Anda telah selesai dicairkan atau belum dibuat.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
                  {activeMilestones.map((milestone, idx) => {
                    // Determine badge and color based on status
                    let statusLabel = "Dalam Antrean";
                    let statusColor = "#f59e0b";
                    let statusBg = "rgba(245,158,11,0.1)";
                    let statusBorder = "rgba(245,158,11,0.25)";
                    let iconNode = <Clock size={12} />;

                    if (milestone.status === "In Progress" || milestone.status === "Sedang Dikerjakan") {
                      statusLabel = "Sedang Dikerjakan (DP di Escrow)";
                      statusColor = "var(--cyan)";
                      statusBg = "rgba(6,182,212,0.1)";
                      statusBorder = "rgba(6,182,212,0.25)";
                    } else if (milestone.status === "Waiting for Approval" || milestone.status === "Menunggu Persetujuan") {
                      statusLabel = "Menunggu Persetujuan Klien";
                      statusColor = "#a855f7";
                      statusBg = "rgba(168,85,247,0.1)";
                      statusBorder = "rgba(168,85,247,0.25)";
                      iconNode = <ShieldCheck size={12} />;
                    } else if (milestone.status === "Menunggu DP") {
                      statusLabel = "Menunggu DP Pembayaran Klien";
                      statusColor = "#f59e0b";
                      statusBg = "rgba(245,158,11,0.1)";
                      statusBorder = "rgba(245,158,11,0.25)";
                      iconNode = <Lock size={12} />;
                    }

                    return (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card"
                        style={{ padding: "22px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "14px" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", background: statusBg, border: `1px solid ${statusBorder}`, borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: statusColor, textTransform: "uppercase", marginBottom: "8px" }}>
                              {iconNode} {statusLabel}
                            </span>
                            <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>{milestone.title}</h4>
                            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", lineHeight: "1.5" }}>{milestone.description || "Tidak ada deskripsi"}</p>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px" }}>
                          <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)", fontWeight: "600" }}>Nilai Milestone</span>
                          <span style={{ fontSize: "16px", fontWeight: "900", color: "#fff" }}>{formatCurrency(milestone.amount || 0)}</span>
                        </div>

                        {milestone.deadline && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>
                            <Clock size={12} /> Target Deadline: {milestone.deadline}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PAYOUTS HISTORY */}
          {activeTab === "history" && (
            <>
              {historyItems.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center", color: "rgba(226,232,240,0.4)" }}>
                  <AlertCircle size={28} style={{ color: "rgba(226,232,240,0.2)", marginBottom: "12px" }} />
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>Belum Ada Riwayat Keuangan</h4>
                  <p style={{ fontSize: "12px" }}>Riwayat dana milestone yang disetujui dan hasil penarikan dana akan muncul di sini.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {historyItems.map((item: any, idx) => {
                    const isPayout = item.type === "payout";
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => {
                          if (isPayout) {
                            setSelectedReceipt(item.milestone);
                          } else {
                            setSelectedWithdrawalReceipt(item.withdrawal);
                          }
                        }}
                        style={{
                          padding: "16px 20px",
                          background: isPayout ? "rgba(13, 27, 62, 0.4)" : "rgba(239, 68, 68, 0.05)",
                          border: isPayout 
                            ? "1px solid rgba(16, 185, 129, 0.15)" 
                            : "1px solid rgba(239, 68, 68, 0.2)",
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = isPayout ? "rgba(13, 27, 62, 0.7)" : "rgba(239, 68, 68, 0.12)";
                          e.currentTarget.style.border = isPayout 
                            ? "1px solid rgba(16, 185, 129, 0.35)" 
                            : "1px solid rgba(239, 68, 68, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = isPayout ? "rgba(13, 27, 62, 0.4)" : "rgba(239, 68, 68, 0.05)";
                          e.currentTarget.style.border = isPayout 
                            ? "1px solid rgba(16, 185, 129, 0.15)" 
                            : "1px solid rgba(239, 68, 68, 0.2)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{ 
                            width: "38px", height: "38px", borderRadius: "10px", 
                            background: isPayout ? "rgba(16,185,129,0.1)" : "rgba(239, 68, 68, 0.1)", 
                            border: isPayout ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239, 68, 68, 0.2)", 
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            color: isPayout ? "#10b981" : "#EF4444" 
                          }}>
                            {isPayout ? <CheckCircle size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{item.title}</h4>
                            <p style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>
                              {isPayout 
                                ? "Milestone dicairkan dari escrow · Klik untuk detail resi" 
                                : `Berhasil dikirim ke rekening · Klik untuk resi penarikan`
                              }
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontSize: "15px", fontWeight: "900", color: isPayout ? "#10b981" : "#EF4444" }}>
                            {isPayout ? "+" : "-"} {formatCurrency(item.amount)}
                          </span>
                          <ArrowUpRight size={16} style={{ color: "rgba(226,232,240,0.3)" }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 📥 DIALOG Penarikan DANA (WITHDRAW DANA MODAL) ── */}
        <AnimatePresence>
          {showWithdrawModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)",
                padding: "20px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                style={{
                  width: "100%", maxWidth: "460px",
                  background: "rgba(13, 27, 62, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "24px", padding: "28px",
                  position: "relative", backdropFilter: "blur(30px)",
                  boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)", color: "#fff",
                }}
              >
                {/* Loader overlay inside modal */}
                {isWithdrawing && (
                  <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(13, 27, 62, 0.96)", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "20px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(16, 185, 129, 0.1)", borderTop: "3px solid #10b981", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#fff", textAlign: "center" }}>{withdrawLoaderStatus}</div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>Mengamankan transaksi penarikan dana ke rekening Anda.</div>
                  </div>
                )}

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#fff" }}>Tarik Saldo FreeTrack</h3>
                  <button onClick={() => setShowWithdrawModal(false)} style={{ background: "none", border: "none", color: "rgba(226,232,240,0.4)", cursor: "pointer" }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Form Content */}
                {withdrawStep === "input" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Saldo info */}
                    <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", fontWeight: "600" }}>Saldo Tersedia:</span>
                      <span style={{ fontSize: "14px", fontWeight: "900", color: "#10b981" }}>{formatCurrency(activeBalance)}</span>
                    </div>

                    {/* Bank Select */}
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "6px" }}>Pilih Bank / E-Wallet</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                        {["BCA", "Mandiri", "GoPay", "OVO"].map((bankOpt) => (
                          <button
                            key={bankOpt}
                            onClick={() => setWithdrawBank(bankOpt as any)}
                            style={{
                              padding: "10px 0",
                              background: withdrawBank === bankOpt ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.02)",
                              border: withdrawBank === bankOpt ? "1px solid var(--cyan)" : "1px solid rgba(255,255,255,0.05)",
                              borderRadius: "10px",
                              color: withdrawBank === bankOpt ? "var(--cyan)" : "rgba(226,232,240,0.6)",
                              fontSize: "12px",
                              fontWeight: "800",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            {bankOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Account Number */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase" }}>Nomor Rekening / HP</label>
                        <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={12} /> Akun Terverifikasi
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: 8849 0128 3928"
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value.replace(/\D/g, ""))}
                        style={{
                          width: "100%", padding: "12px 16px",
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px", color: "#fff", fontSize: "14px", outline: "none",
                        }}
                      />
                    </div>

                    {/* Amount to withdraw */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase" }}>Jumlah Penarikan (Rp)</label>
                        <button
                          onClick={() => setWithdrawAmount(formatInputRupiah(activeBalance.toString()))}
                          style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                        >
                          Tarik Semua
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: 1.500.000"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(formatInputRupiah(e.target.value))}
                        style={{
                          width: "100%", padding: "12px 16px",
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px", color: "#fff", fontSize: "14px", outline: "none",
                          fontWeight: "700",
                        }}
                      />
                      
                      {/* Real-time validation helper text */}
                      {withdrawAmount && (
                        <div style={{ marginTop: "6px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          {Number(withdrawAmount.replace(/\D/g, "")) > activeBalance ? (
                            <span style={{ color: "#EF4444", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                              <AlertCircle size={12} /> Nominal penarikan melebihi saldo aktif Anda
                            </span>
                          ) : Number(withdrawAmount.replace(/\D/g, "")) < 10000 ? (
                            <span style={{ color: "#f59e0b", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                              <AlertCircle size={12} /> Minimum penarikan adalah Rp 10.000
                            </span>
                          ) : (
                            <span style={{ color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle size={12} /> Saldo aman untuk ditarik (Bebas Biaya Transfer)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quick amount chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {[50000, 100000, 500000].map((amtOption) => {
                          if (activeBalance >= amtOption) {
                            return (
                              <button
                                key={amtOption}
                                onClick={() => setWithdrawAmount(formatInputRupiah(amtOption.toString()))}
                                style={{
                                  padding: "6px 12px",
                                  background: "rgba(255,255,255,0.03)",
                                  border: withdrawAmount.replace(/\D/g, "") === amtOption.toString() ? "1px solid var(--cyan)" : "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: "8px",
                                  color: withdrawAmount.replace(/\D/g, "") === amtOption.toString() ? "var(--cyan)" : "rgba(226,232,240,0.5)",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                {formatCurrency(amtOption)}
                              </button>
                            );
                          }
                          return null;
                        })}
                        <button
                          onClick={() => setWithdrawAmount(formatInputRupiah(activeBalance.toString()))}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(6,182,212,0.08)",
                            border: withdrawAmount.replace(/\D/g, "") === activeBalance.toString() ? "1px solid var(--cyan)" : "1px solid rgba(6,182,212,0.2)",
                            borderRadius: "8px",
                            color: withdrawAmount.replace(/\D/g, "") === activeBalance.toString() ? "var(--cyan)" : "var(--cyan)",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          Semua Saldo
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => setWithdrawStep("review")}
                      disabled={!withdrawAccount || !withdrawAmount || Number(withdrawAmount.replace(/\D/g, "")) <= 0 || Number(withdrawAmount.replace(/\D/g, "")) > activeBalance || Number(withdrawAmount.replace(/\D/g, "")) < 10000}
                      style={{
                        width: "100%", padding: "14px",
                        background: (!withdrawAccount || !withdrawAmount || Number(withdrawAmount.replace(/\D/g, "")) <= 0 || Number(withdrawAmount.replace(/\D/g, "")) > activeBalance || Number(withdrawAmount.replace(/\D/g, "")) < 10000)
                          ? "rgba(16,185,129,0.2)"
                          : "linear-gradient(135deg, #10b981, #059669)",
                        border: "none", borderRadius: "12px",
                        color: (!withdrawAccount || !withdrawAmount || Number(withdrawAmount.replace(/\D/g, "")) <= 0 || Number(withdrawAmount.replace(/\D/g, "")) > activeBalance || Number(withdrawAmount.replace(/\D/g, "")) < 10000) ? "rgba(255,255,255,0.25)" : "#fff",
                        fontSize: "14px", fontWeight: "700",
                        cursor: (!withdrawAccount || !withdrawAmount || Number(withdrawAmount.replace(/\D/g, "")) <= 0 || Number(withdrawAmount.replace(/\D/g, "")) > activeBalance || Number(withdrawAmount.replace(/\D/g, "")) < 10000) ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        transition: "all 0.2s", marginTop: "12px",
                      }}
                      onMouseOver={(e) => {
                        if (withdrawAccount && withdrawAmount && Number(withdrawAmount.replace(/\D/g, "")) > 0 && Number(withdrawAmount.replace(/\D/g, "")) <= activeBalance && Number(withdrawAmount.replace(/\D/g, "")) >= 10000) {
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      Konfirmasi Penarikan
                    </button>
                  </div>
                )}

                {withdrawStep === "review" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ textAlign: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--cyan)", background: "rgba(6,182,212,0.1)", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Langkah 2 dari 3
                      </span>
                      <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#fff", marginTop: "8px" }}>Konfirmasi Detail Penarikan</h4>
                      <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Periksa kembali data tujuan penarikan Anda.</p>
                    </div>

                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "16px",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: "rgba(226,232,240,0.4)" }}>Nama Penerima</span>
                        <span style={{ fontWeight: "700", color: "#fff" }}>Eko Muhammad F (Freelancer)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: "rgba(226,232,240,0.4)" }}>Bank / E-Wallet</span>
                        <span style={{ fontWeight: "700", color: "#fff" }}>{withdrawBank}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: "rgba(226,232,240,0.4)" }}>Nomor Rekening / HP</span>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--cyan)" }}>{withdrawAccount}</span>
                      </div>
                      <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: "rgba(226,232,240,0.4)" }}>Jumlah Penarikan</span>
                        <span style={{ fontWeight: "700", color: "#fff" }}>{formatCurrency(Number(withdrawAmount.replace(/\D/g, "")))}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: "rgba(226,232,240,0.4)" }}>Biaya Transfer</span>
                        <span style={{ color: "#10b981", fontWeight: "700" }}>Rp 0 (Gratis)</span>
                      </div>
                      <hr style={{ border: "0", borderTop: "1px dashed rgba(255,255,255,0.12)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800" }}>
                        <span style={{ color: "#fff" }}>Total Pengurangan Saldo</span>
                        <span style={{ color: "var(--cyan)", textShadow: "0 0 10px rgba(6,182,212,0.25)" }}>{formatCurrency(Number(withdrawAmount.replace(/\D/g, "")))}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button
                        onClick={() => setWithdrawStep("input")}
                        style={{
                          flex: 1, padding: "12px",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px", color: "rgba(226,232,240,0.6)", fontSize: "13px", fontWeight: "700",
                          cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(226,232,240,0.6)"; }}
                      >
                        Ubah Detail
                      </button>
                      <button
                        onClick={() => {
                          setWithdrawStep("pin");
                          setWithdrawPin("");
                          setPinError(null);
                        }}
                        style={{
                          flex: 2, padding: "12px",
                          background: "linear-gradient(135deg, var(--cyan), #0891b2)", border: "none",
                          borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: "700",
                          cursor: "pointer", transition: "all 0.2s",
                          boxShadow: "0 4px 15px rgba(6,182,212,0.2)"
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(6,182,212,0.3)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(6,182,212,0.2)"; }}
                      >
                        Lanjutkan
                      </button>
                    </div>
                  </div>
                )}

                {withdrawStep === "pin" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ textAlign: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--cyan)", background: "rgba(6,182,212,0.1)", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Langkah 3 dari 3
                      </span>
                      <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#fff", marginTop: "8px" }}>Masukkan PIN Keamanan</h4>
                      <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Otorisasi penarikan saldo Anda dengan aman.</p>
                    </div>

                    <motion.div
                      animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      style={{ display: "flex", justifyContent: "center", gap: "12px", margin: "16px 0" }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const isFilled = withdrawPin.length > index;
                        return (
                          <div
                            key={index}
                            style={{
                              width: "16px", height: "16px",
                              borderRadius: "50%",
                              border: isFilled ? "none" : "2px solid rgba(255,255,255,0.2)",
                              background: isFilled ? "var(--cyan)" : "transparent",
                              boxShadow: isFilled ? "0 0 10px var(--cyan)" : "none",
                              transition: "all 0.15s ease",
                            }}
                          />
                        );
                      })}
                    </motion.div>

                    {pinError ? (
                      <div style={{ color: "#EF4444", fontSize: "11px", fontWeight: "700", textAlign: "center", marginBottom: "8px" }}>
                        {pinError}
                      </div>
                    ) : (
                      <div style={{ color: "rgba(226,232,240,0.4)", fontSize: "10px", fontWeight: "600", textAlign: "center", marginBottom: "8px" }}>
                        Hint PIN Default: <strong style={{ color: "var(--cyan)" }}>123456</strong>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", maxWidth: "280px", margin: "0 auto 10px auto" }}>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <button
                          key={num}
                          onClick={() => handlePinClick(num)}
                          style={{
                            width: "56px", height: "56px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "50%",
                            color: "#fff",
                            fontSize: "18px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.1s",
                            margin: "0 auto",
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={handlePinCancel}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(226,232,240,0.4)",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.1s",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = "rgba(226,232,240,0.4)"; }}
                      >
                        Kembali
                      </button>
                      <button
                        onClick={() => handlePinClick("0")}
                        style={{
                          width: "56px", height: "56px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "50%",
                          color: "#fff",
                          fontSize: "18px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.1s",
                          margin: "0 auto",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      >
                        0
                      </button>
                      <button
                        onClick={handlePinBackspace}
                        style={{
                          width: "56px", height: "56px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "50%",
                          color: "rgba(226,232,240,0.6)",
                          fontSize: "16px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.1s",
                          margin: "0 auto",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(226,232,240,0.6)"; }}
                      >
                        ⌫
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 🧾 DIALOG RECEIPT DETAIL MODAL (RESI PENCAIRAN MILSTONE) ── */}
        <AnimatePresence>
          {selectedReceipt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)",
                padding: "20px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                style={{
                  width: "100%", maxWidth: "440px",
                  background: "rgba(15, 23, 42, 0.98)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "24px", padding: "30px 24px",
                  position: "relative", color: "#fff",
                  boxShadow: "0 30px 90px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.05)",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: "none", border: "none", color: "rgba(226,232,240,0.4)",
                    cursor: "pointer"
                  }}
                >
                  <X size={18} />
                </button>

                {/* Simulated Watermark Background */}
                <div style={{ position: "absolute", bottom: "30px", right: "30px", fontSize: "70px", fontWeight: "950", color: "rgba(16, 185, 129, 0.02)", transform: "rotate(-15deg)", pointerEvents: "none", textTransform: "uppercase", letterSpacing: "4px" }}>
                  PAID
                </div>

                {/* Receipt Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "sans-serif" }}>
                  {/* Status header */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "18px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", marginBottom: "4px" }}>
                      <CheckCircle size={24} />
                    </div>
                    <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Dana Cair Berhasil
                    </span>
                    <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#fff", marginTop: "4px" }}>
                      {formatCurrency(selectedReceipt.amount || 0)}
                    </h3>
                  </div>

                  {/* Details List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Milestone:</span>
                      <span style={{ fontWeight: "700", textAlign: "right", maxWidth: "200px" }}>{selectedReceipt.title}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>ID Proyek:</span>
                      <span style={{ fontFamily: "monospace", color: "var(--cyan)" }}>PROJ-{selectedReceipt.project_id?.substring(0, 8).toUpperCase() || "FT-991"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>No. Referensi:</span>
                      <span style={{ fontFamily: "monospace", color: "rgba(226,232,240,0.8)" }}>TXN-{selectedReceipt.id?.substring(0, 10).toUpperCase() || "FT-8839219"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Penerima Payout:</span>
                      <span style={{ fontWeight: "600" }}>Eko Muhammad F (Freelancer)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Sumber Dana:</span>
                      <span style={{ color: "rgba(226,232,240,0.8)" }}>Klien via FreeTrack Escrow</span>
                    </div>
                  </div>

                  {/* Billing math */}
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", marginTop: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Dana Milestone</span>
                      <span>{formatCurrency(selectedReceipt.amount || 0)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Platform Fee (0%)</span>
                      <span style={{ color: "#10b981", fontWeight: "700" }}>Rp 0 (Gratis)</span>
                    </div>
                    <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800" }}>
                      <span style={{ color: "#fff" }}>Total Diterima</span>
                      <span style={{ color: "#10b981" }}>{formatCurrency(selectedReceipt.amount || 0)}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)", textAlign: "center", marginTop: "8px", lineHeight: "1.4" }}>
                    Resi ini digenerate secara otomatis oleh sistem keuangan terpusat FreeTrack Escrow. Jaminan keamanan 100% tuntas.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 🧾 DIALOG RECEIPT DETAIL MODAL (RESI PENARIKAN DANA) ── */}
        <AnimatePresence>
          {selectedWithdrawalReceipt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)",
                padding: "20px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                style={{
                  width: "100%", maxWidth: "440px",
                  background: "rgba(15, 23, 42, 0.98)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "24px", padding: "30px 24px",
                  position: "relative", color: "#fff",
                  boxShadow: "0 30px 90px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.05)",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedWithdrawalReceipt(null)}
                  style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: "none", border: "none", color: "rgba(226,232,240,0.4)",
                    cursor: "pointer"
                  }}
                >
                  <X size={18} />
                </button>

                {/* Simulated Watermark Background */}
                <div style={{ position: "absolute", bottom: "30px", right: "30px", fontSize: "60px", fontWeight: "955", color: "rgba(239, 68, 68, 0.02)", transform: "rotate(-15deg)", pointerEvents: "none", textTransform: "uppercase", letterSpacing: "4px" }}>
                  OUT
                </div>

                {/* Receipt Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "sans-serif" }}>
                  {/* Status header */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "18px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", marginBottom: "4px" }}>
                      <ArrowUpRight size={24} />
                    </div>
                    <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Penarikan Sukses
                    </span>
                    <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#fff", marginTop: "4px" }}>
                      - {formatCurrency(selectedWithdrawalReceipt.amount || 0)}
                    </h3>
                  </div>

                  {/* Details List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Jenis Transaksi:</span>
                      <span style={{ fontWeight: "700" }}>{selectedWithdrawalReceipt.title}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>No. Referensi:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontFamily: "monospace", color: "var(--cyan)" }}>{selectedWithdrawalReceipt.id}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedWithdrawalReceipt.id);
                            Swal.fire({
                              toast: true,
                              position: 'top-end',
                              icon: 'success',
                              title: 'ID Referensi berhasil disalin',
                              showConfirmButton: false,
                              timer: 1500,
                              background: '#0F1B2E',
                              color: '#fff'
                            });
                          }}
                          style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Waktu Transfer:</span>
                      <span style={{ color: "rgba(226,232,240,0.8)" }}>{new Date(selectedWithdrawalReceipt.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Pengirim:</span>
                      <span style={{ fontWeight: "600" }}>FreeTrack FinTech Wallet</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Penerima / Rekening:</span>
                      <span style={{ fontWeight: "600", textAlign: "right" }}>Eko Muhammad F<br/><span style={{ fontSize: "11px", color: "rgba(226,232,240,0.5)", fontFamily: "monospace" }}>{selectedWithdrawalReceipt.bank} · {selectedWithdrawalReceipt.account}</span></span>
                    </div>
                  </div>

                  {/* Billing math */}
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", marginTop: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Jumlah Penarikan</span>
                      <span>{formatCurrency(selectedWithdrawalReceipt.amount || 0)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(226,232,240,0.4)" }}>Biaya Transfer Gateway</span>
                      <span style={{ color: "#10b981", fontWeight: "700" }}>Rp 0 (Gratis)</span>
                    </div>
                    <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800" }}>
                      <span style={{ color: "#fff" }}>Total Dikirim</span>
                      <span style={{ color: "#EF4444" }}>{formatCurrency(selectedWithdrawalReceipt.amount || 0)}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)", textAlign: "center", marginTop: "8px", lineHeight: "1.4" }}>
                    Resi penarikan ini digenerate secara otomatis oleh FreeTrack Bank Gateway. Dana ditransfer instan menggunakan metode Real-Time Online.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 16px",
            borderRadius: "10px",
            color: "rgba(226,232,240,0.6)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(226,232,240,0.6)";
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Wallet size={18} style={{ color: "var(--accent)" }} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
            Pembayaran Down Payment
          </h2>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", paddingLeft: "46px" }}>
          Bayar DP untuk milestone yang menunggu pembayaran. Uang akan disimpan di escrow hingga Anda menyetujui hasil kerja freelancer.
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: "20px 24px",
          background: "rgba(6, 182, 212, 0.05)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Shield size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
            🔒 Sistem Escrow Aman
          </h4>
          <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.6" }}>
            Uang Anda akan ditahan oleh platform dan hanya akan dilepas ke freelancer setelah Anda menyetujui hasil kerja. 
            Jika tidak sesuai, Anda dapat meminta revisi atau dispute.
          </p>
        </div>
      </motion.div>

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{
            padding: "80px 40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              Tidak Ada Pembayaran Pending
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", maxWidth: "400px" }}>
              Semua milestone sudah dibayar atau belum ada milestone yang dibuat.
            </p>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card"
              style={{
                padding: "24px",
                background: "rgba(13, 27, 62, 0.5)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow effect */}
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "120px", height: "120px",
                background: "#f59e0b",
                filter: "blur(60px)",
                opacity: 0.08,
                pointerEvents: "none",
              }} />

              {/* Header */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{
                    padding: "4px 10px",
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#f59e0b",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}>
                    <Clock size={11} />
                    Menunggu DP
                  </div>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>
                  {milestone.title}
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>
                  {milestone.description || "Tidak ada deskripsi"}
                </p>
              </div>

              {/* Amount */}
              <div style={{
                padding: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", fontWeight: "600" }}>
                    Jumlah DP
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: "900", color: "var(--accent)" }}>
                    {formatCurrency(milestone.amount || 0)}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              {milestone.deadline && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(226, 232, 240, 0.5)" }}>
                  <Clock size={14} />
                  Deadline: {milestone.deadline}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={() => handlePayDP(milestone)}
                disabled={processing === milestone.id}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: processing === milestone.id 
                    ? "rgba(16, 185, 129, 0.5)" 
                    : "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: processing === milestone.id ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  opacity: processing === milestone.id ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (processing !== milestone.id) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {processing === milestone.id ? (
                  <>
                    <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Bayar DP Sekarang
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
        style={{
          padding: "20px 24px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px",
        }}
      >
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226, 232, 240, 0.6)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          ℹ️ Catatan Penting
        </h4>
        <ul style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.8", paddingLeft: "20px" }}>
          <li>Pembayaran ini adalah simulasi untuk testing. Di production akan terintegrasi dengan payment gateway.</li>
          <li>Uang akan disimpan di escrow (ditahan platform) hingga Anda approve hasil kerja freelancer.</li>
          <li>Setelah DP dibayar, freelancer dapat mulai mengerjakan milestone.</li>
          <li>Anda dapat meminta revisi jika hasil tidak sesuai sebelum approve.</li>
        </ul>
      </motion.div>

      {/* ── CUSTOM PAYMENT MODAL ── */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(12px)",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              style={{
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "rgba(13, 27, 62, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                padding: "28px 32px",
                position: "relative",
                backdropFilter: "blur(30px)",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
                color: "#fff",
              }}
            >
              {/* Close Button */}
              {!isPaying && (
                <button
                  onClick={() => setSelectedMilestone(null)}
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "24px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "rgba(226,232,240,0.5)",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.color = "#EF4444";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(226,232,240,0.5)";
                  }}
                >
                  <X size={18} />
                </button>
              )}

              {/* Title Section */}
              <div style={{ marginBottom: "24px", paddingRight: "40px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                  {paymentMethod ? (
                    <button
                      onClick={() => setPaymentMethod(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--cyan)",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "0",
                        marginBottom: "12px",
                      }}
                    >
                      <ArrowLeft size={14} /> Kembali ke Pilihan Metode
                    </button>
                  ) : null}
                  <div>Metode Pembayaran DP</div>
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.6" }}>
                  Milestone: <strong style={{ color: "#fff" }}>{selectedMilestone.title}</strong> · Tagihan: <strong style={{ color: "var(--accent)" }}>{formatCurrency(selectedMilestone.amount || 0)}</strong>
                </p>
              </div>

              {/* Loader overlay inside modal */}
              {isPaying && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    background: "rgba(13, 27, 62, 0.95)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px",
                  }}
                >
                  <div style={{ width: "48px", height: "48px", border: "4px solid rgba(6, 182, 212, 0.1)", borderTop: "4px solid var(--cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
                    {paymentLoaderStatus}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>
                    Mohon tunggu sebentar, sistem sedang mengamankan dana di escrow.
                  </div>
                </div>
              )}

              {/* ── STEP 1: METHOD SELECTION ── */}
              {!paymentMethod && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod("bank")}
                    style={{
                      padding: "20px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      transition: "all 0.2s",
                    }}
                    className="payment-method-card"
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.border = "1px solid rgba(6, 182, 212, 0.4)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cyan)", flexShrink: 0 }}>
                      <Landmark size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>Transfer Bank</h4>
                      <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.4" }}>Bayar via Virtual Account Mandiri / BCA / BNI</p>
                    </div>
                  </div>

                  {/* E-Wallet (QRIS) */}
                  <div
                    onClick={() => setPaymentMethod("qris")}
                    style={{
                      padding: "20px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      transition: "all 0.2s",
                    }}
                    className="payment-method-card"
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.border = "1px solid rgba(6, 182, 212, 0.4)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                      <QrCode size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>E-Wallet (QRIS untuk Semua)</h4>
                      <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.4" }}>Pindai kode QRIS via GoPay, OVO, Dana, LinkAja</p>
                    </div>
                  </div>

                  {/* Credit Card */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    style={{
                      padding: "20px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      transition: "all 0.2s",
                    }}
                    className="payment-method-card"
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.border = "1px solid rgba(6, 182, 212, 0.4)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", flexShrink: 0 }}>
                      <CreditCard size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>Kartu Kredit</h4>
                      <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.4" }}>Mendukung kartu Visa, MasterCard, JCB dengan aman</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2A: BANK TRANSFER SCREEN ── */}
              {paymentMethod === "bank" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Virtual Account Card */}
                  <div
                    style={{
                      padding: "24px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase" }}>Nama Bank</span>
                      <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginTop: "4px" }}>Bank Mandiri Escrow</h4>
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase" }}>Nomor Virtual Account</span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "900", color: "var(--cyan)", letterSpacing: "1px" }}>8830 1928 3746 5928</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("8830192837465928");
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          style={{
                            padding: "8px 12px",
                            background: "rgba(6, 182, 212, 0.12)",
                            border: "1px solid rgba(6, 182, 212, 0.2)",
                            borderRadius: "8px",
                            color: "var(--cyan)",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          {isCopied ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase" }}>Total Nominal</span>
                      <h4 style={{ fontSize: "18px", fontWeight: "900", color: "var(--accent)", marginTop: "4px" }}>{formatCurrency(selectedMilestone.amount || 0)}</h4>
                    </div>
                  </div>

                  {/* Transfer Note */}
                  <div style={{ padding: "14px 18px", background: "rgba(6,182,212,0.03)", border: "1px solid rgba(6,182,212,0.1)", borderRadius: "12px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <Shield size={16} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", lineHeight: "1.5" }}>
                      Silakan selesaikan transfer dari mobile banking atau ATM Anda. Pembayaran akan terverifikasi secara instan setelah Anda mengklik tombol konfirmasi di bawah.
                    </p>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={processPayment}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Saya Sudah Transfer
                  </button>
                </div>
              )}

              {/* ── STEP 2B: E-WALLET (QRIS) SCREEN ── */}
              {paymentMethod === "qris" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                  {/* Dynamic QRIS Box */}
                  <div
                    style={{
                      padding: "24px",
                      background: "#fff",
                      borderRadius: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                      width: "100%",
                      maxWidth: "320px",
                    }}
                  >
                    {/* Header QRIS */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
                      <span style={{ fontWeight: "900", color: "#1e3a8a", fontSize: "16px" }}>QRIS</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#EF4444" }}>GPN INDONESIA</span>
                    </div>

                    {/* Premium Simulated QR Code SVG Grid */}
                    <div style={{ width: "200px", height: "200px", background: "#f8fafc", padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="180" height="180" viewBox="0 0 100 100">
                        {/* Outer framing squares (simulating dynamic code grid) */}
                        <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                        <rect x="9" y="9" width="17" height="17" fill="#fff" />
                        <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                        <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                        <rect x="74" y="9" width="17" height="17" fill="#fff" />
                        <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                        <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                        <rect x="9" y="74" width="17" height="17" fill="#fff" />
                        <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                        {/* Random simulated code dot grid pattern */}
                        <rect x="35" y="5" width="5" height="10" fill="#0f172a" />
                        <rect x="45" y="10" width="10" height="5" fill="#0f172a" />
                        <rect x="60" y="5" width="5" height="15" fill="#0f172a" />
                        <rect x="35" y="20" width="15" height="5" fill="#0f172a" />
                        
                        <rect x="5" y="35" width="10" height="5" fill="#0f172a" />
                        <rect x="20" y="35" width="10" height="10" fill="#0f172a" />
                        <rect x="35" y="35" width="30" height="5" fill="#0f172a" />
                        <rect x="50" y="45" width="10" height="15" fill="#0f172a" />
                        
                        <rect x="5" y="50" width="5" height="15" fill="#0f172a" />
                        <rect x="15" y="55" width="15" height="5" fill="#0f172a" />
                        <rect x="35" y="50" width="5" height="20" fill="#0f172a" />
                        <rect x="45" y="60" width="15" height="5" fill="#0f172a" />
                        
                        <rect x="70" y="35" width="15" height="10" fill="#0f172a" />
                        <rect x="75" y="50" width="10" height="5" fill="#0f172a" />
                        <rect x="70" y="60" width="5" height="15" fill="#0f172a" />
                        <rect x="80" y="70" width="15" height="5" fill="#0f172a" />
                        <rect x="70" y="80" width="25" height="5" fill="#0f172a" />
                        <rect x="85" y="90" width="10" height="5" fill="#0f172a" />

                        <rect x="35" y="75" width="10" height="10" fill="#0f172a" />
                        <rect x="50" y="75" width="15" height="5" fill="#0f172a" />
                        <rect x="35" y="90" width="25" height="5" fill="#0f172a" />

                        {/* Mid center lock logo */}
                        <rect x="42" y="42" width="16" height="16" rx="4" fill="#06b6d4" />
                        <rect x="47" y="48" width="6" height="5" rx="1" fill="#fff" />
                        <path d="M49 48V46.5C49 45.7 49.7 45 50.5 45S52 45.7 52 46.5V48" stroke="#fff" strokeWidth="1.2" fill="none" />
                      </svg>
                    </div>

                    {/* QR Details */}
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>NMID</span>
                      <div style={{ fontSize: "11px", fontWeight: "800", color: "#1e293b", letterSpacing: "0.5px" }}>ID1020304050607</div>
                      <div style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", marginTop: "6px" }}>
                        {formatCurrency(selectedMilestone.amount || 0)}
                      </div>
                    </div>
                  </div>

                  {/* QRIS instruction */}
                  <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", textAlign: "center", lineHeight: "1.6", maxWidth: "400px" }}>
                    Kode QRIS ini berlaku untuk semua e-wallet & m-banking Indonesia. Pindai QR di atas dan selesaikan pembayaran Anda di ponsel.
                  </p>

                  {/* Action button */}
                  <button
                    onClick={processPayment}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Selesai Pindai & Bayar
                  </button>
                </div>
              )}

              {/* ── STEP 2C: CREDIT CARD FORM SCREEN ── */}
              {paymentMethod === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Dynamic Floating Credit Card Graphic */}
                  <div
                    style={{
                      width: "100%",
                      height: "170px",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "16px",
                      padding: "20px 24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Glow design elements */}
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "120px", height: "120px", background: "var(--cyan)", filter: "blur(50px)", opacity: 0.2, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", background: "var(--primary-light)", filter: "blur(40px)", opacity: 0.15, pointerEvents: "none" }} />

                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "1px", color: "rgba(255,255,255,0.8)" }}>FreeTrack ESCROW</span>
                      {/* Premium Chip SVG */}
                      <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                        <rect x="0.5" y="0.5" width="27" height="21" rx="4" fill="#E2E8F0" stroke="#CBD5E1" />
                        <rect x="4" y="4" width="7" height="6" rx="1" fill="#94A3B8" />
                        <rect x="17" y="4" width="7" height="6" rx="1" fill="#94A3B8" />
                        <rect x="4" y="12" width="7" height="6" rx="1" fill="#94A3B8" />
                        <rect x="17" y="12" width="7" height="6" rx="1" fill="#94A3B8" />
                        <line x1="11" y1="7" x2="17" y2="7" stroke="#94A3B8" strokeWidth="1.5" />
                        <line x1="11" y1="15" x2="17" y2="15" stroke="#94A3B8" strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* Card Number */}
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff", letterSpacing: "2.5px", fontFamily: "monospace", margin: "14px 0" }}>
                      {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                    </div>

                    {/* Bottom row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: "8px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase" }}>Pemilik Kartu</div>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: "#fff", textTransform: "uppercase", marginTop: "2px" }}>
                          {cardName || "NAMA PEMILIK"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "8px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", textAlign: "right" }}>Berlaku Hingga</div>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: "#fff", marginTop: "2px", textAlign: "right" }}>
                          {cardExpiry || "BB/TT"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Form Fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "6px" }}>
                        Nomor Kartu
                      </label>
                      <input
                        type="text"
                        placeholder="4123 4567 8901 2345"
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "6px" }}>
                        Nama Pada Kartu
                      </label>
                      <input
                        type="text"
                        placeholder="Eko Muhammad F"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Masa Berlaku
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2) {
                              val = val.substring(0, 2) + "/" + val.substring(2, 4);
                            }
                            setCardExpiry(val);
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "6px" }}>
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={processPayment}
                    disabled={!cardNumber || !cardExpiry || !cardCvv || !cardName}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: (!cardNumber || !cardExpiry || !cardCvv || !cardName) 
                        ? "rgba(16, 185, 129, 0.4)" 
                        : "linear-gradient(135deg, #10b981, #059669)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: (!cardNumber || !cardExpiry || !cardCvv || !cardName) ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      if (cardNumber && cardExpiry && cardCvv && cardName) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Bayar Sekarang
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { border-color: rgba(0, 255, 163, 0.4); box-shadow: 0 0 15px rgba(0, 255, 163, 0.15), inset 0 1px 1px rgba(255,255,255,0.05); }
          50% { border-color: rgba(0, 255, 163, 1); box-shadow: 0 0 35px rgba(0, 255, 163, 0.45), inset 0 1px 1px rgba(255,255,255,0.15); }
          100% { border-color: rgba(0, 255, 163, 0.4); box-shadow: 0 0 15px rgba(0, 255, 163, 0.15), inset 0 1px 1px rgba(255,255,255,0.05); }
        }
        @keyframes floatUp {
          0% { transform: translateY(12px) scale(0.9); opacity: 0; }
          15% { transform: translateY(0) scale(1); opacity: 1; }
          85% { transform: translateY(-8px) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(0.95); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default function Payments() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 140px)", background: "rgba(15, 27, 46, 0.4)", borderRadius: "24px", color: "rgba(226,232,240,0.4)", padding: "40px" }}>
        <Loader2 style={{ animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  );
}
