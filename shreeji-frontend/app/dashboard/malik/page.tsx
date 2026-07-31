'use client';
export const dynamic = "force-dynamic";

import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { useMalikDashboard } from "@/hooks/dashboard/useMalikDashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CustomerListCard from "@/components/dashboard/CustomerListCard";
import AddCustomerModal from "@/components/dashboard/modals/AddCustomerModal";
import RowOptionsModal from "@/components/dashboard/modals/RowOptionsModal";
import EditNameModal from "@/components/dashboard/modals/EditNameModal";
import EditPhoneModal from "@/components/dashboard/modals/EditPhoneModal";

export default function MalikDashboardPage() {
  const d = useMalikDashboard();

  if (!d.malikdata) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6b7280' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={d.stamping} />
      <KiranaBackground />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1000px' }}>
        <DashboardHeader
          malikdata={d.malikdata}
          onLogout={() => { d.logout(); d.navigateto('/'); }}
          onAddCustomer={d.opendaddcustomer}
        />

        <CustomerListCard
          customers={d.filteredcustomers}
          now={d.now}
          searchtext={d.searchtext}
          setSearchtext={d.setsearchtext}
          sortoption={d.sortoption}
          setSortoption={d.setsortoption}
          onOpenCustomer={(phone) => d.navigateto(`/dashboard/malik/khata?phone=${phone}`)}
          onOpenMenu={d.openrowmenu}
        />
      </div>

      <AddCustomerModal
        show={d.showaddcustomer}
        name={d.name} setName={d.setname}
        phone={d.phone} setPhone={d.setphone}
        onCancel={d.closeaddcustomer}
        onSubmit={d.addcustomer}
      />

      <RowOptionsModal
        show={d.showrowmenu}
        customerName={d.selectedcustomer?.name}
        onEditName={d.openeditnamefrommenu}
        onEditPhone={d.openeditphonefrommenu}
        onCancel={d.closerowmenu}
      />

      <EditNameModal
        show={d.showeditname}
        phone={d.selectedcustomer?.phone}
        editname={d.editname} setEditname={d.seteditname}
        isediting={d.isediting}
        onCancel={d.closeeditname}
        onSubmit={d.editcustomername}
      />

      <EditPhoneModal
        show={d.showeditphone}
        editphone={d.editphone} setEditphone={d.seteditphone}
        isediting={d.isediting}
        onCancel={d.closeeditphone}
        onSubmit={d.editcustomerphone}
      />
    </div>
  );
}