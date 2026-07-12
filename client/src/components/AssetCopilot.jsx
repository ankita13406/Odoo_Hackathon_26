import { useState } from 'react';
import API from '../context/AuthContext';

export default function AssetCopilot() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/copilot/ask', { question });
      setAnswer(data.data);
    } finally { setLoading(false); }
  };

  return (
    <div className="border rounded-xl p-4 mb-4 bg-gray-50">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask AssetFlow... e.g. Where is Laptop AF-0012?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
        />
        <button onClick={ask} className="bg-teal-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? '...' : 'Ask'}
        </button>
      </div>

      {answer?.intent === 'WHERE_IS_ASSET' && answer.found && (
        <div className="mt-3 bg-white border rounded p-3">
          <p className="font-medium">Allocated to {answer.holderName || 'Unassigned'}</p>
          <p className="text-sm text-gray-600">{answer.department} Department</p>
          <p className="text-sm text-gray-600">Condition: {answer.condition}</p>
          {answer.expectedReturn && <p className="text-sm text-gray-600">Expected Return: {new Date(answer.expectedReturn).toLocaleDateString()}</p>}
        </div>
      )}
      {answer?.intent === 'OVERDUE_ASSETS' && (
        <div className="mt-3 bg-white border rounded p-3">
          {answer.assets.length === 0 ? <p>No overdue assets 🎉</p> :
            answer.assets.map(a => <p key={a.assetTag}>{a.assetTag} — due {new Date(a.dueDate).toLocaleDateString()}</p>)}
        </div>
      )}
      {answer?.intent === 'IDLE_BY_DEPARTMENT' && (
        <div className="mt-3 bg-white border rounded p-3">
          {answer.result ? <p>{answer.result.location} has the most idle assets ({answer.result.idleCount})</p> : <p>No idle assets found.</p>}
        </div>
      )}
      {answer?.intent === 'UNKNOWN' && <p className="mt-3 text-gray-500">{answer.message}</p>}
    </div>
  );
}