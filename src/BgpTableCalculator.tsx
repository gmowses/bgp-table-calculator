import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Database, Info } from 'lucide-react'

const translations = {
  en: {
    title: 'BGP Table Memory Calculator',
    subtitle: 'Estimate RAM needed for BGP routing tables. Compare full table, default route, and partial table scenarios across platforms.',
    ipVersion: 'Address Family',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    prefixCount: 'Prefix Count',
    currentTable: 'Current full BGP table',
    platform: 'Platform / Memory per Prefix',
    scenario: 'Table Scenario',
    scenarios: {
      full: 'Full Table',
      default: 'Default Route Only',
      partial: 'Partial Table (Top N)',
    },
    partialN: 'Keep Top N Prefixes',
    calculate: 'Calculate',
    results: 'Memory Estimates',
    totalRam: 'Total RAM (routing table only)',
    prefixes: 'Prefixes',
    perPrefix: 'Memory/Prefix',
    note: 'Note: these are routing table estimates only. Add OS, control plane, and feature overhead (typically 2-4x for Cisco, varies by platform). Actual values depend on BGP attributes stored per prefix.',
    platforms: [
      { name: 'Cisco IOS (classic)', bytesPerPrefix: 500 },
      { name: 'Cisco IOS-XE/XR', bytesPerPrefix: 450 },
      { name: 'Juniper JunOS', bytesPerPrefix: 600 },
      { name: 'MikroTik RouterOS', bytesPerPrefix: 400 },
      { name: 'FRRouting (FRR)', bytesPerPrefix: 380 },
      { name: 'Arista EOS', bytesPerPrefix: 480 },
      { name: 'Nokia SR-OS', bytesPerPrefix: 550 },
    ],
    defaults: {
      v4Full: 950000,
      v6Full: 200000,
    },
    builtBy: 'Built by',
    references: 'References',
    refList: [
      'BGP Table Report – https://bgp.he.net',
      'Potaroo BGP Table Data – https://bgp.potaroo.net',
      'RIPE NCC Routing Information Service – https://ris.ripe.net',
    ],
  },
  pt: {
    title: 'Calculadora de Memoria Tabela BGP',
    subtitle: 'Estime a RAM necessaria para tabelas de roteamento BGP. Compare cenarios de tabela completa, rota default e tabela parcial entre plataformas.',
    ipVersion: 'Familia de Enderecos',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    prefixCount: 'Contagem de Prefixos',
    currentTable: 'Tabela BGP completa atual',
    platform: 'Plataforma / Memoria por Prefixo',
    scenario: 'Cenario de Tabela',
    scenarios: {
      full: 'Tabela Completa',
      default: 'Apenas Rota Default',
      partial: 'Tabela Parcial (Top N)',
    },
    partialN: 'Manter Top N Prefixos',
    calculate: 'Calcular',
    results: 'Estimativas de Memoria',
    totalRam: 'RAM Total (apenas tabela de roteamento)',
    prefixes: 'Prefixos',
    perPrefix: 'Memoria/Prefixo',
    note: 'Nota: estas sao estimativas apenas da tabela de roteamento. Adicione overhead do SO, plano de controle e funcionalidades (tipicamente 2-4x para Cisco, varia por plataforma). Valores reais dependem dos atributos BGP armazenados por prefixo.',
    platforms: [
      { name: 'Cisco IOS (classico)', bytesPerPrefix: 500 },
      { name: 'Cisco IOS-XE/XR', bytesPerPrefix: 450 },
      { name: 'Juniper JunOS', bytesPerPrefix: 600 },
      { name: 'MikroTik RouterOS', bytesPerPrefix: 400 },
      { name: 'FRRouting (FRR)', bytesPerPrefix: 380 },
      { name: 'Arista EOS', bytesPerPrefix: 480 },
      { name: 'Nokia SR-OS', bytesPerPrefix: 550 },
    ],
    defaults: {
      v4Full: 950000,
      v6Full: 200000,
    },
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: [
      'BGP Table Report – https://bgp.he.net',
      'Potaroo BGP Table Data – https://bgp.potaroo.net',
      'RIPE NCC Routing Information Service – https://ris.ripe.net',
    ],
  },
} as const

type Lang = keyof typeof translations

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function fmtNum(n: number): string {
  return n.toLocaleString()
}

