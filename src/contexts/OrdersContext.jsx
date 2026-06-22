/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useLocalStorage('food_orders', []);

  // Simulator to progress order status and sync to backend
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((currentOrders) => {
        let changed = false;
        const updated = currentOrders.map((order) => {
          let nextStatus = order.status;
          if (order.status === 'Pending') {
            changed = true;
            nextStatus = 'Preparing';
          } else if (order.status === 'Preparing') {
            changed = true;
            nextStatus = 'Ready for Pickup';
          } else if (order.status === 'Ready for Pickup') {
            changed = true;
            nextStatus = 'Completed';
          }

          if (nextStatus !== order.status) {
            // Sync status to backend
            fetch(`/api/orders/${order.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: nextStatus })
            }).catch(err => console.error(`Failed to sync status for ${order.id} to backend:`, err));

            return { ...order, status: nextStatus };
          }
          return order;
        });
        return changed ? updated : currentOrders;
      });
    }, 20000); // Progress order every 20 seconds for demo responsiveness

    return () => clearInterval(interval);
  }, [setOrders]);

  const placeOrder = async (items, pickupTime, total, customerName = 'Canteen Customer', role = 'Student', identifier = '') => {
    const dateStr = new Date().toISOString().split('T')[0];
    const orderId = `ORD${Math.floor(100 + Math.random() * 900)}`; // e.g. ORD123
    
    const newOrder = {
      id: orderId,
      date: dateStr,
      status: 'Pending',
      total: total,
      items: items,
      pickupTime: pickupTime,
      customerName,
      role,
      identifier
    };

    setOrders((prev) => [newOrder, ...prev]);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          customerName,
          role,
          identifier,
          pickupTime,
          items,
          total
        })
      });
    } catch (error) {
      console.error('Failed to save order to backend:', error);
    }

    return newOrder;
  };

  const cancelOrder = async (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId && order.status === 'Pending'
          ? { ...order, status: 'Cancelled' }
          : order
      )
    );

    try {
      await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to cancel order on backend:', error);
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};
