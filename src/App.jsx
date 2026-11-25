import { useEffect, useMemo, useState } from 'react'

const seedInventory = [
  { id: 1, item: 'Brown rice', quantity: 18, unit: 'lbs', category: 'Grains', storage: 'Dry storage', status: 'Good', expiresAt: '2027-02-14', lowThreshold: 10, barcode: '0123456701', history: [] },
  { id: 2, item: 'Canned black beans', quantity: 24, unit: 'cans', category: 'Canned goods', storage: 'Dry storage', status: 'Good', expiresAt: '2027-08-20', lowThreshold: 12, barcode: '0123456702', history: [] },
  { id: 3, item: 'Pasta', quantity: 8, unit: 'boxes', category: 'Grains', storage: 'Dry storage', status: 'Low', expiresAt: '2026-12-18', lowThreshold: 12, barcode: '0123456703', history: [] },
  { id: 4, item: 'Fresh carrots', quantity: 12, unit: 'lbs', category: 'Produce', storage: 'Refrigerated', status: 'Use soon', expiresAt: '2026-11-29', lowThreshold: 8, barcode: '', history: [] },
  { id: 5, item: 'Peanut butter', quantity: 15, unit: 'jars', category: 'Pantry basics', storage: 'Dry storage', status: 'Good', expiresAt: '2027-05-10', lowThreshold: 6, barcode: '0123456705', history: [] },
  { id: 6, item: 'Milk', quantity: 6, unit: 'gallons', category: 'Dairy', storage: 'Refrigerated', status: 'Low', expiresAt: '2026-11-28', lowThreshold: 8, barcode: '', history: [] },
]

const seedTasks = [
  { id: 1, title: 'Sort the refrigerated donations', volunteer: 'Lee Morgan', date: '2026-11-27', status: 'Open' },
  { id: 2, title: 'Pack Friday household boxes', volunteer: 'Asha Patel', date: '2026-11-29', status: 'Open' },
  { id: 3, title: 'Update the pantry count', volunteer: 'Marcus Reed', date: '2026-11-28', status: 'Complete' },
]

const sampleMessages = `Hi, this is Maria from the community garden. We have 12 pounds of apples ready to donate tomorrow, January 28. Please keep them refrigerated.

Hello! The bakery at Oak Street donated 20 loaves of bread today. They can be stored in the freezer.`

const defaultPlanAssumptions = [
  { item: 'Brown rice', perHousehold: 0.5, unit: 'lbs', note: 'Starting amount per household; adjust for this distribution.' },
  { item: 'Canned black beans', perHousehold: 0.5, unit: 'cans', note: 'Fractional units are rounded up for the total packing target.' },
  { item: 'Pasta', perHousehold: 0.5, unit: 'boxes', note: 'Starting amount per household; adjust for this distribution.' },
]

