import profile from './data/profile.json'
import newsData from './data/news.json'
import eventsData from './data/events.json'
import site from './data/site.json'

const $ = (selector) => document.querySelector(selector)
const baseUrl = import.meta.env.BASE_URL

const safeUrl = (value, fallback = '#') => {
  if (!value) return fallback
  try {
    const url = new URL(value, window.location.origin)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : fallback
  } catch {
    return fallback
  }
}

const text = (tag, value, className) => {
  const element = document.createElement(tag)
  element.textContent = value
  if (className) element.className = className
  return element
}

const emptyState = (message) => text('p', message, 'content-empty')

const renderProfile = () => {
  const photo = $('.profile-photo')
  photo.src = `${baseUrl}${profile.image.replace(/^\//, '')}`
  photo.alt = profile.imageAlt

  $('#profile-body').replaceChildren(...profile.biography.map((paragraph) => text('p', paragraph)))
  $('#profile-details').replaceChildren(...profile.details.map(({ label, value }) => {
    const row = document.createElement('tr')
    row.append(text('th', label), text('td', value))
    return row
  }))
  $('#profile-awards').replaceChildren(...profile.awards.map((award) => text('li', award)))
}

const renderNews = () => {
  const list = $('#news-list')
  const published = newsData.items.filter((item) => item.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  if (!published.length) {
    list.replaceChildren(emptyState('現在公開中のお知らせはありません。'))
    return
  }
  list.replaceChildren(...published.map((item) => {
    const row = document.createElement('li')
    row.className = 'news-item'
    const link = document.createElement('a')
    link.className = 'news-text'
    link.href = safeUrl(item.url)
    link.textContent = item.title
    if (link.href.startsWith('http')) link.rel = 'noopener noreferrer'
    row.append(text('time', item.publishedAt.replaceAll('-', '.'), 'news-date'), text('span', item.category, `news-tag tag-${item.category.toLowerCase()}`), link)
    return row
  }))
}

const isVisibleEvent = (event) => event.status === 'published' && (!event.displayUntil || new Date(`${event.displayUntil}T23:59:59+09:00`) >= new Date())

const renderEvents = () => {
  const list = $('#concert-list')
  const published = eventsData.items.filter(isVisibleEvent).sort((a, b) => a.startAt.localeCompare(b.startAt))
  if (!published.length) {
    list.replaceChildren(emptyState('現在公開中の公演情報はありません。'))
    return
  }
  list.replaceChildren(...published.map((event) => {
    const date = new Date(event.startAt)
    const card = document.createElement('article')
    card.className = 'concert-card'
    card.dataset.type = event.category
    const dateBlock = document.createElement('div')
    dateBlock.className = 'concert-date-block'
    dateBlock.append(text('span', date.toLocaleString('en-US', { month: 'short' }).toUpperCase(), 'c-month'), text('span', String(date.getDate()), 'c-day'), text('span', String(date.getFullYear()), 'c-year'))
    const info = document.createElement('div')
    info.className = 'concert-info'
    info.append(text('p', event.categoryLabel, 'concert-type-label'), text('h3', event.title, 'concert-name'), text('p', event.venue, 'concert-venue'), text('p', event.timeNote, 'concert-detail'), text('p', `プログラム：${event.program}`, 'concert-program'))
    card.append(dateBlock, info)
    if (safeUrl(event.ticketUrl) !== '#') {
      const action = document.createElement('div')
      action.className = 'concert-action'
      const ticket = document.createElement('a')
      ticket.className = 'btn-ticket'
      ticket.href = safeUrl(event.ticketUrl)
      ticket.textContent = event.ticketLabel || '詳細・チケット'
      ticket.rel = 'noopener noreferrer'
      action.append(ticket)
      card.append(action)
    }
    return card
  }))
}

const renderContact = () => {
  $('#contact-info').replaceChildren(...site.contact.map(({ label, value, url }) => {
    const row = document.createElement('div')
    row.className = 'contact-row'
    const content = url ? document.createElement('a') : document.createElement('span')
    content.textContent = value
    if (url) content.href = safeUrl(url)
    row.append(text('span', label, 'contact-label'), content)
    return row
  }))
  $('#social-links').replaceChildren(...site.social.filter(({ url }) => safeUrl(url) !== '#').map(({ label, url }) => {
    const link = document.createElement('a')
    link.className = 'social-btn'
    link.href = safeUrl(url)
    link.textContent = label
    link.setAttribute('aria-label', label)
    link.rel = 'noopener noreferrer'
    return link
  }))
}

const initialiseNavigation = () => {
  const header = $('#site-header')
  const navToggle = $('#navToggle')
  const globalNav = $('#global-nav')
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  navToggle.addEventListener('click', () => {
    const isOpen = globalNav.classList.toggle('open')
    navToggle.classList.toggle('open', isOpen)
    navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く')
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', (event) => {
    const target = $(anchor.getAttribute('href'))
    if (!target) return
    event.preventDefault()
    globalNav.classList.remove('open')
    navToggle.classList.remove('open')
    document.body.style.overflow = ''
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 16, behavior: 'smooth' })
  }))
}

const initialiseFilters = () => document.querySelectorAll('.filter-btn').forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter
  document.querySelectorAll('.filter-btn').forEach((item) => item.classList.toggle('active', item === button))
  document.querySelectorAll('.concert-card').forEach((card) => card.classList.toggle('hidden', filter !== 'all' && card.dataset.type !== filter))
}))

const initialiseAnimation = () => {
  const targets = document.querySelectorAll('.news-item, .concert-card, .disc-card, .media-card, .profile-body p, .profile-awards li')
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
  targets.forEach((element, index) => {
    element.style.opacity = '0'
    element.style.transform = 'translateY(20px)'
    element.style.transition = `opacity 0.6s ease ${(index % 6) * 0.07}s, transform 0.6s ease ${(index % 6) * 0.07}s`
    observer.observe(element)
  })
}

renderProfile()
renderNews()
renderEvents()
renderContact()
initialiseNavigation()
initialiseFilters()
initialiseAnimation()
