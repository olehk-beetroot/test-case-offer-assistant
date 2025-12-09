import type { MatchResult } from '../types';

type Props = {
  results: MatchResult[];
  loading?: boolean;
};

const SkeletonRow = () => (
  <tr className='border-t border-slate-700 even:bg-slate-800/60'>
    <td className='px-3 py-3'>
      <div className='h-3 w-16 animate-pulse rounded bg-slate-700' />
    </td>
    <td className='px-3 py-3'>
      <div className='h-4 w-40 animate-pulse rounded bg-slate-700' />
    </td>
    <td className='px-3 py-3 text-right'>
      <div className='ml-auto h-4 w-10 animate-pulse rounded bg-slate-700' />
    </td>
    <td className='px-3 py-3'>
      <div className='space-y-1'>
        <div className='h-3 w-full animate-pulse rounded bg-slate-700' />
        <div className='h-3 w-3/4 animate-pulse rounded bg-slate-700' />
      </div>
    </td>
  </tr>
);

const ResultsTable = ({ results, loading }: Props) => {
  const skeletonRows = Array.from({ length: 5 }).map((_, idx) => (
    <SkeletonRow key={`skeleton-${idx}`} />
  ));

  return (
    <div className='scroll-mask max-h-[70vh] overflow-auto rounded-lg border border-slate-700 bg-slate-800 shadow-sm'>
      <table className='min-w-full text-left text-sm'>
        <thead className='bg-slate-900 text-xs uppercase text-slate-300'>
          <tr>
            <th className='px-4 py-2 w-32'>Position</th>
            <th className='px-3 py-2 text-right'>Score</th>
            <th className='px-4 py-2 w-2/5'>Short Name</th>
            <th className='px-3 py-2'>Why</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? skeletonRows
            : results.map((item) => (
                <tr
                  key={item.position}
                  className='border-t border-slate-700 even:bg-slate-800/60 focus-within:bg-blue-950'
                >
                  <td className='px-4 py-3 font-mono text-xs text-slate-300'>
                    {item.position}
                  </td>
                  <td className='px-3 py-3 text-right font-semibold text-slate-100'>
                    {item.score.toFixed(3)}
                  </td>
                  <td className='px-4 py-3 font-medium text-slate-100'>
                    {item.shortName}
                  </td>
                  <td className='px-3 py-3 text-slate-300'>
                    <ul className='list-disc'>
                      {item.why.split(';').map((part, idx) => (
                        <li key={idx} className='text-xs mb-1'>
                          {part.trim()}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
