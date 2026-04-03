// used for session based login 4hrs auto logout

const SESSION_DURATION=4*60*60*1000; // 4hrs in ms

export function saveSession(phone:string,role:"malik"|"grahak"){
    const expiresAt=Date.now()+SESSION_DURATION;
    localStorage.setItem(`${role}Phone`,phone);
    localStorage.setItem(`${role}SessionExpiry`,String(expiresAt));

}

export function isSessionValid(role: "malik" | "grahak"): boolean {
  const expiry = localStorage.getItem(`${role}SessionExpiry`);
  const phone = localStorage.getItem(`${role}Phone`);
  
  // ✅ BOTH must exist and expiry must be valid
  if (!expiry || !phone) return false;
  
  const valid = Date.now() < Number(expiry);
  
  // ✅ Auto-clean if expiry exists but is stale or phone is missing
  if (!valid) {
    localStorage.removeItem(`${role}SessionExpiry`);
    localStorage.removeItem(`${role}Phone`);
  }
  
  return valid;
}

export function clearSession(role: "malik" | "grahak") {
  localStorage.removeItem(`${role}Phone`);
  localStorage.removeItem(`${role}SessionExpiry`);
}