function ramColor(bytes: number): string {
  const mb = bytes / 1024 / 1024
  if (mb < 50) return '#10b981'
  if (mb < 256) return '#f59e0b'
  return '#ef4444'
}

export default function BgpTableCalculator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [af, setAf] = useState<'v4' | 'v6'>('v4')
  const [scenario, setScenario] = useState<'full' | 'default' | 'partial'>('full')
  const [customCount, setCustomCount] = useState(950000)
  const [partialN, setPartialN] = useState(100000)
  const [calculated, setCalculated] = useState(false)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const defaultCount = af === 'v4' ? t.defaults.v4Full : t.defaults.v6Full

  const effectivePrefixes = (): number => {
    if (scenario === 'default') return 1
    if (scenario === 'partial') return partialN
    return customCount
  }

  const eff = effectivePrefixes()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <span className="font-semibold">BGP Table Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/bgp-table-calculator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
            {/* AF selector */}
            <div>
              <label className="text-xs text-zinc-500 block mb-2">{t.ipVersion}</label>
              <div className="flex gap-2">
                {(['v4', 'v6'] as const).map(v => (
                  <button key={v} onClick={() => { setAf(v); setCustomCount(v === 'v4' ? t.defaults.v4Full : t.defaults.v6Full) }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={af === v ? { backgroundColor: '#f97316', color: 'white' } : { border: '1px solid rgb(228 228 231)', color: 'rgb(113 113 122)' }}>
                    {v === 'v4' ? t.ipv4 : t.ipv6}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario */}
            <div>
              <label className="text-xs text-zinc-500 block mb-2">{t.scenario}</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(t.scenarios) as Array<keyof typeof t.scenarios>).map(s => (
                  <button key={s} onClick={() => setScenario(s as 'full' | 'default' | 'partial')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={scenario === s ? { backgroundColor: '#f97316', color: 'white' } : { border: '1px solid rgb(228 228 231)', color: 'rgb(113 113 122)' }}>
                    {t.scenarios[s]}
                  </button>
                ))}
              </div>
            </div>

            {scenario === 'full' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">{t.prefixCount}</label>
                  <span className="text-sm font-bold text-orange-500">{fmtNum(customCount)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCustomCount(c => Math.max(1000, c - 50000))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold">-</button>
                  <input type="range" min={10000} max={1200000} step={10000} value={customCount} onChange={e => setCustomCount(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-orange-500" />
                  <button onClick={() => setCustomCount(c => Math.min(1200000, c + 50000))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold">+</button>
                </div>
                <button onClick={() => setCustomCount(defaultCount)} className="mt-2 text-xs text-orange-500 hover:underline">{t.currentTable} ({fmtNum(defaultCount)})</button>
              </div>
            )}

            {scenario === 'partial' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">{t.partialN}</label>
                  <span className="text-sm font-bold text-orange-500">{fmtNum(partialN)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPartialN(n => Math.max(1000, n - 10000))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold">-</button>
                  <input type="range" min={1000} max={950000} step={1000} value={partialN} onChange={e => setPartialN(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-orange-500" />
                  <button onClick={() => setPartialN(n => Math.min(950000, n + 10000))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold">+</button>
                </div>
              </div>
            )}

            <button onClick={() => setCalculated(true)} className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
              <Database size={15} />{t.calculate}
            </button>
          </div>

          {calculated && (
            <div className="space-y-4">
              <h2 className="font-semibold">{t.results}</h2>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{t.platform}</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">{t.perPrefix}</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">{t.prefixes}</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">{t.totalRam}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.platforms.map((p, i) => {
                      const total = p.bytesPerPrefix * eff
                      const color = ramColor(total)
                      return (
                        <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-500 text-xs">{p.bytesPerPrefix} B</td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-500 text-xs">{fmtNum(eff)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold font-mono text-sm" style={{ color }}>{fmtBytes(total)}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Comparison bar */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <h3 className="text-sm font-semibold">Relative Memory Usage</h3>
                {(() => {
                  const maxVal = Math.max(...t.platforms.map(p => p.bytesPerPrefix * eff))
                  return t.platforms.map((p, i) => {
                    const total = p.bytesPerPrefix * eff
                    const pct = (total / maxVal) * 100
                    const color = ramColor(total)
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
                          <span className="font-mono font-semibold" style={{ color }}>{fmtBytes(total)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
                <Info size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500">{t.note}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
