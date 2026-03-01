import { useState, useEffect } from 'preact/hooks';
import { games } from '../data/games';

export default function Calculator({ sourceId, targetId }: { sourceId: string, targetId: string }) {
  const [sens, setSens] = useState<number>(1);
  const [result, setResult] = useState<number>(0);

  const sourceGame = games.find((g: any) => g.id === sourceId) || games[0];
const targetGame = games.find((g: any) => g.id === targetId) || games[1];

  useEffect(() => {
    const conversion = sens * (sourceGame.yaw / targetGame.yaw);
    setResult(Number(conversion.toFixed(4)));
  }, [sens, sourceId, targetId]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px' }}>
        Sensibilidad en {sourceGame.name}:
        <input 
          type="number" 
          value={sens} 
          onInput={(e) => setSens(parseFloat((e.target as HTMLInputElement).value))} 
          step="0.01"
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </label>
      <h3 style={{ color: '#2c3e50' }}>Sensibilidad en {targetGame.name}: {result}</h3>
    </div>
  );
}