# 🏪 Shreeji Retail Management System
A production-grade digital ledger system built for real-world retail usage, designed to replace manual khata bookkeeping with a reliable, real-time, and user-friendly solution.


## 🚀 Live Demo
🔗 https://shreeji-app.vercel.app
> Actively used in a real retail store environment



## ❗ Problem
Small retail shop owners manage customer khata (credit ledgers) manually in notebooks.

- Data scattered across multiple books
- High risk of calculation errors
- Difficult to track history
- No real-time updates
- Existing apps too complex for non-technical users




## 💡 Solution
Built a simple, intuitive, and real-time digital ledger system tailored specifically for a non-technical shop owner.
- Designed UI based on actual user behavior
- Focused on simplicity over feature overload
- Ensured trust in handling financial data
- Optimized for low internet environments


## ✨ Features
- 🔐 Session-based login (4-hour expiry, single device)
- ⚡ Real-time updates using Firestore (onSnapshot)
- 📱 Mobile-friendly UI for first-time users
- 📊 Live khata tracking (credits, debits, totals)
- 🔄 Auto UI sync without page refresh
- 👥 Malik & Grahak role-based system
- ➕ Add/Edit/Delete customer & entries
- 📡 Works smoothly in low network conditions


## ⚙️ Tech Stack
- Frontend: Next.js, React, TypeScript
- Backend: REST APIs
- Database: Firebase Firestore (real-time)
- Auth: Custom session handling (localStorage)
- Deployment: Vercel
- Monitoring: UptimeRobot


## 🏗️ Engineering Highlights
- Used Firestore listeners (onSnapshot) for real-time updates instead of polling
- Avoided full page reloads by updating only changed UI components
- Implemented router prefetching to reduce navigation latency
- Designed custom session management with expiry logic
- Handled production-safe deployments to avoid breaking live users



## 📊 Impact
- Managing 50+ active customers and expecting more 
- Handling 500+ ledger entries
- <1 second real-time updates
- ~40% reduction in page transition latency
- Successfully adopted by a non-technical user


## 🧪 Challenges
- Designing UI for a first-time tech user
- Ensuring trust while handling financial data
- Handling real-time updates without performance issues
- Debugging live production bugs

## 📚 Learnings
- Real-world users != developers
- Simplicity > feature complexity
- Production systems require stability over speed


## 🔮 Future Scope
- Multi-shop onboarding
- Analytics dashboard
- Offline mode support
- Payment integration (UPI)
- Auto email/sms to customers regarding their pending payments in every 2 weeks
- Auto bill generation in pdf format
