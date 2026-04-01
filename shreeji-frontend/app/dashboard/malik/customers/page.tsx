// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function MalikCustomersPage() {
//   const router = useRouter();

//   // temporary customer list (later from backend)
//   const [customers, setCustomers] = useState([
//     { name: 'Rameshbhai', phone: '8888888888' },
//     { name: 'Sureshbhai', phone: '9999999999' },
//   ]);

//   // add-customer inputs
//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');

//   // search input
//   const [searchText, setSearchText] = useState('');

//   const addCustomer = () => {
//     if (!name || !phone) {
//       alert('Please fill all fields');
//       return;
//     }

//     setCustomers([...customers, { name, phone }]);
//     setName('');
//     setPhone('');
//   };

//   // filtered list based on search
//   const filteredCustomers = customers.filter(
//     (c) =>
//       c.name.toLowerCase().includes(searchText.toLowerCase()) ||
//       c.phone.includes(searchText)
//   );

//   return (
//     <div className="min-h-screen p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Customers</h1>
//         <p className="text-gray-600">Shreeji Provision Store</p>
//       </div>

//       {/* Add customer */}
//       <div className="border p-4 rounded mb-6 max-w-md">
//         <h2 className="font-semibold mb-3">Add New Customer</h2>

//         <input
//           type="text"
//           placeholder="Customer name"
//           className="w-full mb-2 px-3 py-2 border rounded"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           type="text"
//           placeholder="Phone number"
//           className="w-full mb-3 px-3 py-2 border rounded"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//         />

//         <button
//           onClick={addCustomer}
//           className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
//         >
//           OK
//         </button>
//       </div>

//       {/* Customer list */}
//       <div className="max-w-md">
//         <h2 className="font-semibold mb-3">Customer List</h2>

//         {/* Search box */}
//         <input
//           type="text"
//           placeholder="Search by name or phone"
//           className="w-full mb-3 px-3 py-2 border rounded"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//         />

//         {filteredCustomers.length === 0 && (
//           <p className="text-gray-500">No customer found</p>
//         )}

//         {filteredCustomers.map((c) => (
//           <div
//             key={c.phone}
//             className="border p-3 rounded mb-2 cursor-pointer hover:bg-gray-50"
//             onClick={() =>
//               router.push(`/dashboard/malik/khata?phone=${c.phone}`)
//             }
//           >
//             <div className="flex justify-between items-center">
//               <p className="font-medium">{c.name}</p>
//               <p className="text-sm text-gray-600">{c.phone}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
