import React, { useEffect, useMemo, useState } from 'react';
import vendorOrdersService, { VendorOrder, VendorItemStatus } from '../services/vendorOrdersService';
import { toast } from 'react-hot-toast';

const statusOptions: VendorItemStatus[] = ['packaging','dispatched','shipped','out_for_delivery','delivered'];

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await vendorOrdersService.list(filter ? { status: filter } : undefined);
      setOrders(res.orders);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleUpdate = async (orderId: string, itemId: string, status: VendorItemStatus) => {
    const t = toast.loading('Updating status...');
    try {
      await vendorOrdersService.updateItemStatus(orderId, itemId, status);
      toast.success('Updated', { id: t });
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update', { id: t });
    }
  };

  const StatusSelect = ({ value, onChange }: { value?: VendorItemStatus; onChange: (v: VendorItemStatus) => void }) => (
    <select className="border rounded px-2 py-1 text-sm" value={value || 'packaging'} onChange={e => onChange(e.target.value as VendorItemStatus)}>
      {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
    </select>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select className="border rounded px-2 py-1 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-gray-500">Order</div>
                  <div className="font-semibold">{order.orderNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="font-medium">{order.user?.name} <span className="text-gray-400">({order.user?.email})</span></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium capitalize">{order.status.replace(/_/g,' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-medium">${order.totalPrice.toFixed(2)}</div>
                </div>
                <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-4 divide-y">
                {order.orderItems.map(item => (
                  <div key={item._id} className="py-3 flex flex-wrap items-center gap-3">
                    <img src={item.image || ''} alt="" className="w-12 h-12 object-cover rounded border" onError={(e:any)=>{e.currentTarget.style.display='none';}} />
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-medium">{item.product?.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity} • ${item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusSelect value={item.vendorStatus} onChange={(v)=>handleUpdate(order._id, item._id, v)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}