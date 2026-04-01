// used for session based login 4hrs auto logout

const SESSION_DURATION=4*60*60*1000; // 4hrs in ms

export function saveSession(phone:string){
    const expiresAt=Date.now()+SESSION_DURATION;
    localStorage.setItem("malikPhone",phone);
    localStorage.setItem("malikSessionExpiry",String(expiresAt));

}

export function isSessionValid():boolean{
    const expiry=localStorage.getItem("malikSessionExpiry");
    if(!expiry)return false;
    return Date.now()<Number(expiry); // if current date is less that expiresAt then session is valid else not
}

export function clearSession(){
    localStorage.removeItem("malikPhone");
    localStorage.removeItem("malik");
    localStorage.removeItem("malikSessionExpiry");
}