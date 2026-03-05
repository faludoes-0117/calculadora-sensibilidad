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

export default function Calculator({ sourceId: serverSourceId = 'valorant', targetId: serverTargetId = 'cs2' }: { sourceId?: string, targetId?: string }) {
  const [sourceId, setSourceId] = useState<string>(serverSourceId);
  const [targetId, setTargetId] = useState<string>(serverTargetId);

  const [sens, setSens] = useState<number>(1);
  const [sourceDpi, setSourceDpi] = useState<number>(800);
  const [targetDpi, setTargetDpi] = useState<number>(800);

  const [copied, setCopied] = useState<boolean>(false);
  const [lang, setLang] = useState<string>('en');

  const sourceGame = games.find((g: any) => g.id === sourceId) || games[0];
  const targetGame = games.find((g: any) => g.id === targetId) || games[1];

  // Perform calculations synchronously for both SSR and CSR
  const exactSensRatio = (sens * sourceGame.yaw * sourceDpi) / (targetGame.yaw * targetDpi);
  const result = Number(exactSensRatio.toFixed(4)) || 0;

  const sourceDistance = Number(((360 / (sourceGame.yaw * (sens || 1) * (sourceDpi || 800))) * 2.54).toFixed(2));

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

      <div className="calculator-card">
        <div className="input-group">
          <label><span>{t.sens}</span> {sourceGame.name}</label>
          <div className="dpi-row">
            <input
              type="number"
              value={sens}
              onInput={(e) => setSens(parseFloat((e.target as HTMLInputElement).value) || 0)}
              step="0.01" min="0"
              className="flex-2"
            />
            <div className="dpi-input">
              <span className="dpi-label">{t.dpi}</span>
              <input
                type="number"
                value={sourceDpi}
                onInput={(e) => setSourceDpi(parseFloat((e.target as HTMLInputElement).value) || 0)}
                step="50" min="100"
              />
            </div>
          </div>
        </div>

        <div className="cm-distance">
          {t.dist}: <strong>{sourceDistance > 0 && isFinite(sourceDistance) ? sourceDistance : '0'} cm</strong>
        </div>

        <div className="result-group">
          <div className="result-text">
            <span><span>{t.equiv}</span> {targetGame.name}</span>
            <div className="dpi-row mt-1">
              <h3>{result}</h3>
              <div className="dpi-input">
                <span className="dpi-label">{t.dpi}</span>
                <input
                  type="number"
                  value={targetDpi}
                  onInput={(e) => setTargetDpi(parseFloat((e.target as HTMLInputElement).value) || 0)}
                  step="50" min="100"
                />
              </div>
            </div>
          </div>
          <button className={copied ? 'btn-copy copied' : 'btn-copy'} onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>
    </div>
  );
}