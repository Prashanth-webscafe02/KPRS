import { record } from '@/content/site';

/** SHT 05 · Test record. Rows, readings and the stamp are animated in lib/animations/record.ts. */
export default function Testing() {
  return (
    <section className="record" id="record" data-sheet="05" data-sheet-title="Test record" data-tone="paper">
      <div className="record__head">
        <p className="kicker">§ 05 — Routine &amp; type tests</p>
        <h2 className="record__title">Nothing leaves<br />the works <em>untested.</em></h2>
        <p className="record__lede">{record.lede}</p>
      </div>

      <div className="record__sheet">
        <div className="record__sheet-head mono">
          {record.head.map(h => <span key={h}>{h}</span>)}
        </div>
        <p className="record__specimen mono">{record.specimen}</p>
        <table className="record__table">
          <thead><tr><th>No.</th><th>Test</th><th>Guaranteed</th><th>Measured</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td>5.01</td><td>Winding resistance, HV (75 °C)</td><td>—</td><td><span data-count="0.4218" data-dec="4">0.4218</span> Ω</td><td>Pass</td></tr>
            <tr><td>5.02</td><td>Voltage ratio, principal tap</td><td>6.000 ± 0.5 %</td><td><span data-count="6.004" data-dec="3">6.004</span></td><td>Pass</td></tr>
            <tr><td>5.03</td><td>No-load loss at rated voltage</td><td>≤ 14.0 kW</td><td><span data-count="12.86" data-dec="2">12.86</span> kW</td><td>Pass</td></tr>
            <tr><td>5.04</td><td>Load loss at rated current, 75 °C</td><td>≤ 96.0 kW</td><td><span data-count="91.42" data-dec="2">91.42</span> kW</td><td>Pass</td></tr>
            <tr><td>5.05</td><td>Impedance voltage</td><td>10.0 % ± 10 %</td><td><span data-count="10.12" data-dec="2">10.12</span> %</td><td>Pass</td></tr>
            <tr><td>5.06</td><td>Separate-source AC withstand, HV</td><td>140 kV / 60 s</td><td><span data-count="140" data-dec="0">140</span> kV</td><td>Withstood</td></tr>
            <tr><td>5.07</td><td>Induced over-voltage withstand</td><td>2 × U<sub>r</sub>, 120 Hz</td><td><span data-count="132" data-dec="0">132</span> kV</td><td>Withstood</td></tr>
            <tr><td>5.08</td><td>Insulation resistance, HV–E, 60 s</td><td>—</td><td><span data-count="18.6" data-dec="1">18.6</span> GΩ</td><td>Pass</td></tr>
            <tr><td>5.09</td><td>Temperature rise, top oil</td><td>≤ 50 K</td><td><span data-count="43.7" data-dec="1">43.7</span> K</td><td>Pass</td></tr>
          </tbody>
        </table>
        <div className="record__sign">
          <div><span className="mono">Tested by</span><span className="record__sig">Test bay 2</span></div>
          <div><span className="mono">Witnessed</span><span className="record__sig">Client inspector</span></div>
          <div className="record__stamp" aria-hidden="true"><span>KPRS</span><span>Passed</span><span>QA</span></div>
        </div>
      </div>
    </section>
  );
}
