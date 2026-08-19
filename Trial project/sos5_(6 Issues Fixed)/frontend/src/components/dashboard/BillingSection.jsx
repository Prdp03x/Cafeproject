import useAuth from "../../hooks/useAuth";
import useBilling from "./billing/useBilling"
import BillingHeader from "./billing/BillingHeader";
import BillingSummaryCards from "./billing/BillingSummaryCards";
import BillingTable from "./billing/BillingTable";
import BillDetailModal from "./billing/BillDetailModal";
import CancelReorderModal from "./CancelReorderModal";

const BillingSection = () => {
  const { cafe } = useAuth();
  const {
    date, setDate,
    orders, summary,
    loading,
    selectedBill, setSelectedBill,
    cancelTarget, setCancelTarget,
    cancelling,
    statusFilter, setStatusFilter,
    filteredOrders,
    requestCancel,
    confirmCancel,
  } = useBilling();

  return (
    <div className="space-y-6">
      <BillingHeader
        date={date}
        onDateChange={setDate}
        orders={orders}
        summary={summary}
      />

      <BillingTable
        orders={orders}
        filteredOrders={filteredOrders}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        loading={loading}
        onView={setSelectedBill}
        onCancel={requestCancel}
        cancelling={cancelling}
      />

      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          cafe={cafe}
          onClose={() => setSelectedBill(null)}
          onRequestCancel={requestCancel}
          cancelling={cancelling}
        />
      )}

      {cancelTarget && (
        <CancelReorderModal
          orderId={cancelTarget._id}
          onConfirm={confirmCancel}
          onClose={() => { if (!cancelling) setCancelTarget(null); }}
          cancelling={cancelling}
        />
      )}
    </div>
  );
};

export default BillingSection;
