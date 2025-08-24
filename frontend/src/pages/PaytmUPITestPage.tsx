import React, { useCallback, useState } from 'react';

// Minimal ambient declaration for Paytm Checkout JS
declare global {
  interface Window {
    Paytm?: any;
  }
}

// Dynamically load the Paytm CheckoutJS script for given MID and baseUrl
async function loadPaytmScript(mid: string, baseUrl: string): Promise<void> {
  const id = `paytm-checkoutjs-${mid}`;
  if (document.getElementById(id)) return; // already loaded

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.type = 'text/javascript';
    script.async = true;
    // Example (staging): https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/<MID>.js
    script.src = `${baseUrl.replace(/\/$/, '')}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paytm CheckoutJS'));
    document.body.appendChild(script);
  });
}

export default function PaytmUPITestPage() {
  // User-configurable fields
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:5000/api/payment');
  const [mid, setMid] = useState<string>(''); // Set your staging MID here or via input
  const [baseUrl, setBaseUrl] = useState<string>('https://securegw-stage.paytm.in');

  // Payment details
  const [amount, setAmount] = useState<string>('100');
  const [orderId, setOrderId] = useState<string>(() => `ORDER_${Date.now()}`);
  const [customerId, setCustomerId] = useState<string>('CUST001');

  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>('');
  const [error, setError] = useState<string>('');

  const appendLog = useCallback((msg: string) => {
    setLog(prev => `${prev}${prev ? '\n' : ''}${msg}`);
  }, []);

  const initiatePaytm = useCallback(async () => {
    setLoading(true);
    setError('');
    setLog('');

    try {
      if (!mid) throw new Error('Please enter your Paytm MID');

      appendLog(`Calling backend: ${backendUrl}`);
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: String(amount),
          orderId,
          customerId
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || `Backend error (${response.status})`);
      }

      const data = await response.json();
      // Support both shapes: { body: { txnToken } } or { data: { txnToken } }
      const txnToken = data?.body?.txnToken || data?.data?.txnToken;
      if (!txnToken) throw new Error('txnToken not found in backend response');

      appendLog('txnToken received. Loading CheckoutJS...');
      await loadPaytmScript(mid, baseUrl);
      if (!window.Paytm || !window.Paytm.CheckoutJS) {
        throw new Error('Paytm CheckoutJS not available after script load');
      }

      const config = {
        root: '',
        flow: 'DEFAULT', // DEFAULT or HYBRID
        data: {
          orderId: orderId,
          token: txnToken,
          tokenType: 'TXN_TOKEN',
          amount: String(amount)
        },
        merchant: { mid },
        handler: {
          transactionStatus: (paymentStatus: any) => {
            appendLog(`Transaction status: ${JSON.stringify(paymentStatus)}`);
          },
          notifyMerchant: (eventName: string, eventData: any) => {
            appendLog(`Event: ${eventName}, Data: ${JSON.stringify(eventData)}`);
          }
        }
      } as any;

      appendLog('Initializing Paytm CheckoutJS...');
      await window.Paytm.CheckoutJS.init(config);
      appendLog('Invoking Paytm Checkout...');
      window.Paytm.CheckoutJS.invoke();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unexpected error');
      appendLog(`Error: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, amount, orderId, customerId, mid, baseUrl, appendLog]);

  const regenerateOrderId = () => setOrderId(`ORDER_${Date.now()}`);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Paytm UPI Test (Custom Backend Endpoint)</h1>

      <div className="space-y-4 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Backend URL</span>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="http://localhost:5000/api/payment"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Paytm MID</span>
            <input
              type="text"
              value={mid}
              onChange={(e) => setMid(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="DIY12386817555501617"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Paytm Base URL</span>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="https://securegw-stage.paytm.in"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Amount (INR)</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Order ID</span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button onClick={regenerateOrderId} className="px-3 py-2 bg-gray-100 rounded border">New</button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Customer ID</span>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
        </div>

        <button
          onClick={initiatePaytm}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Processing…' : 'Pay with Paytm UPI'}
        </button>

        {error && (
          <div className="mt-3 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
        )}

        {log && (
          <pre className="mt-3 p-3 rounded bg-gray-900 text-gray-100 text-xs overflow-auto max-h-64 whitespace-pre-wrap">{log}</pre>
        )}
      </div>
    </div>
  );
}