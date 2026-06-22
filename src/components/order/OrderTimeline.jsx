

const STEPS = [
  { key: 'Pending', label: 'Ordered' },
  { key: 'Preparing', label: 'Preparing' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup' },
  { key: 'Completed', label: 'Completed' }
];

export default function OrderTimeline({ status }) {
  if (status === 'Cancelled') {
    return (
      <div style={{
        padding: '0.75rem 1.25rem',
        backgroundColor: 'var(--danger-glow)',
        border: '1px solid var(--danger)',
        color: 'var(--danger)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: '600',
        fontSize: '0.9rem',
        textAlign: 'center',
        margin: '1rem 0'
      }}>
        This order has been Cancelled.
      </div>
    );
  }

  // Get index of current status
  const currentStepIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <div className="order-timeline">
      {STEPS.map((step, index) => {
        let stateClass = ''; // '', 'active', 'completed'
        
        if (index === currentStepIndex) {
          stateClass = 'active';
        } else if (index < currentStepIndex) {
          stateClass = 'completed';
        }

        return (
          <div key={step.key} className={`timeline-step ${stateClass}`}>
            <div className="step-node"></div>
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
