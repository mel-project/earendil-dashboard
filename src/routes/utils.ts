export async function rpcRequest(method, params = []) {
  const response = await fetch('http://62.210.93.59:33333/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error: status ${response.status}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error.message || 'RPC call failed');
  }

  return result.result;
}
