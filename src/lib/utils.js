export function generateRequestCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `TRX-${year}-${rand}`
}

export function generateSupplierCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `BIZ-${year}-${rand}`
}

export function generateOfferCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `OFR-${year}-${rand}`
}

export function generateMatchCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `MCH-${year}-${rand}`
}

export function generateTxCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `TXN-${year}-${rand}`
}

export function formatZMW(amount) {
  if (!amount && amount !== 0) return '—'
  return `K ${Number(amount).toLocaleString('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-ZM', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-ZM', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(date) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60)    return 'just now'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export const REQUEST_STATUS_LABELS = {
  draft:             'Draft',
  submitted:         'Submitted',
  matching:          'Finding Suppliers',
  offers_received:   'Offers Received',
  supplier_selected: 'Supplier Selected',
  closed:            'Closed',
}

export const REQUEST_STATUS_COLORS = {
  draft:             'badge-gray',
  submitted:         'badge-blue',
  matching:          'badge-purple',
  offers_received:   'badge-amber',
  supplier_selected: 'badge-green',
  closed:            'badge-gray',
}

export const SUPPLIER_STATUS_LABELS = {
  pending:   'Pending Approval',
  active:    'Active',
  suspended: 'Suspended',
  rejected:  'Rejected',
  deleted:   'Deleted',
}

export const SUPPLIER_STATUS_COLORS = {
  pending:   'badge-amber',
  active:    'badge-green',
  suspended: 'badge-red',
  rejected:  'badge-red',
  deleted:   'badge-gray',
}

export const ZAMBIA_PROVINCES = {
  'Lusaka Province':        ['Lusaka','Kafue','Chongwe','Luangwa','Chilanga'],
  'Copperbelt Province':    ['Ndola','Kitwe','Chingola','Mufulira','Luanshya','Kalulushi','Chililabombwe'],
  'Eastern Province':       ['Chipata','Petauke','Lundazi','Katete','Chadiza'],
  'Southern Province':      ['Livingstone','Mazabuka','Choma','Monze','Kalomo','Siavonga'],
  'Central Province':       ['Kabwe','Mkushi','Serenje','Mumbwa','Kapiri Mposhi'],
  'North-Western Province': ['Solwezi','Kasempa','Mwinilunga','Zambezi','Kabompo'],
  'Northern Province':      ['Kasama','Mbala','Mporokoso','Luwingu','Mpulungu'],
  'Luapula Province':       ['Mansa','Nchelenge','Kawambwa','Samfya','Mwense'],
  'Western Province':       ['Mongu','Senanga','Kaoma','Kalabo','Sesheke'],
  'Muchinga Province':      ['Chinsali','Mpika','Nakonde','Isoka'],
}

export const SOURCING_COUNTRIES = [
  { code: 'ZM', name: 'Zambia',         flag: '🇿🇲' },
  { code: 'ZA', name: 'South Africa',   flag: '🇿🇦' },
  { code: 'CN', name: 'China',          flag: '🇨🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States',  flag: '🇺🇸' },
]

export function truncate(str, n = 80) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function extractKeywords(text) {
  const stopWords = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','need','want','looking','require'])
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .slice(0, 10)
}
