import { useState, useEffect } from 'preact/hooks';
import { games } from '../data/games';

export default function Calculator({ sourceId, targetId }: { sourceId: string, targetId: string }) {
  const [sens, setSens] = useState<number>(1);
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const sourceGame = games.find((g: any) => g.id === sourceId) || games[0];
  const targetGame = games.find((g: any) => g.id === targetId) || games[1];

  useEffect(() => {
    const conversion = sens * (sourceGame.yaw / targetGame.yaw);
    setResult(Number(conversion.toFixed(4)));
    setCopied(false);
  }, [sens, sourceId, targetId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="calculator-card">
      <div className="input-group">
        <label><span id="ui-sens">Sensitivity in</span> {sourceGame.name}</label>
        <input 
          type="number" 
          value={sens} 
          onInput={(e) => setSens(parseFloat((e.target as HTMLInputElement).value) || 0)} 
          step="0.01"
          min="0"
        />
      </div>
      
      <div className="result-group">
        <div className="result-text">
          <span><span id="ui-equiv">Equivalent in</span> {targetGame.name}</span>
          <h3>{result}</h3>
        </div>
        <button className={copied ? 'btn-copy copied' : 'btn-copy'} onClick={handleCopy} id="ui-btn">
          {copied ? '✓ Copied' : 'Copy Value'}
        </button>
      </div>
    </div>
  );
}