function nextFriday() {
  const date = new Date()
  const daysUntilFriday = (5 - date.getDay() + 7) % 7 || 7
  date.setDate(date.getDate() + daysUntilFriday)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function Icon({ name, size = 20 }) {
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9.5 20v-6h5v6"/></>,
    box: <><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16h16V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function App() {
  const [screen, setScreen] = useState('Home')
  const [inventory, setInventory] = useStoredState('pantry-inventory', seedInventory)
  const [confirmedDonations, setConfirmedDonations] = useStoredState('confirmed-donations', 8)
  const [households, setHouseholds] = useStoredState('weekly-households', 42)
  const [planAssumptions, setPlanAssumptions] = useStoredState('plan-assumptions', defaultPlanAssumptions)
  const [donationHistory, setDonationHistory] = useStoredState('donation-history', [])
  const [tasks, setTasks] = useStoredState('volunteer-tasks', seedTasks)
  const [householdProfiles, setHouseholdProfiles] = useStoredState('household-profiles', [
    { id: 1, name: 'Household 1', members: 4, dietary: 'No known restrictions' },
    { id: 2, name: 'Household 2', members: 2, dietary: 'Vegetarian' },
    { id: 3, name: 'Household 3', members: 5, dietary: 'Gluten-free preference' },
  ])
  const nav = [
    ['Home', 'home'],
    ['Donations', 'box'],
    ['Pantry stock', 'calendar'],
    ['Weekly plan', 'chart'],
    ['Volunteers', 'users'],
    ['Reports', 'report'],
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setScreen('Home')} aria-label="Pantry Planner home">
          <span className="brand-mark"><span></span><span></span><span></span></span>
          <span>Pantry Planner</span>
        </button>
        <nav className="nav-list" aria-label="Main navigation">
          {nav.map(([label, icon]) => (
            <button key={label} className={`nav-item ${screen === label ? 'active' : ''}`} onClick={() => setScreen(label)}>
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">LM</div>
          <div><strong>Lee Morgan</strong><small>Volunteer coordinator</small></div>
        </div>
      </aside>

      <main className="main">
        {screen === 'Home' && <Home setScreen={setScreen} inventory={inventory} confirmedDonations={confirmedDonations} />}
        {screen === 'Donations' && <Donations inventory={inventory} setInventory={setInventory} setConfirmedDonations={setConfirmedDonations} donationHistory={donationHistory} setDonationHistory={setDonationHistory} />}
        {screen === 'Pantry stock' && <Stock inventory={inventory} setInventory={setInventory} />}
        {screen === 'Weekly plan' && <WeeklyPlan inventory={inventory} households={households} setHouseholds={setHouseholds} householdProfiles={householdProfiles} setHouseholdProfiles={setHouseholdProfiles} assumptions={planAssumptions} setAssumptions={setPlanAssumptions} />}
        {screen === 'Volunteers' && <Volunteers tasks={tasks} setTasks={setTasks} />}
        {screen === 'Reports' && <Reports inventory={inventory} donationHistory={donationHistory} households={households} tasks={tasks} />}
      </main>
    </div>
  )
}

function Header({ eyebrow, title, action }) {
  return (
    <header className="page-header">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>
      {action}
    </header>
  )
}

function Home({ setScreen, inventory, confirmedDonations }) {
  const lowCount = inventory.filter(item => item.status !== 'Good').length
  return (
    <div className="page home-page">
      <Header eyebrow="Monday, January 27" title="Good morning, Lee" />
      <section className="welcome-card">
        <div>
          <p className="eyebrow light">THIS WEEK</p>
          <h2>Your week at a glance</h2>
          <p>Two tasks are ready for your attention. Everything else is on track.</p>
        </div>
        <div className="week-art" aria-hidden="true">
          <div className="crate crate-one"></div><div className="crate crate-two"></div>
          <div className="leaf leaf-one"></div><div className="leaf leaf-two"></div>
        </div>
      </section>

      <section className="stats-grid">
        <button className="stat-card" onClick={() => setScreen('Donations')}>
          <span className="stat-icon mint"><Icon name="box" /></span>
          <div><strong>{confirmedDonations}</strong><span>donations received</span></div>
          <Icon name="chevron" size={18} />
        </button>
        <button className="stat-card" onClick={() => setScreen('Donations')}>
          <span className="stat-icon gold"><Icon name="calendar" /></span>
          <div><strong>2</strong><span>awaiting review</span></div>
          <Icon name="chevron" size={18} />
        </button>
        <button className="stat-card" onClick={() => setScreen('Pantry stock')}>
          <span className="stat-icon peach"><Icon name="chart" /></span>
          <div><strong>{lowCount}</strong><span>stock items need attention</span></div>
          <Icon name="chevron" size={18} />
        </button>
      </section>

      <div className="home-columns">
        <section className="panel task-panel">
          <div className="panel-heading"><div><p className="eyebrow">UP NEXT</p><h2>Tasks for this week</h2></div></div>
          <Task number="1" title="Review 2 recent donations" text="Confirm items and quantities before adding to stock." onClick={() => setScreen('Donations')} />
          <Task number="2" title="Check low pantry items" text="Pasta and milk may need a note for the weekly plan." onClick={() => setScreen('Pantry stock')} />
          <Task number="3" title="Prepare Friday's distribution" text="Review available stock for 42 households." onClick={() => setScreen('Weekly plan')} />
        </section>

        <section className="panel focus-panel">
          <p className="eyebrow">WEEKLY FOCUS</p>
          <h2>Plan for fresh produce</h2>
          <p>Fresh carrots are available this week. Consider adding them to 20 household boxes.</p>
          <button className="text-action" onClick={() => setScreen('Weekly plan')}>Open weekly plan <Icon name="arrow" size={18} /></button>
        </section>
      </div>
    </div>
  )
}

function Task({ number, title, text, onClick }) {
  return (
    <button className="task-row" onClick={onClick}>
      <span className="task-number">{number}</span>
      <span className="task-copy"><strong>{title}</strong><small>{text}</small></span>
      <span className="task-arrow"><Icon name="chevron" size={18} /></span>
    </button>
  )
}

function parseMessages(text) {
  const blocks = text.split(/\n\s*\n/).filter(Boolean)
  return blocks.map((block, index) => {
    const quantityMatch = block.match(/(\d+(?:\.\d+)?)\s*(pounds?|lbs?|ounces?|oz|kilograms?|kg|cans?|jars?|loaves?|boxes?|cases?|bags?|gallons?|liters?|bottles?|items?)/i)
    const unitAliases = {
      pound: 'lbs', pounds: 'lbs', lb: 'lbs', lbs: 'lbs', ounce: 'oz', ounces: 'oz',
      can: 'cans', jar: 'jars', loaf: 'loaves', box: 'boxes', case: 'cases',
      bag: 'bags', gallon: 'gallons', liter: 'liters', bottle: 'bottles', item: 'items',
      kilogram: 'kg', kilograms: 'kg',
    }
    const rawUnit = quantityMatch?.[2]?.toLowerCase() || ''
    const unit = unitAliases[rawUnit] || rawUnit
    const knownItems = ['peanut butter', 'black beans', 'green beans', 'apples', 'carrots', 'potatoes', 'tomatoes', 'oranges', 'bananas', 'bread', 'rice', 'pasta', 'milk', 'eggs', 'beans', 'chicken', 'cheese', 'vegetables', 'flour', 'oats']
    const itemMatch = knownItems.find(item => new RegExp(`\\b${item.replace(' ', '\\s+')}\\b`, 'i').test(block))
    const item = itemMatch ? itemMatch.replace(/\b\w/g, char => char.toUpperCase()) : ''
    const donorMatch = block.match(/(?:from:\s*|this is\s+|i'm\s+)([^,.\n|]+)/i)
    const donor = donorMatch?.[1]?.trim() || ''
    const preparedDate = block.match(/(?:cooked|prepared|packed)\s+(?:on\s+)?([A-Za-z]+\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i)?.[1] || ''
    const useByDate = block.match(/(?:use[- ]by|best[- ]by|best before|expires?)\s*(?:date)?[:\s]+([A-Za-z]+\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i)?.[1] || ''
    const storage = /freezer|frozen/i.test(block) ? 'Freezer (reported)' : /refrigerat/i.test(block) ? 'Refrigerated (reported)' : ''
    const donorTypeText = block.match(/\b(individual|neighbor|restaurant|bakery|business|organization|community group)\b/i)?.[1]?.toLowerCase() || ''
    const donorType = ['restaurant', 'bakery', 'business'].includes(donorTypeText) ? 'Business'
      : ['neighbor', 'individual'].includes(donorTypeText) ? 'Individual'
        : ['organization', 'community group'].includes(donorTypeText) ? 'Organization' : ''
    return {
      id: Date.now() + index,
      donor,
      donorType,
      item,
      quantity: quantityMatch?.[1] || '',
      unit,
      kind: /cooked|prepared|leftover/i.test(block) ? 'Cooked / prepared' : '',
      preparedDate,
      useByDate,
      ingredients: '',
      dietaryLabels: '',
      storage,
      pickup: /pick.?up|drop.?off|deliver/i.test(block) ? block.match(/(?:pick.?up|drop.?off|deliver)[^.!?\n]*/i)?.[0] || '' : '',
      original: block.trim(),
    }
  })
}

function emptyOffer() {
  return {
    donor: '', donorType: '', item: '', quantity: '', unit: '', kind: '',
    preparedDate: '', useByDate: '', ingredients: '', dietaryLabels: '',
    storage: '', pickup: '', original: '',
  }
}

function DonationFields({ value, onChange }) {
  const set = (field, nextValue) => onChange(field, nextValue)
  return (
    <div className="offer-fields">
      <div className="offer-section-title"><span>1</span><div><strong>What is being offered?</strong><small>Use the donor’s words where possible.</small></div></div>
      <div className="field-grid">
        <label>Donor or organization<input value={value.donor} onChange={event => set('donor', event.target.value)} placeholder="Name, or leave blank" /></label>
        <label>Donor type<select value={value.donorType} onChange={event => set('donorType', event.target.value)}><option value="">Not provided</option><option>Individual</option><option>Business</option><option>Organization</option><option>Community group</option></select></label>
        <label>Item<input value={value.item} onChange={event => set('item', event.target.value)} placeholder="e.g. canned black beans" /></label>
        <label>Quantity<input type="number" min="0" step="any" value={value.quantity} onChange={event => set('quantity', event.target.value)} placeholder="Amount" /></label>
        <label>Unit<select value={value.unit} onChange={event => set('unit', event.target.value)}><option value="">Choose unit</option><option>lbs</option><option>oz</option><option>kg</option><option>cans</option><option>jars</option><option>loaves</option><option>boxes</option><option>cases</option><option>bags</option><option>gallons</option><option>bottles</option><option>items</option></select></label>
        <label>Food type<select value={value.kind} onChange={event => set('kind', event.target.value)}><option value="">Not provided</option><option>Fresh</option><option>Packaged</option><option>Cooked / prepared</option><option>Frozen</option><option>Other</option></select></label>
      </div>
      <div className="offer-section-title"><span>2</span><div><strong>What details did the donor provide?</strong><small>These are notes to verify, not a food-safety assessment.</small></div></div>
      <div className="field-grid">
        <label>Date cooked or packed<input value={value.preparedDate} onChange={event => set('preparedDate', event.target.value)} placeholder="As written by the donor" /></label>
        <label>Printed use-by / best-by date<input value={value.useByDate} onChange={event => set('useByDate', event.target.value)} placeholder="As printed on the item" /></label>
        <label>Storage described by donor<select value={value.storage} onChange={event => set('storage', event.target.value)}><option value="">Not provided</option><option>Shelf-stable (reported)</option><option>Refrigerated (reported)</option><option>Frozen (reported)</option></select></label>
        <label>Pickup or delivery details<input value={value.pickup} onChange={event => set('pickup', event.target.value)} placeholder="Date, time, or location" /></label>
        <label>Known ingredients or allergens<input value={value.ingredients} onChange={event => set('ingredients', event.target.value)} placeholder="Only if provided" /></label>
        <label>Dietary labels provided<input value={value.dietaryLabels} onChange={event => set('dietaryLabels', event.target.value)} placeholder="e.g. vegetarian (as labeled)" /></label>
      </div>
    </div>
  )
}

function Donations({ inventory, setInventory, setConfirmedDonations, donationHistory, setDonationHistory }) {
  const [text, setText] = useState('')
  const [drafts, setDrafts] = useState([])
  const [index, setIndex] = useState(0)
  const [tab, setTab] = useState('Review')
  const [intakeMode, setIntakeMode] = useState('paste')
  const [manualOffer, setManualOffer] = useState(emptyOffer)

  const organize = () => {
    if (!text.trim()) return
    setDrafts(parseMessages(text))
    setIndex(0)
  }

  const startManualReview = () => {
    setDrafts([{ ...manualOffer, original: 'Entered directly by the coordinator.' }])
    setIndex(0)
  }
  const updateDraft = (field, value) => setDrafts(current => current.map((draft, i) => i === index ? { ...draft, [field]: value } : draft))
  const skip = () => setIndex(current => current + 1)
  const confirm = () => {
    const draft = drafts[index]
    if (!draft?.item.trim() || !draft.quantity || Number(draft.quantity) <= 0 || !draft.unit) return
    const confirmedItem = {
      id: Date.now(), item: draft.item, quantity: Number(draft.quantity), unit: draft.unit,
      category: 'Donation', storage: draft.storage || 'Not provided',
      status: Number(draft.quantity) <= 5 ? 'Low' : 'Good',
      expiresAt: '', useByNote: draft.useByDate, preparedDate: draft.preparedDate,
      donor: draft.donor, donorType: draft.donorType, kind: draft.kind,
      ingredients: draft.ingredients, dietaryLabels: draft.dietaryLabels,
      pickup: draft.pickup, original: draft.original, lowThreshold: 5, barcode: '', history: [],
    }
    setInventory(current => [...current, confirmedItem])
    setDonationHistory(current => [{
      id: Date.now(), item: draft.item, quantity: draft.quantity, unit: draft.unit,
      date: new Date().toISOString().slice(0, 10), storage: draft.storage || 'Not provided',
      status: 'Confirmed', donor: draft.donor || 'Not provided', donorType: draft.donorType,
      kind: draft.kind, preparedDate: draft.preparedDate, useByDate: draft.useByDate,
      ingredients: draft.ingredients, dietaryLabels: draft.dietaryLabels, pickup: draft.pickup,
      original: draft.original,
    }, ...current])
    setConfirmedDonations(current => current + 1)
    setIndex(current => current + 1)
  }

  const current = drafts[index]
  const canConfirm = Boolean(current?.item.trim() && current.quantity && Number(current.quantity) > 0 && current.unit)
  return (
    <div className="page">
      <Header eyebrow="DONATIONS" title="Organize a donation" action={
        <div className="tab-switch">
          <button className={tab === 'Review' ? 'active' : ''} onClick={() => setTab('Review')}>Review</button>
          <button className={tab === 'History' ? 'active' : ''} onClick={() => setTab('History')}>History</button>
        </div>
      } />
      {tab === 'History' ? (
        <section className="history-panel panel">
          <div className="panel-heading"><div><p className="eyebrow">CONFIRMED RECORDS</p><h2>Donation history</h2></div></div>
          {donationHistory.length ? donationHistory.map(donation => (
            <div className="history-row" key={donation.id}>
              <span className="history-icon"><Icon name="box" /></span>
              <div><strong>{donation.item}</strong><small>{donation.quantity} {donation.unit} · {donation.date} · {donation.donor || 'Donor not provided'}</small></div>
              <span className="history-storage">{donation.storage}</span>
              <span className="status good">{donation.status}</span>
            </div>
          )) : <div className="empty-state"><h3>No confirmed donations yet</h3><p>Confirmed donations will appear here.</p></div>}
        </section>
      ) : !drafts.length ? (
        <section className="donation-entry panel">
          <div className="step-heading"><span>1</span><div><h2>How would you like to add this offer?</h2><p>Choose a quick form or paste a message. Either way, details are reviewed before they reach stock.</p></div></div>
          <div className="intake-tabs">
            <button className={intakeMode === 'paste' ? 'active' : ''} onClick={() => setIntakeMode('paste')}>Paste a message</button>
            <button className={intakeMode === 'manual' ? 'active' : ''} onClick={() => setIntakeMode('manual')}>Enter details</button>
          </div>
          {intakeMode === 'paste' ? (
            <>
              <label className="textarea-prompt">Paste one or more donor messages<textarea value={text} onChange={event => setText(event.target.value)} placeholder="Paste an email, text, or call note. Separate different offers with a blank line." /></label>
              <p className="helper-note">Pantry Planner makes local, best-effort suggestions from the text. It may miss or misread details—nothing is added to stock until you review and confirm.</p>
              <div className="entry-actions">
                <button className="link-button" onClick={() => setText(sampleMessages)}>Use sample messages</button>
                <button className="primary-button" onClick={organize} disabled={!text.trim()}>Review suggested details <Icon name="arrow" size={18} /></button>
              </div>
            </>
          ) : (
            <>
              <DonationFields value={manualOffer} onChange={(field, value) => setManualOffer(current => ({ ...current, [field]: value }))} />
              <div className="entry-actions"><span className="helper-note">Required to continue: item, quantity, and unit. You can add unknown details later.</span><button className="primary-button" onClick={startManualReview} disabled={!manualOffer.item.trim() || !manualOffer.quantity || Number(manualOffer.quantity) <= 0 || !manualOffer.unit}>Review this offer <Icon name="arrow" size={18} /></button></div>
            </>
          )}
        </section>
      ) : index < drafts.length ? (
        <section className="review-layout">
          <div className="review-main panel">
            <div className="step-heading"><span>2</span><div><h2>Review suggested details</h2><p>Offer {index + 1} of {drafts.length}. Empty fields mean the message did not provide a clear value.</p></div></div>
            <div className="progress"><span style={{ width: `${((index + 1) / drafts.length) * 100}%` }} /></div>
            <div className="review-notice">These are donor-reported details, not a food-safety decision. Please verify them against the original message and the item labels.</div>
            <DonationFields value={current} onChange={updateDraft} />
            <div className="original-message"><p className="eyebrow">ORIGINAL DONOR WORDING</p><blockquote>“{current.original}”</blockquote></div>
            {!canConfirm && <p className="validation-note">Add an item, a quantity greater than zero, and a unit before confirming.</p>}
            <div className="review-actions"><button className="secondary-button" onClick={skip}>Skip this offer</button><button className="primary-button" onClick={confirm} disabled={!canConfirm}><Icon name="check" size={18} /> Confirm & add to stock</button></div>
          </div>
          <aside className="review-tip"><span>Before confirming</span><p>Check the item, quantity, date, and storage details against the original message.</p></aside>
        </section>
      ) : (
        <section className="complete-card panel">
          <span className="complete-icon"><Icon name="check" size={28} /></span>
          <h2>Donation review complete</h2>
          <p>Confirmed items have been added to stock. Skipped offers were not saved.</p>
          <div><button className="secondary-button" onClick={() => { setDrafts([]); setText(''); setManualOffer(emptyOffer()) }}>Add another offer</button><button className="primary-button" onClick={() => { setDrafts([]); setText(''); setManualOffer(emptyOffer()) }}>Done</button></div>
        </section>
      )}
    </div>
  )
}

function Stock({ inventory, setInventory }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [showAlerts, setShowAlerts] = useState(false)
  const categories = ['All', ...new Set(inventory.map(item => item.category))]
  const filtered = inventory.filter(item =>
    (category === 'All' || item.category === category) &&
    item.item.toLowerCase().includes(search.toLowerCase())
  )

  const updateSelected = (field, value) => setSelected(current => ({ ...current, [field]: value }))
  const saveSelected = () => {
    setInventory(current => {
      const exists = current.some(item => item.id === selected.id)
      const updated = exists ? current.map(item => item.id === selected.id ? selected : item) : [...current, selected]
      return updated.map(item => ({
        ...item,
        status: item.quantity <= (item.lowThreshold ?? 5) ? 'Low' : item.status === 'Use soon' ? 'Use soon' : 'Good',
      }))
    })
    setSelected(null)
  }
  return (
    <div className="page">
      <Header eyebrow="PANTRY STOCK" title="Pantry inventory" action={
        <div className="header-actions">
          <button className="secondary-button" onClick={() => setShowAlerts(value => !value)}>Low-stock alerts</button>
          <button className="primary-button" onClick={() => setSelected({ id: Date.now(), item: '', quantity: 1, unit: 'items', category: 'Pantry basics', storage: 'Dry storage', status: 'Good', expiresAt: '', lowThreshold: 5, barcode: '', history: [] })}><Icon name="plus" size={18} /> Add item</button>
        </div>
      } />
      {showAlerts && (
        <section className="alert-strip">
          {inventory.filter(item => item.quantity <= (item.lowThreshold ?? 5) || item.status === 'Use soon').map(item => (
            <div className="alert-item" key={item.id}><strong>{item.item}</strong><span>{item.status === 'Use soon' ? `Use soon · expires ${item.expiresAt || 'undated'}` : `${item.quantity} ${item.unit} remaining`}</span></div>
          ))}
          {!inventory.some(item => item.quantity <= (item.lowThreshold ?? 5) || item.status === 'Use soon') && <p>No low-stock or use-soon items.</p>}
        </section>
      )}
      <section className="stock-toolbar">
        <div className="search-box"><Icon name="search" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search pantry items" /></div>
        <select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(name => <option key={name}>{name}</option>)}</select>
        <div className="view-toggle" aria-label="View">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>List</button>
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Cards</button>
        </div>
      </section>
      <section className={`inventory-${view}`}>
        {filtered.map(item => (
          <button className="inventory-item" key={item.id} onClick={() => setSelected({ ...item })}>
            <span className={`item-icon ${item.status === 'Good' ? 'good' : item.status === 'Low' ? 'low' : 'soon'}`}>{item.item.slice(0, 1)}</span>
            <span className="item-main"><strong>{item.item}</strong><small>{item.category} · {item.storage}</small></span>
            <span className="item-quantity"><strong>{item.quantity}</strong><small>{item.unit}</small></span>
            <span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </section>
      {filtered.length === 0 && <div className="empty-state"><h3>No items found</h3><p>Try a different search or category.</p></div>}
      {selected && (
        <div className="drawer-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}>
          <aside className="drawer">
            <div className="drawer-header"><div><p className="eyebrow">ITEM DETAILS</p><h2>{selected.item || 'New pantry item'}</h2></div><button className="close-button" onClick={() => setSelected(null)}>×</button></div>
            <div className="drawer-fields">
              <label>Item name<input value={selected.item} onChange={event => updateSelected('item', event.target.value)} /></label>
              <div className="split-fields"><label>Quantity<input type="number" min="0" value={selected.quantity} onChange={event => updateSelected('quantity', Number(event.target.value))} /></label><label>Unit<input value={selected.unit} onChange={event => updateSelected('unit', event.target.value)} /></label></div>
              <div className="split-fields"><label>Use-by date<input type="date" value={selected.expiresAt || ''} onChange={event => updateSelected('expiresAt', event.target.value)} /></label><label>Low-stock threshold<input type="number" min="0" value={selected.lowThreshold ?? 5} onChange={event => updateSelected('lowThreshold', Number(event.target.value))} /></label></div>
              <label>Barcode or QR reference<input value={selected.barcode || ''} onChange={event => updateSelected('barcode', event.target.value)} placeholder="Optional" /></label>
              <label>Category<select value={selected.category} onChange={event => updateSelected('category', event.target.value)}>{categories.filter(name => name !== 'All').concat('Other').map(name => <option key={name}>{name}</option>)}</select></label>
              <label>Storage<select value={selected.storage} onChange={event => updateSelected('storage', event.target.value)}><option>Dry storage</option><option>Refrigerated</option><option>Freezer</option></select></label>
              <label>Status<select value={selected.status} onChange={event => updateSelected('status', event.target.value)}><option>Good</option><option>Low</option><option>Use soon</option></select></label>
            </div>
            <button className="primary-button drawer-save" onClick={saveSelected} disabled={!selected.item.trim()}>Save changes</button>
          </aside>
        </div>
      )}
    </div>
  )
}

function WeeklyPlan({ inventory, households, setHouseholds, householdProfiles, setHouseholdProfiles, assumptions, setAssumptions }) {
  const [date, setDate] = useState(nextFriday)
  const [requested, setRequested] = useState(false)
  const [checklist, setChecklist] = useState([
    { id: 1, name: 'Sort household boxes', done: true },
    { id: 2, name: 'Label dietary items', done: false },
    { id: 3, name: 'Assign pickup area', done: false },
  ])
  const [profileDraft, setProfileDraft] = useState(null)
  const [draftOverride, setDraftOverride] = useState(null)
  const distribute = useMemo(() => assumptions.map(assumption => {
    const stockItem = inventory.find(item => item.item.toLowerCase() === assumption.item.toLowerCase())
    const unitMatches = stockItem?.unit?.toLowerCase() === assumption.unit.toLowerCase()
    const rawTarget = Math.max(0, Number(households) || 0) * Math.max(0, Number(assumption.perHousehold) || 0)
    const wholeUnit = ['cans', 'jars', 'loaves', 'boxes', 'cases', 'bottles', 'items'].includes(assumption.unit)
    const target = wholeUnit ? Math.ceil(rawTarget) : Math.round(rawTarget * 100) / 100
    const available = unitMatches ? Number(stockItem.quantity) || 0 : 0
    return {
      ...assumption, available, target, rawTarget, stockItem, unitMatches,
      gap: Math.max(0, target - available),
      percent: target ? Math.min(100, Math.round(available / target * 100)) : 0,
    }
  }), [assumptions, households, inventory])
  const gaps = distribute.filter(item => item.gap > 0)
  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  const generatedDraft = `Hello community supporters,\n\nWe are preparing for a distribution on ${formattedDate} for ${households} households. We may need additional items to meet our current planning estimates:\n${gaps.length ? gaps.map(item => `• ${item.item}: approximately ${item.gap} ${item.unit}`).join('\n') : '• No shortages in the currently tracked planning items.'}\n\nThese are planning estimates for coordinator review. Please reply if you may be able to help.\n\nThank you,\nPantry Coordinator`
  const draft = draftOverride ?? generatedDraft
  const updateAssumption = (itemName, field, value) => {
    setRequested(false)
    setDraftOverride(null)
    setAssumptions(current => current.map(item => item.item === itemName ? { ...item, [field]: value } : item))
  }
  const addPlanItem = () => {
    const item = inventory.find(stock => !assumptions.some(assumption => assumption.item.toLowerCase() === stock.item.toLowerCase()))
    if (!item) return
    setAssumptions(current => [...current, {
      item: item.item, perHousehold: 0.5, unit: item.unit,
      note: 'Coordinator-defined starting amount; adjust for this distribution.',
    }])
    setDraftOverride(null)
  }

  return (
    <div className="page">
      <Header eyebrow="WEEKLY PLAN" title="Distribution plan" action={<button className="secondary-button" onClick={() => window.print()}>Print plan</button>} />
      <section className="plan-controls panel">
        <label>Distribution date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
        <label>Households receiving boxes<input type="number" min="1" value={households} onChange={event => setHouseholds(Number(event.target.value))} /></label>
        <div className="target-note"><strong>Coordinator estimates</strong><small>Every per-household amount is editable.</small></div>
      </section>
      <div className="planning-notice">Suggestions only. The totals below use your household count and per-household starting amounts. Adjust them for this distribution; the app does not account for household preferences or decide whether food is safe.</div>
      <div className="plan-layout">
        <section className="panel plan-stock">
          <div className="panel-heading"><div><p className="eyebrow">STOCK & PLANNING ASSUMPTIONS</p><h2>Suggested starting amounts</h2></div><button className="secondary-button" onClick={addPlanItem} disabled={!inventory.some(stock => !assumptions.some(assumption => assumption.item.toLowerCase() === stock.item.toLowerCase()))}>Add stock item</button></div>
          {distribute.map(item => {
            return (
              <div className="plan-item" key={item.item}>
                <div className="plan-item-title"><strong>{item.item}</strong><span>{item.available} available · target {item.target} {item.unit}</span></div>
                <div className="assumption-controls">
                  <label>Starting amount per household
                    <span className="assumption-input"><input aria-label={`${item.item} starting amount per household`} type="number" min="0" step="0.05" value={item.perHousehold} onChange={event => updateAssumption(item.item, 'perHousehold', event.target.value)} /><span>{item.unit} / household</span></span>
                  </label>
                  <p>{households} households × {item.perHousehold} {item.unit} = {item.rawTarget.toFixed(2)} {item.unit}{item.target !== item.rawTarget ? `, rounded up to ${item.target} whole units` : ''}</p>
                </div>
                <div className="progress tall"><span className={item.gap ? 'warning' : ''} style={{ width: `${item.percent}%` }} /></div>
                <small className={item.gap ? 'gap' : 'covered'}>{item.stockItem && !item.unitMatches ? `Unit mismatch: stock is recorded in ${item.stockItem.unit}; update the assumption or stock unit before comparing.` : item.stockItem ? (item.gap ? `${item.gap} ${item.unit} short of this estimate` : 'Current stock covers this estimate') : 'No matching stock item found — check the item name and unit.'}</small>
              </div>
            )
          })}
        </section>
        <aside className="panel donor-panel">
          <p className="eyebrow">COMMUNITY SUPPORT</p>
          <h2>Draft a donor request</h2>
          <p>Generated from the current planning gaps. Edit it for review before sharing.</p>
          <textarea className="request-draft" value={draft} onChange={event => { setDraftOverride(event.target.value); setRequested(false) }} />
          <button className="primary-button full" onClick={() => setRequested(true)} disabled={requested}>{requested ? 'Draft saved for review' : 'Save draft for review'} <Icon name={requested ? 'check' : 'arrow'} size={18} /></button>
          <small className="draft-safety">This draft is not sent automatically.</small>
        </aside>
      </div>
      <div className="plan-secondary">
        <section className="panel checklist-panel">
          <div className="panel-heading"><div><p className="eyebrow">DISTRIBUTION DAY</p><h2>Preparation checklist</h2></div></div>
          {checklist.map(item => (
            <label className="check-row" key={item.id}>
              <input type="checkbox" checked={item.done} onChange={() => setChecklist(current => current.map(row => row.id === item.id ? { ...row, done: !row.done } : row))} />
              <span className={item.done ? 'done' : ''}>{item.name}</span>
            </label>
          ))}
        </section>
        <section className="panel households-panel">
          <div className="panel-heading"><div><p className="eyebrow">HOUSEHOLD PROFILE</p><h2>Needs & preferences</h2></div><button className="text-action" onClick={() => setProfileDraft({ id: Date.now(), name: '', members: 1, dietary: '' })}>Add</button></div>
          {householdProfiles.slice(0, 4).map(profile => (
            <button className="household-row" key={profile.id} onClick={() => setProfileDraft({ ...profile })}>
              <span><strong>{profile.name}</strong><small>{profile.members} people · {profile.dietary}</small></span><Icon name="chevron" size={18} />
            </button>
          ))}
        </section>
      </div>
      {profileDraft && (
        <div className="drawer-backdrop" onMouseDown={event => event.target === event.currentTarget && setProfileDraft(null)}>
          <aside className="drawer">
            <div className="drawer-header"><div><p className="eyebrow">HOUSEHOLD PROFILE</p><h2>{profileDraft.name || 'New household'}</h2></div><button className="close-button" onClick={() => setProfileDraft(null)}>×</button></div>
            <div className="drawer-fields">
              <label>Household name<input value={profileDraft.name} onChange={event => setProfileDraft(current => ({ ...current, name: event.target.value }))} /></label>
              <label>Number of people<input type="number" min="1" value={profileDraft.members} onChange={event => setProfileDraft(current => ({ ...current, members: Number(event.target.value) }))} /></label>
              <label>Dietary needs or preferences<textarea className="short-textarea" value={profileDraft.dietary} onChange={event => setProfileDraft(current => ({ ...current, dietary: event.target.value }))} /></label>
            </div>
            <button className="primary-button drawer-save" disabled={!profileDraft.name.trim()} onClick={() => {
              setHouseholdProfiles(current => current.some(profile => profile.id === profileDraft.id) ? current.map(profile => profile.id === profileDraft.id ? profileDraft : profile) : [...current, profileDraft])
              setHouseholds(current => Math.max(Number(current), householdProfiles.length + 1))
              setProfileDraft(null)
            }}>Save profile</button>
          </aside>
        </div>
      )}
    </div>
  )
}

function Volunteers({ tasks, setTasks }) {
  const [draft, setDraft] = useState(null)
  const openCount = tasks.filter(task => task.status === 'Open').length
  return (
    <div className="page">
      <Header eyebrow="VOLUNTEERS" title="Volunteer tasks" action={<button className="primary-button" onClick={() => setDraft({ id: Date.now(), title: '', volunteer: '', date: '2026-11-27', status: 'Open' })}><Icon name="plus" size={18} /> Assign task</button>} />
      <section className="volunteer-summary stats-grid">
        <div className="stat-card"><span className="stat-icon mint"><Icon name="users" /></span><div><strong>{openCount}</strong><span>open tasks</span></div></div>
        <div className="stat-card"><span className="stat-icon gold"><Icon name="calendar" /></span><div><strong>{new Set(tasks.map(task => task.volunteer)).size}</strong><span>volunteers involved</span></div></div>
        <div className="stat-card"><span className="stat-icon peach"><Icon name="check" /></span><div><strong>{tasks.filter(task => task.status === 'Complete').length}</strong><span>tasks completed</span></div></div>
      </section>
      <section className="task-board panel">
        {tasks.map(task => (
          <button className="volunteer-row" key={task.id} onClick={() => setDraft({ ...task })}>
            <span className={`task-status ${task.status.toLowerCase()}`}><Icon name={task.status === 'Complete' ? 'check' : 'calendar'} size={16} /></span>
            <span className="volunteer-main"><strong>{task.title}</strong><small>{task.volunteer} · {task.date}</small></span>
            <span className={`status ${task.status === 'Complete' ? 'good' : 'use-soon'}`}>{task.status}</span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </section>
      {draft && (
        <div className="drawer-backdrop" onMouseDown={event => event.target === event.currentTarget && setDraft(null)}>
          <aside className="drawer">
            <div className="drawer-header"><div><p className="eyebrow">TASK ASSIGNMENT</p><h2>{draft.title || 'New volunteer task'}</h2></div><button className="close-button" onClick={() => setDraft(null)}>×</button></div>
            <div className="drawer-fields">
              <label>Task<input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} /></label>
              <label>Volunteer<input value={draft.volunteer} onChange={event => setDraft(current => ({ ...current, volunteer: event.target.value }))} /></label>
              <label>Due date<input type="date" value={draft.date} onChange={event => setDraft(current => ({ ...current, date: event.target.value }))} /></label>
              <label>Status<select value={draft.status} onChange={event => setDraft(current => ({ ...current, status: event.target.value }))}><option>Open</option><option>Complete</option></select></label>
            </div>
            <button className="primary-button drawer-save" disabled={!draft.title.trim() || !draft.volunteer.trim()} onClick={() => {
              setTasks(current => current.some(task => task.id === draft.id) ? current.map(task => task.id === draft.id ? draft : task) : [...current, draft])
              setDraft(null)
            }}>Save task</button>
          </aside>
        </div>
      )}
    </div>
  )
}

function Reports({ inventory, donationHistory, households, tasks }) {
  const lowCount = inventory.filter(item => item.status !== 'Good').length
  const confirmedQuantity = donationHistory.reduce((total, item) => total + Number(item.quantity || 0), 0)
  const exportCsv = () => {
    const rows = [['Item', 'Quantity', 'Unit', 'Category', 'Storage', 'Use-by date'], ...inventory.map(item => [item.item, item.quantity, item.unit, item.category, item.storage, item.expiresAt || ''])]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'pantry-report.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="page">
      <Header eyebrow="REPORTS" title="Pantry overview" action={<button className="secondary-button" onClick={exportCsv}>Export CSV</button>} />
      <section className="report-grid">
        <div className="report-card"><p className="eyebrow">INVENTORY</p><strong>{inventory.length}</strong><span>items currently tracked</span></div>
        <div className="report-card"><p className="eyebrow">DONATIONS</p><strong>{donationHistory.length}</strong><span>confirmed records</span></div>
        <div className="report-card"><p className="eyebrow">DISTRIBUTION</p><strong>{households}</strong><span>households planned</span></div>
        <div className="report-card"><p className="eyebrow">ATTENTION</p><strong>{lowCount}</strong><span>stock items need review</span></div>
      </section>
      <div className="report-layout">
        <section className="panel report-chart">
          <div className="panel-heading"><div><p className="eyebrow">THIS WEEK</p><h2>Activities at a glance</h2></div></div>
          <div className="bar-list">
            {[['Confirmed donation quantity', confirmedQuantity, 100], ['Households to serve', households, 100], ['Volunteer tasks', tasks.length, 20], ['Low-stock items', lowCount, 20]].map(([label, value, scale]) => (
              <div className="bar-row" key={label}><div><strong>{label}</strong><span>{value}</span></div><div className="report-bar"><span style={{ width: `${Math.min(100, value / scale * 100)}%` }} /></div></div>
            ))}
          </div>
        </section>
        <aside className="panel print-summary">
          <p className="eyebrow">WEEKLY SUMMARY</p>
          <h2>Coordinator review</h2>
          <p>{lowCount} pantry items need attention.</p>
          <p>{tasks.filter(task => task.status === 'Open').length} volunteer tasks are still open.</p>
          <p>{households} household boxes are planned for the next distribution.</p>
          <button className="primary-button full" onClick={() => window.print()}>Print summary</button>
        </aside>
      </div>
    </div>
  )
}

export default App
