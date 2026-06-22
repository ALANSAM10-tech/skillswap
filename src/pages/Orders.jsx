import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, HelpCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import OrderCard from '../components/order/OrderCard';

export default function Orders() {
  const { orders, cancelOrder } = useOrders();
  const [activeTab, setActiveTab] = useState('active'); // active, history

  // Filter orders
  const activeOrders = orders.filter(
    (order) => order.status !== 'Completed' && order.status !== 'Cancelled'
  );

  const historyOrders = orders.filter(
    (order) => order.status === 'Completed' || order.status === 'Cancelled'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Your Orders</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Track active canteen orders in real-time or reorder your previous favorites.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('active')}
            className="btn"
            style={{
              padding: '0.45rem 1.25rem',
              fontSize: '0.85rem',
              backgroundColor: activeTab === 'active' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'active' ? 'white' : 'var(--text-main)',
              border: 'none',
              borderRadius: '20px'
            }}
          >
            Active Orders ({activeOrders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className="btn"
            style={{
              padding: '0.45rem 1.25rem',
              fontSize: '0.85rem',
              backgroundColor: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'history' ? 'white' : 'var(--text-main)',
              border: 'none',
              borderRadius: '20px'
            }}
          >
            Order History ({historyOrders.length})
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeTab === 'active' ? (
          activeOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--secondary-glow)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClipboardList size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No Active Orders</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '350px' }}>
                You have no active food items in preparation. Head over to the menu and satisfy your hunger!
              </p>
              <Link to="/menu" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                Browse Menu
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={cancelOrder}
                />
              ))}
            </div>
          )
        ) : (
          historyOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HelpCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No Previous Orders</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '350px' }}>
                No completed or cancelled order records found. When you purchase food items, they will appear in this history tab.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {historyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={cancelOrder}
                />
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
}
