import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Terminal,
  Download,
  History,
  ArrowLeft,
  AlertTriangle,
  Gavel,
  Wrench,
  ArrowRight,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyText } from '@/lib/clipboard';
import {
  computeLabMetrics,
  formatLabRowTime,
  highlightTokenInText,
  rowSeverityClass,
  sortLabRowsByTime,
} from '@/lib/labScenario';
import { useLabScenario } from '@/hooks/useLabScenario';
import { MAX_QUERY_LEN, validateSecureQueryInput } from '@/lib/secureInput';
import { filterLabRows, isLabQueryFiltered, resolveLabAggregates } from '@/lib/splQuery';
import { motion } from 'motion/react';
import { labs } from '@/data/portfolio';

export const Labs = () => {
  const navigate = useNavigate();
  const { load, scenario, labId, scenarioIds, setLabId, dataRevision } = useLabScenario();
  const [copyStatus, setCopyStatus] = useState('');
  /** Per-lab SPL drafts so switching tabs never filters rows with another lab's query. */
  const [queryByLab, setQueryByLab] = useState<Record<string, string>>({});
  const [queryError, setQueryError] = useState('');
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!scenario) return;
    const draft = queryByLab[scenario.id] ?? scenario.query;
    const check = validateSecureQueryInput(draft);
    setQueryError(check.ok ? '' : check.error);
  }, [scenario, queryByLab]);

  const labMeta = useMemo(() => labs.find((l) => l.id === labId), [labId]);

  const queryText = scenario ? (queryByLab[scenario.id] ?? scenario.query) : '';

  const queryValid = useMemo(() => validateSecureQueryInput(queryText), [queryText]);

  const filteredView = useMemo(() => {
    if (!scenario) return null;
    if (!queryValid.ok) {
      return {
        filteredRows: [] as typeof scenario.rows,
        aggregates: [] as typeof scenario.aggregates,
        metrics: computeLabMetrics(scenario, { rows: [], aggregates: [] }),
        isFiltered: false,
        queryBlocked: true,
        aggregateSource: 'sample' as const,
      };
    }
    const activeQuery = queryValid.value;
    const filteredRows = sortLabRowsByTime(filterLabRows(scenario.rows, activeQuery));
    const isFiltered = isLabQueryFiltered(scenario.rows, activeQuery);
    const { aggregates, source: aggregateSource } = resolveLabAggregates(
      scenario.rows,
      activeQuery,
      scenario.aggregates,
      scenario.id,
      scenario.aggregateLabel,
    );
    const metrics = computeLabMetrics(scenario, { rows: filteredRows, aggregates });
    return { filteredRows, aggregates, metrics, isFiltered, aggregateSource, queryBlocked: false };
  }, [scenario, queryValid]);

  const onQueryChange = (value: string) => {
    if (!scenario) return;
    const check = validateSecureQueryInput(value);
    setQueryByLab((prev) => ({ ...prev, [scenario.id]: check.value }));
    setQueryError(check.ok ? '' : check.error);
  };

  const onCopyQuery = async (query: string) => {
    const ok = await copyText(query);
    setCopyStatus(ok ? 'Query copied to clipboard.' : 'Could not copy — select and copy manually.');
    if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopyStatus('');
      copyTimerRef.current = null;
    }, 3000);
  };

  const onApplyToolboxSnippet = (query: string) => {
    onQueryChange(query);
    void onCopyQuery(query);
  };

  const onExportJson = () => {
    if (!scenario || !filteredView?.metrics) return;
    const { metrics } = filteredView;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            scenario,
            metrics: {
              totalEvents: metrics.totalEvents,
              queryTimeSec: metrics.queryTimeSec,
              narrativeWeight: metrics.narrativeWeight,
            },
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.id}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (load.status === 'error' || !scenario) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <p className="font-mono text-sm text-error-fixed">
          Could not load lab data{load.status === 'error' ? `: ${load.message}` : ''}.
        </p>
        <button type="button" className="terminal-button w-fit" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!filteredView) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[320px] font-mono text-sm text-on-surface-variant">
        <Loader2 className="animate-spin text-primary-fixed" size={28} aria-hidden />
        <p>Preparing scenario view…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="font-mono text-[11px] text-on-surface-variant border border-outline-variant/40 rounded px-3 py-2 bg-surface-variant/20 max-w-3xl">
        Scenario rows are bundled from{' '}
        <code className="text-primary-fixed">src/data/lab-scenarios.json</code> (revision{' '}
        <span className="text-secondary-fixed">{dataRevision}</span>
        {scenario?.rows.length ? (
          <>
            {' '}
            · earliest _time{' '}
            <span className="text-secondary-fixed">
              {formatLabRowTime(sortLabRowsByTime(scenario.rows)[0]!.time)}
            </span>
          </>
        ) : null}
        ). After editing JSON, restart <code className="text-primary-fixed">npm run dev</code> or run{' '}
        <code className="text-primary-fixed">npm run build</code> before preview/deploy — not a live fetch. SPL filters rows
        in-browser only.
        {filteredView.queryBlocked ? (
          <span className="text-error-fixed"> Query blocked — results withheld until input is safe.</span>
        ) : filteredView.isFiltered ? (
          <span className="text-primary-fixed"> Showing filtered view ({filteredView.filteredRows.length} rows).</span>
        ) : (
          <span className="text-on-surface-variant/80"> Showing full curated dataset ({filteredView.filteredRows.length} rows).</span>
        )}
      </p>

      {copyStatus ? (
        <p className="font-mono text-[11px] text-primary-fixed" role="status">
          {copyStatus}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lab scenarios">
        {scenarioIds.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === labId}
            onClick={() => setLabId(id)}
            className={cn(
              'font-mono text-[10px] px-3 py-1.5 border rounded transition-colors',
              id === labId
                ? 'border-primary-fixed text-primary-fixed bg-primary-fixed/10'
                : 'border-outline-variant/50 text-on-surface-variant hover:border-primary-fixed/40'
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full border-b border-primary-fixed/20 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-primary-fixed/10 text-primary-fixed font-mono text-[10px] border border-primary-fixed/30 rounded">
              {scenario.environmentLabel}
            </span>
            <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant font-mono text-[10px] border border-outline-variant/50 rounded flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" aria-hidden />
              {scenario.statusLabel}
            </span>
            {labMeta ? (
              <span className="px-2 py-0.5 font-mono text-[10px] text-on-surface-variant border border-outline-variant/40 rounded">
                {labMeta.category} · {labMeta.difficulty}
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-primary tracking-tight">{scenario.headline}</h1>
          <p className="font-mono text-xs text-on-surface-variant mt-2">{scenario.title}</p>
          <p className="font-mono text-[11px] text-on-surface-variant/90 mt-3 max-w-2xl leading-relaxed">{scenario.recruiterHint}</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            className="font-mono text-xs text-on-surface-variant hover:text-primary-fixed flex items-center gap-2"
            onClick={() => {
              if (scenario) {
                setQueryByLab((prev) => {
                  const next = { ...prev };
                  delete next[scenario.id];
                  return next;
                });
                setQueryError('');
              }
              setLabId(scenarioIds[0] ?? 'LAB_01');
            }}
          >
            <History size={16} aria-hidden /> Reset view
          </button>
          <button
            type="button"
            className="terminal-button flex items-center gap-2 flex-1 md:flex-none justify-center"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} aria-hidden /> Close scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bento-card rounded-none overflow-hidden group">
            <div className="bg-surface-variant/30 border-b border-primary-fixed/20 px-4 py-2 flex items-center gap-3">
              <Search size={14} className="text-primary-fixed" aria-hidden />
              <span className="font-mono text-[10px] font-bold text-primary-fixed tracking-widest uppercase">SPL_QUERY_INPUT</span>
            </div>
            <div className="p-4 bg-background/50 font-mono text-sm leading-relaxed text-on-surface">
              <div className="flex gap-3">
                <span className="text-secondary-fixed opacity-70 pt-1 shrink-0">&gt;</span>
                <textarea
                  id="spl-query"
                  name="spl-query"
                  value={queryText}
                  onChange={(e) => onQueryChange(e.target.value)}
                  spellCheck={false}
                  rows={4}
                  maxLength={MAX_QUERY_LEN}
                  aria-label="SPL query input"
                  aria-invalid={queryError ? true : undefined}
                  aria-describedby={queryError ? 'spl-query-error' : undefined}
                  className={cn(
                    'outline-none w-full whitespace-pre-wrap bg-transparent resize-y min-h-20 text-on-surface',
                    'focus-visible:ring-1 focus-visible:ring-primary-fixed/50 rounded-sm',
                    queryError && 'ring-1 ring-error-fixed/60'
                  )}
                />
              </div>
              {queryError ? (
                <p id="spl-query-error" className="mt-2 text-[11px] text-error-fixed font-bold" role="alert">
                  {queryError} Results are withheld until the query is safe.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-on-surface-variant/70">
                  Search head filters rows; pipelines use{' '}
                  <code className="text-primary-fixed/90">{scenario.aggregateLabel}</code>. Snippets live in the{' '}
                  {scenario.id} toolbox.
                </p>
              )}
            </div>
          </div>

          <div className="bento-card rounded-none flex flex-col min-h-[400px]">
            <div className="border-b border-primary-fixed/20 px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start bg-surface-variant/20">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <Terminal size={18} className="text-primary-fixed shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <h2 className="font-mono text-xs font-bold text-primary-fixed tracking-widest uppercase">
                    RAW_LOG_STREAM // RESULTS
                  </h2>
                  <p className="mt-1 text-[10px] text-on-surface-variant/80 max-w-xl leading-relaxed">
                    Sample table: {scenario.rows.length} curated events (fixed 2024-10-27 UTC). Row content switches with
                    the active lab tab; EVENTS counts visible rows only — not SIEM index volume.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 font-mono text-[10px] shrink-0">
                <span className="text-on-surface-variant">
                  EVENTS:{' '}
                  <span className={cn('text-secondary-fixed', filteredView.queryBlocked && 'text-error-fixed')}>
                    {filteredView.metrics.totalEvents.toLocaleString()}
                  </span>
                  {filteredView.queryBlocked ? (
                    <span className="text-error-fixed"> (blocked)</span>
                  ) : filteredView.isFiltered ? (
                    <span className="text-on-surface-variant/60"> (filtered)</span>
                  ) : null}
                </span>
                {filteredView.metrics.eventSpanSec ? (
                  <span className="text-on-surface-variant" title="UTC span from earliest to latest _time in results">
                    SPAN: <span className="text-on-surface">{filteredView.metrics.eventSpanSec}s</span>
                  </span>
                ) : null}
                <span className="text-on-surface-variant" title="Simulated query latency">
                  LATENCY: <span className="text-on-surface">{filteredView.metrics.queryTimeSec}s</span>
                </span>
                <button
                  type="button"
                  onClick={onExportJson}
                  aria-label="Export scenario JSON"
                  title="Download scenario + computed metrics as JSON"
                  className="text-primary-fixed hover:text-secondary-fixed transition-colors"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-x-auto no-scrollbar font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface/40 border-b border-outline-variant/30">
                    <th className="pb-3 pr-4 font-normal">Time (UTC)</th>
                    <th className="pb-3 pr-4 font-normal">Event Type</th>
                    <th className="pb-3 font-normal">Raw Data</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface-variant">
                  {filteredView.filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-on-surface-variant">
                        {filteredView.queryBlocked
                          ? 'Query blocked for security. Remove disallowed patterns or use a toolbox snippet.'
                          : 'No rows match this query. Try a toolbox snippet or broaden keywords (e.g. fail, an IP, or sourcetype).'}
                      </td>
                    </tr>
                  ) : null}
                  {filteredView.filteredRows.map((log, i) => (
                    <tr key={`${scenario.id}-${log.time}-${log.type}-${i}`} className="border-b border-outline-variant/10">
                      <td className="py-3 pr-4 text-on-surface/60 whitespace-nowrap tabular-nums">
                        {formatLabRowTime(log.time)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold border', rowSeverityClass(log))}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono break-all sm:break-normal">
                        {highlightTokenInText(log.data, scenario.highlightIp).map((chunk, pi) => (
                          <Fragment key={pi}>
                            {chunk.before}
                            {chunk.match ? (
                              <span className="text-primary-fixed font-bold">{chunk.match}</span>
                            ) : null}
                          </Fragment>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-10 pt-6 border-t border-primary-fixed/20">
                <div className="text-primary-fixed mb-2 font-bold flex flex-wrap items-center gap-2">
                  <span className="text-secondary-fixed">&gt;&gt;</span>
                  <span>AGGREGATED_RESULTS: {scenario.aggregateLabel}</span>
                  {!filteredView.queryBlocked ? (
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                        filteredView.aggregateSource === 'sample'
                          ? 'text-on-surface-variant border-outline-variant/50 bg-surface-variant/30'
                          : 'text-secondary-fixed border-secondary-fixed/40 bg-secondary-fixed/10',
                      )}
                      title={
                        filteredView.aggregateSource === 'sample'
                          ? 'Pre-baked fictional SIEM totals for the exercise narrative'
                          : filteredView.aggregateSource === 'stats'
                            ? 'Counts derived from visible rows via | stats count by (client-side)'
                            : 'Counts derived from IPv4s in currently visible rows'
                      }
                    >
                      {filteredView.aggregateSource === 'sample'
                        ? 'fictional SIEM scale'
                        : filteredView.aggregateSource === 'stats'
                          ? 'stats · visible sample'
                          : 'filtered · visible sample'}
                    </span>
                  ) : null}
                </div>
                {filteredView.aggregateSource === 'sample' && !filteredView.queryBlocked ? (
                  <p className="text-[10px] text-on-surface-variant/70 mb-4 max-w-2xl">
                    Bar totals (e.g. {scenario.aggregates[0]?.count.toLocaleString()}) are narrative SIEM volume, not a sum
                    of the {scenario.rows.length} rows above. Filter the table or run this lab&apos;s toolbox{' '}
                    <code className="text-primary-fixed/90">{scenario.aggregateLabel}</code> snippet to align bars with
                    visible events.
                  </p>
                ) : null}
                {filteredView.aggregateSource === 'stats' && !filteredView.queryBlocked ? (
                  <p className="text-[10px] text-on-surface-variant/70 mb-4 max-w-2xl">
                    {scenario.aggregateLabel} on {filteredView.filteredRows.length} visible row(s).
                  </p>
                ) : null}
                {filteredView.aggregateSource === 'filtered' && !filteredView.queryBlocked ? (
                  <p className="text-[10px] text-on-surface-variant/70 mb-4 max-w-2xl">
                    Counts from visible rows ({scenario.aggregateLabel}).
                  </p>
                ) : null}
                <div className="space-y-4">
                  {filteredView.queryBlocked ? (
                    <p className="text-[11px] text-error-fixed">Aggregations withheld — query failed security validation.</p>
                  ) : null}
                  {filteredView.metrics.aggregateBars.map((stat) => (
                    <div
                      key={stat.ip}
                      className="flex flex-col min-[400px]:flex-row min-[400px]:items-center gap-2 min-[400px]:gap-6"
                    >
                      <div
                        className="min-w-32 max-w-56 shrink-0 font-bold text-primary-fixed break-all text-[10px] sm:text-xs"
                        title={stat.ip}
                      >
                        {stat.ip}
                      </div>
                      <div className="w-16 text-right font-mono text-on-surface">{stat.count.toLocaleString()}</div>
                      <div className="flex-1 h-1.5 bg-surface-variant/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.severity}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn('h-full', stat.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="bento-card border-primary-fixed/30 p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,251,251,0.4) 10px, rgba(0,251,251,0.4) 20px)',
              }}
              aria-hidden
            />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-primary-fixed/20 pb-4">
                <h2 className="font-mono text-xs font-bold text-primary-fixed flex items-center gap-3">
                  <AlertTriangle size={18} aria-hidden /> SCENARIO_SUMMARY
                </h2>
                <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold border border-outline-variant">
                  {scenario.id}
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {scenario.threatSummary.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-wrap justify-between items-end border-b border-outline-variant/10 pb-2 gap-x-4 gap-y-1"
                  >
                    <span className="text-[10px] text-on-surface-variant uppercase shrink-0">{item.label}:</span>
                    <span className={cn('font-bold text-right', item.valClass)}>{item.value}</span>
                  </div>
                ))}

                <div className="mt-6">
                  <div className="flex justify-between text-[10px] text-on-surface-variant mb-1.5 uppercase font-bold">
                    <span>Narrative weight (from row mix)</span>
                    <span>{filteredView.metrics.narrativeWeight}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-fixed transition-all duration-500"
                      style={{ width: `${filteredView.metrics.narrativeWeight}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Portfolio exercise — containment is illustrative only"
                  className="mt-6 w-full py-3 bg-primary-fixed/10 border border-primary-fixed/50 text-primary-fixed font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Gavel size={16} aria-hidden /> Sample containment (no-op)
                </button>
              </div>
            </div>
          </section>

          <section className="bento-card p-6" aria-labelledby={`toolbox-heading-${scenario.id}`}>
            <div className="flex flex-wrap items-center gap-2 mb-2 border-b border-primary-fixed/10 pb-4">
              <h2
                id={`toolbox-heading-${scenario.id}`}
                className="font-mono text-xs font-bold text-primary-fixed flex items-center gap-3 uppercase"
              >
                <Wrench size={18} aria-hidden /> SIEM_QUERIES_TOOLBOX
              </h2>
              <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold border border-outline-variant">
                {scenario.id}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mb-1 line-clamp-2">{scenario.title}</p>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-on-surface-variant mb-2">
                Snippets for {scenario.id} only — click to apply. Default slice:{' '}
                <code className="text-primary-fixed/90 break-all">{scenario.query}</code>
              </p>
              {scenario.toolboxQueries.map((query, i) => (
                <button
                  key={`${scenario.id}-toolbox-${i}`}
                  type="button"
                  title={query}
                  aria-label={`Snippet ${i + 1} for ${scenario.id}: apply query`}
                  onClick={() => onApplyToolboxSnippet(query)}
                  className="group w-full text-left font-mono text-[11px] border border-primary-fixed/20 p-3 bg-surface-variant/10 hover:bg-primary-fixed/10 hover:border-primary-fixed transition-all relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-fixed scale-y-0 group-hover:scale-y-100 transition-transform origin-top" aria-hidden />
                  <div className="flex items-start gap-2 pr-6">
                    <span className="text-[9px] text-on-surface-variant/80 uppercase shrink-0 pt-0.5">
                      Snippet {i + 1}
                    </span>
                    <span className="text-on-surface truncate group-hover:text-primary-fixed transition-colors italic min-w-0 flex-1">
                      {query}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-fixed opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    aria-hidden
                  />
                </button>
              ))}

              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <h3 className="font-mono text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest font-bold">Reference_Materials</h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a
                      href="https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Whatsinthismanual"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-xs text-primary-fixed hover:underline group"
                    >
                      <BookOpen size={16} aria-hidden />
                      <span>Splunk SPL Search Reference (Splunk Docs)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://techdocs.broadcom.com/us/en/carbon-black/cloud/carbon-black-cloud/index/cbc-user-guide-tile/GUID-0B8E651F-7616-4D61-811F-F03D931C2A85-en/GUID-D3DE47C3-80B9-4962-ADD6-C897E2B69CEA-en/GUID-77E939E7-0130-42B9-A33A-2CBABE39F93B-en/GUID-EDA4B746-7731-4EBF-8AEE-207385B16A5E-en.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-xs text-primary-fixed hover:underline group"
                    >
                      <BookOpen size={16} aria-hidden />
                      <span>Lookup files &amp; acceleration in Splunk SIEM (Broadcom)</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
