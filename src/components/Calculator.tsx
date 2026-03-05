import { useState, useEffect } from 'preact/hooks';
import { games } from '../data/games';

const dict = {
  en: { from: "Convert from", to: "Convert to", sens: "Sensitivity in", equiv: "Equivalent in", copy: "Copy Value", copied: "✓ Copied" },
  es: { from: "Convertir de", to: "Convertir a", sens: "Sensibilidad en", equiv: "Equivalente en", copy: "Copiar Valor", copied: "✓ Copiado" },
  'es-la': { from: "Convertir de", to: "Convertir a", sens: "Sensibilidad en", equiv: "Equivalente en", copy: "Copiar Valor", copied: "✓ Copiado" },
  de: { from: "Konvertieren von", to: "Konvertieren nach", sens: "Empfindlichkeit in", equiv: "Äquivalent in", copy: "Kopieren", copied: "✓ Kopiert" },
  fr: { from: "Convertir depuis", to: "Convertir vers", sens: "Sensibilité sur", equiv: "Équivalent sur", copy: "Copier", copied: "✓ Copié" },
  it: { from: "Converti da", to: "Converti a", sens: "Sensibilità su", equiv: "Equivalente su", copy: "Copia", copied: "✓ Copiato" },
  zh: { from: "转换自", to: "转换至", sens: "灵敏度", equiv: "等效于", copy: "复制", copied: "✓ 已复制" },
  ja: { from: "変換元", to: "変換先", sens: "感度", equiv: "相当", copy: "コピー", copied: "✓ コピー済" },
  ru: { from: "Конвертировать из", to: "Конвертировать в", sens: "Чувствительность в", equiv: "Эквивалент в", copy: "Копировать", copied: "✓ Скопировано" }
};

export default function Calculator({ initialSourceId = 'valorant', initialTargetId = 'cs2' }: { initialSourceId?: string, initialTargetId?: string }) {
  const [sourceId, setSourceId] = useState<string>(initialSourceId);
  const [targetId, setTargetId] = useState<string>(initialTargetId);
  const [sens, setSens] = useState<number>(1);
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [lang, setLang] = useState<string>('en');

  const sourceGame = games.find((g: any) => g.id === sourceId) || games[0];
  const targetGame = games.find((g: any) => g.id === targetId) || games[1];

  useEffect(() => {
    // Read initial lang from localStorage
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    if (savedLang) setLang(savedLang);

    // Listen to lang changes from astro pages
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.lang) {
        setLang(customEvent.detail.lang);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', handleLangChange);
      return () => window.removeEventListener('languageChanged', handleLangChange);
    }
  }, []);

  useEffect(() => {
    const conversion = sens * (sourceGame.yaw / targetGame.yaw);
    setResult(Number(conversion.toFixed(4)));
    setCopied(false);
  }, [sens, sourceId, targetId, sourceGame.yaw, targetGame.yaw]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSourceChange = (e: Event) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === targetId) {
      setTargetId(sourceId); // Swap if selecting same
    }
    setSourceId(val);
  };

  const handleTargetChange = (e: Event) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === sourceId) {
      setSourceId(targetId); // Swap if selecting same
    }
    setTargetId(val);
  };

  // @ts-ignore
  const t = dict[lang] || dict['en'];

  return (
    <div className="seamless-calculator">
      <section className="selector-container">
        <div className="selector-box">
          <label>{t.from}</label>
          <select value={sourceId} onChange={handleSourceChange}>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="selector-icon">➔</div>

        <div className="selector-box">
          <label>{t.to}</label>
          <select value={targetId} onChange={handleTargetChange}>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="calculator-card">
        <div className="input-group">
          <label><span>{t.sens}</span> {sourceGame.name}</label>
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
            <span><span>{t.equiv}</span> {targetGame.name}</span>
            <h3>{result}</h3>
          </div>
          <button className={copied ? 'btn-copy copied' : 'btn-copy'} onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>
    </div>
  );
}