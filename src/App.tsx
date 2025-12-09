import { useMemo, useState } from 'react';
import sampleIntake from '../data/intake.json';
import { matchCatalogue } from './algorithm';
import IntakeForm from './components/IntakeForm';
import ResultsTable from './components/ResultsTable';
import type { Intake, MatchResult } from './types';
import { flattenedCatalogue } from './utils/catalogue';

const defaultIntake: Intake = sampleIntake;

const App = () => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (intake: Intake) => {
    setLoading(true);
    setTimeout(() => {
      try {
        const matches = matchCatalogue(intake, flattenedCatalogue);
        setResults(matches);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  const filteredResults = useMemo(() => {
    const term = filter.toLowerCase();
    return results.filter(
      (item) =>
        item.shortName.toLowerCase().includes(term) ||
        item.position.toLowerCase().includes(term)
    );
  }, [filter, results]);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(filteredResults, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matching_results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='min-h-screen bg-slate-900 text-slate-100'>
      <header className='border-b border-slate-800 bg-slate-900'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-4'>
          <div>
            <h1 className='text-2xl font-semibold text-slate-100'>
              Test Case Offer Assistant
            </h1>
          </div>
          <div className='text-right text-sm text-slate-400'>
            <p>Oleh Kuznets © 2025 All Rights Reserved</p>
          </div>
        </div>
      </header>

      <main className='mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[30%_70%]'>
        <section className='card p-4 lg:sticky lg:top-4 lg:h-fit'>
          <h2 className='text-lg font-semibold text-slate-100'>
            Client Intake
          </h2>
          <p className='mb-4 text-xs text-slate-400 italic mt-1'>
            * Pre-filled example for quick testing
          </p>
          <IntakeForm
            initialValue={defaultIntake}
            onSubmit={handleSubmit}
            disabled={loading}
          />
        </section>

        <section className='card flex flex-col p-4'>
          <div className='mb-4 flex items-center justify-between gap-2'>
            <div>
              <h2 className='text-lg font-semibold text-slate-100'>
                Results
                {filteredResults.length ? ` (${filteredResults.length})` : ''}
              </h2>
              <p className='text-xs text-slate-400 italic mt-1'>
                * Sorted from highest to lowest score.
              </p>
            </div>
            <button
              type='button'
              onClick={handleDownload}
              className='rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 shadow-sm hover:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
              disabled={!filteredResults.length}
            >
              Download JSON
            </button>
          </div>
          <div className='mb-3 flex flex-col items-start gap-2'>
            <input
              id='filter'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className='w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-inner placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
              placeholder='Filter contains...'
            />
          </div>

          {error ? (
            <div className='rounded-md border border-rose-700 bg-rose-900/40 px-3 py-2 text-sm text-rose-200'>
              {error}
            </div>
          ) : loading ? (
            <ResultsTable results={[]} loading />
          ) : filteredResults.length === 0 ? (
            <div className='flex flex-1 items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-800 p-6 text-center text-sm text-slate-400'>
              No results yet. Run the matcher first.
            </div>
          ) : (
            <ResultsTable results={filteredResults} />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
