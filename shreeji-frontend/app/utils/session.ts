const SESSION_DURATION=4*60*60*1000; // 4hrs in ms

export function saveSession(phone:string,role:"malik"|"grahak"|"preorderGuest"){
    const expiresAt=Date.now()+SESSION_DURATION;
    localStorage.setItem(`${role}Phone`,phone);
    localStorage.setItem(`${role}SessionExpiry`,String(expiresAt));
}

export function isSessionValid(role: "malik" | "grahak" | "preorderGuest"): boolean {
  const expiry = localStorage.getItem(`${role}SessionExpiry`);
  const phone = localStorage.getItem(`${role}Phone`);
  
  if (!expiry || !phone) return false;
  
  const valid = Date.now() < Number(expiry);
  
  if (!valid) {
    localStorage.removeItem(`${role}SessionExpiry`);
    localStorage.removeItem(`${role}Phone`);
  }
  
  return valid;
}

export function clearSession(role: "malik" | "grahak" | "preorderGuest") {
  localStorage.removeItem(`${role}Phone`);
  localStorage.removeItem(`${role}SessionExpiry`);

  if(role==="malik"){
    localStorage.removeItem("malik");
  }
}