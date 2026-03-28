import { useState, useEffect, useRef } from "react";
import { ApiUserRepository } from "../../../../infrastructure/repositories/api-user-repository";
import { RequestEmailChangeUseCase } from "../../../../application/use-cases/users/request-email-change";
import { ConfirmEmailChangeUseCase } from "../../../../application/use-cases/users/confirm_email_change";
import { CheckIcon, Mail, Shield, X, ArrowRight, RefreshCw, Loader2 } from "lucide-react";

function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.padEnd(6, "").split("");

  const handleKey = (e, i) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[i]) { next[i] = ""; onChange(next.join("")); }
      else if (i > 0) { inputs.current[i - 1]?.focus(); }
    }
  };

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none 
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 
              digits[i] ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 
              'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-emerald-500'}`}
        />
      ))}
    </div>
  );
}

export default function EmailChangeModal({ 
    isOpen, 
    currentEmail, 
    onClose, 
    onEmailChangeSuccess 
}) {
  const [step, setStep] = useState("idle"); // idle | editing | sending | sent | verifying | verified | error
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startCountdown = () => {
    setCountdown(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; });
    }, 1000);
  };

   const handleSend = async () => {
     if (newEmail === currentEmail) { setEmailError("Este ya es tu correo actual"); return; }
     setEmailError("");
     setStep("sending");
     
     try {
       const userRepository = new ApiUserRepository();
       const requestEmailChangeUseCase = new RequestEmailChangeUseCase(userRepository);
       
       await requestEmailChangeUseCase.execute(newEmail);
       
       setStep('sent');
       startCountdown();
       
     } catch (error) {
       let errorMessage = 'Error al enviar código de verificación';
       if (error.response?.data) {
           const data = error.response.data;
           errorMessage = data.new_email?.[0] || data.error || data.detail || errorMessage;
       } else {
           errorMessage = error.message || errorMessage;
       }
       setEmailError(errorMessage);
       setStep('editing');
     }
   };

   const handleVerify = async () => {
     setCodeError("");
     setStep("verifying");
     
     try {
       const userRepository = new ApiUserRepository();
       const confirmEmailChangeUseCase = new ConfirmEmailChangeUseCase(userRepository);
       
       const result = await confirmEmailChangeUseCase.execute(code);
       
       setStep('verified');
       setTimeout(() => {
           onEmailChangeSuccess(result.new_email);
           resetAndClose();
       }, 2000);
       
     } catch (error) {
       let errorMessage = 'Código de verificación inválido';
       if (error.response?.data) {
           const data = error.response.data;
           errorMessage = data.verification_code?.[0] || data.error || data.detail || errorMessage;
       } else {
           errorMessage = error.message || errorMessage;
       }
       setCodeError(errorMessage);
       setStep('error');
     }
   };

  const handleResend = () => {
    setCode(""); setCodeError(""); 
    handleSend();
  };

  const resetAndClose = () => {
    setStep("idle"); setNewEmail(""); setCode("");
    setEmailError(""); setCodeError(""); setCountdown(0);
    clearInterval(timerRef.current);
    onClose();
  };

  const handleCodeChange = (val) => {
    setCode(val); setCodeError("");
    if (step === "error") setStep("sent");
  };

  useEffect(() => {
    if (!isOpen) {
        resetAndClose();
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seguridad de Cuenta</h2>
          </div>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Progress Steps (visual only) */}
          {step !== "verified" && (
            <div className="flex items-center justify-between mb-8 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                <div className={`flex flex-col items-center gap-2 ${step === "idle" || step === "editing" || step === "sending" ? "text-emerald-500" : "text-emerald-600"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "idle" || step === "editing" || step === "sending" ? "border-emerald-500 bg-white dark:bg-slate-800" : "bg-emerald-500 border-emerald-500 text-white"}`}>
                        {step !== "idle" && step !== "editing" && step !== "sending" ? <CheckIcon size={16} /> : "1"}
                    </div>
                    <span>Solicitud</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-slate-200 dark:bg-slate-700 -mt-6">
                    <div className={`h-full bg-emerald-500 transition-all duration-500 ${step === "sent" || step === "verifying" || step === "error" ? "w-full" : "w-0"}`}></div>
                </div>
                <div className={`flex flex-col items-center gap-2 ${step === "sent" || step === "verifying" || step === "error" ? "text-emerald-500" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "sent" || step === "verifying" || step === "error" ? "border-emerald-500 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-700"}`}>
                        2
                    </div>
                    <span>Verificación</span>
                </div>
            </div>
          )}

          {/* STEP: IDLE */}
          {step === "idle" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cambiar Correo</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Protegemos tu cuenta validando cada cambio importante.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Tu correo actual</p>
                <p className="font-bold text-slate-900 dark:text-white truncate">{currentEmail}</p>
              </div>

              <button 
                onClick={() => setStep("editing")} 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP: EDITING / SENDING */}
          {(step === "editing" || step === "sending") && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ingresa tu nuevo correo</h3>
                <p className="text-amber-500 dark:text-amber-400 text-sm italic">
                  Si el correo es válido, recibirás un código de verificación.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nuevo Email</label>
                <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
                      placeholder="ejemplo@correo.com"
                      disabled={step === "sending"}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-2 transition-all outline-none text-slate-900 dark:text-white
                        ${emailError ? 'border-red-500/50 focus:border-red-500 ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-emerald-500 ring-emerald-500/10'}
                        focus:ring-4`}
                    />
                </div>
                {emailError && <p className="text-red-500 text-xs font-bold px-1 animate-in slide-in-from-top-1">{emailError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                    onClick={() => setStep("idle")} 
                    disabled={step === "sending"}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white px-6 py-4 rounded-xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  Atrás
                </button>
                <button 
                    onClick={handleSend} 
                    disabled={step === "sending" || !newEmail}
                    className="flex-[2] bg-slate-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold transition-all hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {step === "sending" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight size={18} />}
                  {step === "sending" ? "Enviando..." : "Enviar Código"}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SENT / VERIFYING / ERROR */}
          {(step === "sent" || step === "verifying" || step === "error") && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verifica tu correo</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Hemos enviado un código de 6 dígitos a <span className="font-bold text-emerald-600 dark:text-emerald-400">{newEmail}</span>
                </p>
              </div>

              <div className="space-y-4">
                <OTPInput value={code} onChange={handleCodeChange} disabled={step === "verifying"} />
                {codeError && <p className="text-red-500 text-xs font-bold text-center animate-in shake-1">{codeError}</p>}
              </div>

              <button 
                onClick={handleVerify} 
                disabled={step === "verifying" || code.length < 6}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95
                  ${step === "verifying" || code.length < 6 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'}`}
              >
                {step === "verifying" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar e Inscribir"}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin-slow" /> Reenviar en <span className="text-slate-900 dark:text-white font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">
                    ¿No recibiste el código? Reenviar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP: VERIFIED */}
          {step === "verified" && (
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 border-4 border-white dark:border-slate-800">
                <CheckIcon size={48} className="text-white dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">¡Éxito Total!</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Tu correo ha sido actualizado correctamente.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase font-black tracking-widest mb-1">Nueva Dirección</p>
                <p className="font-bold text-slate-900 dark:text-white">{newEmail}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
