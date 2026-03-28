import { useState, useEffect, useRef } from "react";
import { ApiUserRepository } from "../../../../infrastructure/repositories/api-user-repository";
import { RequestEmailChangeUseCase } from "../../../../application/use-cases/users/request-email-change";
import { ConfirmEmailChangeUseCase } from "../../../../application/use-cases/users/confirm_email_change";
import {CheckIcon, MailIcon, ShieldIcon} from "lucide-react";

function OTPInput({ value, onChange }) {
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
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onFocus={(e) => e.target.select()}
          style={{
            width: 44, height: 52,
            textAlign: "center",
            fontSize: 22, fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            background: digits[i] ? "#1a2e1a" : "#0f1a0f",
            border: digits[i] ? "2px solid #4ade80" : "2px solid #1e3a1e",
            borderRadius: 10,
            color: "#4ade80",
            outline: "none",
            transition: "all 0.15s",
            caretColor: "transparent",
          }}
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
  const [step, setStep] = useState("idle"); // idle | editing | sending | sent | verifying | error
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
       onEmailChangeSuccess(result.new_email);
       
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
    setCode(""); setCodeError(""); setStep("sending");
    // Simulamos un retraso para la experiencia de usuario antes de reiniciar el contador
    setTimeout(() => { 
        handleSend(); 
    }, 500);
  };

  const resetAndClose = () => {
    setStep("idle"); setNewEmail(""); setCode("");
    setEmailError(""); setCodeError(""); setCountdown(0);
    clearInterval(timerRef.current);
    onClose(); // Close the modal/form on reset/cancel
  };

  const handleCodeChange = (val) => {
    setCode(val); setCodeError("");
    if (step === "error") setStep("sent");
  };

  // Effect to clean up timer when component unmounts or isOpen changes to false
  useEffect(() => {
    if (!isOpen) {
        resetAndClose();
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      width: "100%", maxWidth: 420 
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#0f1a0f", border: "1px solid #1e3a1e",
          borderRadius: 99, padding: "6px 14px", marginBottom: 20,
          color: "#4ade80", fontSize: 12, fontWeight: 600, letterSpacing: 1,
        }}>
          <ShieldIcon size={14} /> SEGURIDAD DE CUENTA
        </div>
        <h1 style={{ color: "white", fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          Cambiar correo electrónico
        </h1>
        <p style={{ color: "#4b5e4b", fontSize: 14, marginTop: 8, fontWeight: 400 }}>
          Verificamos tu nuevo correo antes de hacer el cambio
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "#0d150d",
        border: "1px solid #1a2e1a",
        borderRadius: 20,
        overflow: "hidden",
      }}>

        {/* Current email row */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #1a2e1a",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ color: "#2d4a2d" }}><MailIcon size={20} /></div>
          <div>
            <div style={{ fontSize: 11, color: "#2d4a2d", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Correo actual
            </div>
            <div style={{ fontSize: 14, color: "#6b8f6b", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              {currentEmail}
            </div>
          </div>
          {step === "verified" && (
            <div style={{ marginLeft: "auto" }}><CheckIcon size={20} color="#4ade80" /></div>
          )}
        </div>

        <div style={{ padding: 24 }}>

          {/* STEP: IDLE */}
          {step === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ color: "#4b5e4b", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Al cambiar tu correo, te enviaremos un código de verificación a la nueva dirección. Tu correo actual seguirá activo hasta confirmar el cambio.
              </p>
              <button onClick={() => setStep("editing")} style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "white", border: "none", borderRadius: 12,
                padding: "13px 20px", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s",
              }}>
                <MailIcon size={16}/> Cambiar correo electrónico
              </button>
            </div>
          )}

          {/* STEP: EDITING / SENDING */}
          {(step === "editing" || step === "sending") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#4b5e4b", fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: 0.3 }}>
                  NUEVO CORREO
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
                  placeholder="nuevo@correo.com"
                  autoFocus
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    background: "#0f1a0f", border: emailError ? "1.5px solid #ef4444" : "1.5px solid #1e3a1e",
                    color: "white", fontSize: 14, fontFamily: "'DM Mono', monospace",
                    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                  }}
                  onFocus={e => { if (!emailError) e.target.style.borderColor = "#166534"; }}
                  onBlur={e => { if (!emailError) e.target.style.borderColor = "#1e3a1e"; }}
                />
                {emailError && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{emailError}</p>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={resetAndClose} style={{
                  flex: 1, background: "transparent", border: "1.5px solid #1e3a1e",
                  color: "#4b5e4b", borderRadius: 10, padding: "12px", fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: 500,
                }}>
                  Cancelar
                </button>
                <button onClick={handleSend} disabled={step === "sending"} style={{
                  flex: 2,
                  background: step === "sending" ? "#1a2e1a" : "linear-gradient(135deg, #16a34a, #15803d)",
                  color: step === "sending" ? "#4b5e4b" : "white",
                  border: "none", borderRadius: 10, padding: "12px",
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600, cursor: step === "sending" ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}>
                  {step === "sending" ? (
                    <>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #4b5e4b", borderTopColor: "#4ade80", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
                      Enviando...
                    </>
                  ) : "Enviar código →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SENT / VERIFYING / ERROR */}
          {(step === "sent" || step === "verifying" || step === "error") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                background: "#0a160a", border: "1px solid #1a2e1a",
                borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <div style={{ color: "#4ade80", marginTop: 1 }}><MailIcon size={16}/></div>
                <div>
                  <p style={{ color: "#4b5e4b", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                    Enviamos un código de 6 dígitos a
                  </p>
                  <p style={{ color: "#4ade80", fontSize: 13, fontFamily: "'DM Mono', monospace", margin: "2px 0 0" }}>
                    {newEmail}
                  </p>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: 12, color: "#4b5e4b", fontWeight: 600, display: "block", marginBottom: 12, textAlign: "center", letterSpacing: 0.3 }}>
                  INGRESA EL CÓDIGO
                </label>
                <OTPInput value={code} onChange={handleCodeChange} />
                {codeError && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 10, textAlign: "center" }}>{codeError}</p>
                )}
              </div>

              <button onClick={handleVerify} disabled={step === "verifying"} style={{
                background: step === "verifying" ? "#1a2e1a" : code.replace(/\D/g,"").length === 6 ? "linear-gradient(135deg, #16a34a, #15803d)" : "#1a2e1a",
                color: code.replace(/\D/g,"").length === 6 && step !== "verifying" ? "white" : "#4b5e4b",
                border: "none", borderRadius: 12, padding: "14px",
                fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, cursor: step === "verifying" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.25s",
              }}>
                {step === "verifying" ? (
                  <>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #4b5e4b", borderTopColor: "#4ade80", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
                    Verificando...
                  </>
                ) : "Confirmar cambio →"}
              </button>

              <div style={{ textAlign: "center" }}>
                {countdown > 0 ? (
                  <p style={{ color: "#2d4a2d", fontSize: 12 }}>
                    Reenviar código en <span style={{ color: "#4b5e4b", fontWeight: 600 }}>{countdown}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} style={{
                    background: "none", border: "none", color: "#4b5e4b",
                    fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    textDecoration: "underline",
                  }}>
                    ¿No llegó? Reenviar código
                  </button>
                )}
              </div>

              <button onClick={resetAndClose} style={{
                background: "none", border: "none", color: "#2d4a2d",
                fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                textAlign: "center",
              }}>
                ← Cancelar y volver
              </button>
            </div>
          )}

          {/* STEP: VERIFIED */}
          {step === "verified" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#0f1a0f", border: "2px solid #166534",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                  ¡Correo actualizado!
                </h3>
                <p style={{ color: "#4b5e4b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  Tu correo fue cambiado exitosamente a
                </p>
                <p style={{ color: "#4ade80", fontFamily: "'DM Mono', monospace", fontSize: 13, margin: "4px 0 0", fontWeight: 600 }}>
                  {newEmail}
                </p>
              </div>
              <button onClick={resetAndClose} style={{
                background: "transparent", border: "1.5px solid #1e3a1e",
                color: "#4b5e4b", borderRadius: 10, padding: "10px 20px",
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer", fontWeight: 500, marginTop: 4,
              }}>
                Volver a configuración
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Steps indicator */}
      {step !== "idle" && step !== "verified" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 24 }}>
          {[
            { key: "editing", label: "Nuevo correo" },
            { key: "sent", label: "Verificar código" },
          ].map((s, i) => {
            const isActive = (s.key === "editing" && (step === "editing" || step === "sending"))
              || (s.key === "sent" && (step === "sent" || step === "verifying" || step === "error"));
            const isDone = (s.key === "editing" && (step === "sent" || step === "verifying" || step === "error"));
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 40, height: 1, background: isDone ? "#166534" : "#1a2e1a" }}/>}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isDone ? "#166534" : isActive ? "#1a2e1a" : "#0d150d",
                    border: isDone ? "none" : isActive ? "2px solid #4ade80" : "1.5px solid #1a2e1a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: isDone ? "white" : isActive ? "#4ade80" : "#2d4a2d",
                    transition: "all 0.3s",
                  }}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: isActive ? "#4b5e4b" : "#2d4a2d", fontWeight: 500 }}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        input::placeholder { color: #2d4a2d; }
      `}</style>
    </div>
  );
}
