import { useEffect, useMemo, useState } from 'react';
import { FiMapPin, FiSave, FiSearch, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/Loader';
import api from '../../lib/apiConfig';

const AdminDeliveryFees = () => {
  const [locations, setLocations] = useState([]);
  const [defaultFee, setDefaultFee] = useState('');
  const [stateFees, setStateFees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/delivery-locations'), api.get('/admin/delivery-settings')])
      .then(([locationsResponse, settingsResponse]) => {
        if (!active) return;
        setLocations(locationsResponse.data.locations || []);
        setDefaultFee(String(settingsResponse.data.settings.defaultFee));
        setStateFees(settingsResponse.data.settings.stateFees || []);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Unable to load delivery fee settings');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleLocations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return locations;
    return locations.filter(({ state, lgas }) => (
      state.toLocaleLowerCase().includes(query) ||
      lgas.some((lga) => lga.toLocaleLowerCase().includes(query))
    ));
  }, [locations, search]);

  const getStateSettings = (state) => (
    stateFees.find((entry) => entry.state === state) || { state, fee: null, lgaFees: [] }
  );

  const updateStateSettings = (state, update) => {
    setStateFees((current) => {
      const existing = current.find((entry) => entry.state === state) || { state, fee: null, lgaFees: [] };
      const next = update(existing);
      const withoutState = current.filter((entry) => entry.state !== state);
      if (next.fee === null && next.lgaFees.length === 0) return withoutState;
      return [...withoutState, next];
    });
  };

  const getEffectiveFee = (settings, lga) => (
    settings.lgaFees.find((entry) => entry.lga === lga)?.fee ?? settings.fee ?? Number(defaultFee || 0)
  );

  const updateStateFee = (state, value) => {
    const fee = value === '' ? null : Number(value);
    updateStateSettings(state, (current) => ({ ...current, fee }));
  };

  const updateLgaFee = (state, lga, value) => {
    if (value === '') {
      updateStateSettings(state, (current) => ({
        ...current,
        lgaFees: current.lgaFees.filter((entry) => entry.lga !== lga),
      }));
      return;
    }

    const fee = Number(value);
    updateStateSettings(state, (current) => ({
      ...current,
      lgaFees: [
        ...current.lgaFees.filter((entry) => entry.lga !== lga),
        { lga, fee },
      ],
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    const parsedDefaultFee = Number(defaultFee);
    if (defaultFee === '' || !Number.isSafeInteger(parsedDefaultFee) || parsedDefaultFee < 0) {
      toast.error('Enter a non-negative whole-number default fee');
      return;
    }
    const hasInvalidFee = stateFees.some(({ fee, lgaFees }) => (
      (fee !== null && fee !== undefined && (!Number.isSafeInteger(fee) || fee < 0)) ||
      lgaFees.some((entry) => !Number.isSafeInteger(entry.fee) || entry.fee < 0)
    ));
    if (hasInvalidFee) {
      toast.error('Every delivery fee must be a non-negative whole number');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put('/admin/delivery-settings', {
        defaultFee: parsedDefaultFee,
        stateFees,
      });
      setDefaultFee(String(data.settings.defaultFee));
      setStateFees(data.settings.stateFees);
      toast.success(data.message || 'Delivery fees updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save delivery fees');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader text="Loading delivery fee settings..." size="md" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={saveSettings} className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-sky-500"><FiTruck /> Store fulfillment</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Delivery fees</h1>
            <p className="mt-2 text-slate-500">View and edit delivery charges for every state and LGA.</p>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-bold text-white transition hover:bg-sky-600 disabled:opacity-60">
            <FiSave /> {saving ? 'Saving...' : 'Save all fees'}
          </button>
        </div>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <label htmlFor="defaultFee" className="block text-sm font-bold text-slate-700">Default delivery fee (₦)</label>
          <p className="mt-1 text-sm text-slate-500">Used by every state or LGA without a custom rate.</p>
          <input id="defaultFee" type="number" min="0" step="1" required value={defaultFee} onChange={(event) => setDefaultFee(event.target.value)} className="mt-4 w-full max-w-sm rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50" />
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600"><FiMapPin /></span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">All delivery locations</h2>
                <p className="text-sm text-slate-500">{locations.length} states and their LGAs. Expand a state to edit its fees.</p>
              </div>
            </div>
            <label className="relative block sm:w-72">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a state or LGA" aria-label="Search states and LGAs" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50" />
            </label>
          </div>

          <div className="mt-6 space-y-3">
            {visibleLocations.map(({ state, lgas }) => {
              const settings = getStateSettings(state);
              const isSearching = Boolean(search.trim());
              return (
                <details key={state} open={isSearching} className="group rounded-2xl border border-slate-200">
                  <summary className="flex cursor-pointer list-none flex-col gap-3 rounded-2xl px-4 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-bold text-slate-800">{state}</span>
                    <span className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                      <span>State fee: <strong className="text-slate-800">{settings.fee === null ? 'Default' : `₦${Number(settings.fee).toLocaleString()}`}</strong></span>
                      <span>{lgas.length} LGAs</span>
                      <span className="text-sky-600 group-open:rotate-180">⌄</span>
                    </span>
                  </summary>

                  <div className="border-t border-slate-100 p-4 sm:p-5">
                    <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
                      <div>
                        <label htmlFor={`state-fee-${state}`} className="block text-sm font-bold text-slate-700">{state} base fee (₦)</label>
                        <p className="mt-1 text-xs text-slate-500">Applied to LGAs without their own override. Leave blank to use the default.</p>
                      </div>
                      <input id={`state-fee-${state}`} type="number" min="0" step="1" value={settings.fee ?? ''} placeholder={`Default ₦${Number(defaultFee || 0).toLocaleString()}`} onChange={(event) => updateStateFee(state, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50" />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                            <th className="px-3 py-3 font-bold">Local government area</th>
                            <th className="px-3 py-3 font-bold">Effective fee</th>
                            <th className="px-3 py-3 font-bold">Custom LGA fee (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {lgas.map((lga) => {
                            const customFee = settings.lgaFees.find((entry) => entry.lga === lga)?.fee;
                            const lgaMatches = !search.trim() || state.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) || lga.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
                            if (!lgaMatches) return null;
                            return (
                              <tr key={lga}>
                                <td className="px-3 py-2.5 text-sm font-medium text-slate-700">{lga}</td>
                                <td className="px-3 py-2.5 text-sm font-semibold text-slate-800">₦{getEffectiveFee(settings, lga).toLocaleString()}</td>
                                <td className="px-3 py-2.5">
                                  <input type="number" min="0" step="1" aria-label={`${lga}, ${state} delivery fee`} value={customFee ?? ''} placeholder={`Inherit ₦${getEffectiveFee(settings, lga).toLocaleString()}`} onChange={(event) => updateLgaFee(state, lga, event.target.value)} className="w-full max-w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Clear a custom LGA fee to inherit the state or default fee.</p>
                  </div>
                </details>
              );
            })}
            {visibleLocations.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No states or LGAs match “{search}”.</p>
            )}
          </div>
        </section>
      </form>
    </AdminLayout>
  );
};

export default AdminDeliveryFees;
