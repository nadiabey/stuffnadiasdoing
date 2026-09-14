  function onTurnstileSuccess(token) {
    console.log("Turnstile success:", token);
    document.getElementById("su").disabled = false;
  }
  function onTurnstileError(errorCode) {
    console.error("Turnstile error:", errorCode);
    document.getElementById("su").disabled = true;
  }
  function onTurnstileExpired() {
    console.warn("Turnstile token expired");
    document.getElementById("su").disabled = true;
  }
