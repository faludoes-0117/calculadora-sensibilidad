import { useState, useEffect } from 'preact/hooks';
import { games } from '../data/games';

const dict = {
  en: { from: "Convert from", to: "Convert to", sens: "Sensitivity in", equiv: "Equivalent in", copy: "Copy Value", copied: "✓ Copied", dpi: "Mouse DPI", dist: "cm/360°" },
  es: { from: "Convertir de", to: "Convertir a", sens: "Sensibilidad en", equiv: "Equivalente en", copy: "Copiar Valor", copied: "✓ Copiado", dpi: "DPI del Mouse", dist: "cm/360°" },
  'es-la': { from: "Convertir de", to: "Convertir a", sens: "Sensibilidad en", equiv: "Equivalente en", copy: "Copiar Valor", copied: "✓ Copiado", dpi: "DPI del Mouse", dist: "cm/360°" },
  de: { from: "Konvertieren von", to: "Konvertieren nach", sens: "Empfindlichkeit in", equiv: "Äquivalent in", copy: "Kopieren", copied: "✓ Kopiert", dpi: "Maus-DPI", dist: "cm/360°" },
  fr: { from: "Convertir depuis", to: "Convertir vers", sens: "Sensibilité sur", equiv: "Équivalent sur", copy: "Copier", copied: "✓ Copié", dpi: "DPI de la souris", dist: "cm/360°" },
  it: { from: "Converti da", to: "Converti a", sens: "Sensibilità su", equiv: "Equivalente su", copy: "Copia", copied: "✓ Copiato", dpi: "DPI del Mouse", dist: "cm/360°" },
  zh: { from: "转换自", to: "转换至", sens: "灵敏度", equiv: "等效于", copy: "复制", copied: "✓ 已复制", dpi: "鼠标DPI", dist: "cm/360°" },
  ja: { from: "変換元", to: "変換先", sens: "感度", equiv: "相当", copy: "コピー", copied: "✓ コピー済", dpi: "マウスDPI", dist: "cm/360°" },
  ru: { from: "Конвертировать из", to: "Конвертировать в", sens: "Чувствительность в", equiv: "Эквивалент в", copy: "Копировать", copied: "✓ Скопировано", dpi: "DPI Мыши", dist: "см/360°" }
};

export default function Calculator({ initialSourceId = 'valorant', initialTargetId = 'cs2' }: { initialSourceId?: string, initialTargetId?: string }) {
  const [sourceId, setSourceId] = useState<string>(initialSourceId);
  const [targetId, setTargetId] = useState<string>(initialTargetId);

  const [sens, setSens] = useState<number>(1);
  const [sourceDpi, setSourceDpi] = useState<number>(800);
  const [targetDpi, setTargetDpi] = useState<number>(800);

  const [result, setResult] = useState<number>(0);
  const [sourceDistance, setSourceDistance] = useState<number>(0);
  const [targetDistance, setTargetDistance] = useState<number>(0);

  const [copied, setCopied] = useState<boolean>(false);
  const [lang, setLang] = useState<string>('en');

  const sourceGame = games.find((g: any) => g.id === sourceId) || games[0];
  const targetGame = games.find((g: any) => g.id === targetId) || games[1];

  useEffect(() => {
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    if (savedLang) setLang(savedLang);

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
    // Math: New Sens = (Old Sens * Old Yaw * Old DPI) / (New Yaw * New DPI)
    const exactSensRatio = (sens * sourceGame.yaw * sourceDpi) / (targetGame.yaw * targetDpi);
    setResult(Number(exactSensRatio.toFixed(4)));

    // Math: 360 Distance (cm) = 360 / (Yaw * Sens * DPI) * 2.54
    const srcDist = (360 / (sourceGame.yaw * sens * sourceDpi)) * 2.54;
    setSourceDistance(Number(srcDist.toFixed(2)));

    // To verify, the target distance should match exactly.
    const tgtDist = (360 / (targetGame.yaw * exactSensRatio * targetDpi)) * 2.54;
    setTargetDistance(Number(tgtDist.toFixed(2)));

    setCopied(false);
  }, [sens, sourceDpi, targetDpi, sourceId, targetId, sourceGame.yaw, targetGame.yaw]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSourceChange = (e: Event) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === targetId) setTargetId(sourceId);
    setSourceId(val);
  };

  const handleTargetChange = (e: Event) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === sourceId) setSourceId(targetId);
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
            {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="selector-icon">➔</div>
        <div className="selector-box">
          <label>{t.to}</label>
          <select value={targetId} onChange={handleTargetChange}>
            {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </section>

      <div className="calculator-layout wrapper">
        {/* Source Side */}
        <div className="calculator-card side-card">
          <div className="input-group">
            <label><span>{t.sens}</span> {sourceGame.name}</label>
            <input
              type="number"
              value={sens}
              onInput={(e) => setSens(parseFloat((e.target as HTMLInputElement).value) || 0)}
              step="0.01" min="0"
            />
          </div>
          <div className="input-group dpi-group">
            <label>{t.dpi}</label>
            <input
              type="number"
              value={sourceDpi}
              onInput={(e) => setSourceDpi(parseFloat((e.target as HTMLInputElement).value) || 0)}
              step="100" min="100"
            />
          </div>
          <div className="distance-metric">
            <span>{t.dist}</span>
            <p>{sourceDistance > 0 && isFinite(sourceDistance) ? sourceDistance : '0'} cm</p>
          </div>
        </div>

        {/* Target Side */}
        <div className="calculator-card side-card result-side">
          <div className="input-group">
            <label><span>{t.equiv}</span> {targetGame.name}</label>
            <div className="result-text input-like">
              <h3>{result}</h3>
            </div>
          </div>
          <div className="input-group dpi-group">
            <label>{t.dpi}</label>
            <input
              type="number"
              value={targetDpi}
              onInput={(e) => setTargetDpi(parseFloat((e.target as HTMLInputElement).value) || 0)}
              step="100" min="100"
            />
          </div>
          <div className="distance-metric">
            <span>{t.dist}</span>
            <p>{targetDistance > 0 && isFinite(targetDistance) ? targetDistance : '0'} cm</p>
          </div>
          <button className={copied ? 'btn-copy copied mt' : 'btn-copy mt'} onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>
    </div>
  );
}