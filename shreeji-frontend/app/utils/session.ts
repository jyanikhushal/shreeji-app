// used for session based login 4hrs auto logout

const SESSION_DURATION=4*60*60*1000; // 4hrs in ms

export function saveSession(phone:string,role:"malik"|"grahak"){
    const expiresAt=Date.now()+SESSION_DURATION;
    localStorage.setItem(`${role}Phone`,phone);
    localStorage.setItem(`${role}SessionExpiry`,String(expiresAt));

}

export function isSessionValid(role:"malik" |"grahak"):boolean{
    const expiry=localStorage.getItem(`${role}SessionExpiry`);
    if(!expiry)return false;
    return Date.now()<Number(expiry); // if current date is less that expiresAt then session is valid else not
}

export function clearSession(role: "malik" | "grahak") {
  localStorage.removeItem(`${role}Phone`);
  localStorage.removeItem(`${role}SessionExpiry`);
}