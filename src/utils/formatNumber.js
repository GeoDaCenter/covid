export default function formatNumber(number){
    if (!number) return number;
    const val = +number;
    if (isNaN(val)) return number;
    if (val < 0.0001) return val.toExponential();
    if (val < 0.01) return val.toFixed(4);
    if (val < 1) return val.toFixed(3);
    if (val < 1_000) return val.toFixed(1);
    if (val < 1_000_000) return `${(val/1_000).toFixed(1)}K`;
    if (val < 1_000_000_000) return `${(val/1_000_000).toFixed(1)}M`;
    if (val < 1_000_000_000_000) return `${(val/1_000_000).toFixed(1)}B`;
    return val.toExponential();
}