const browserView = document.getElementById('browserView');
const addressBar = document.getElementById('addressBar');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const aiInput = document.getElementById('aiInput');
const aiSearchBtn = document.getElementById('aiSearchBtn');
const aiAnswerEl = document.getElementById('aiAnswer');
const sourceListEl = document.getElementById('sourceList');
const loadingEl = document.getElementById('loading');

const defaultProviders = {
  Google: 'https://www.google.com/search?q=',
  DuckDuckGo: 'https://duckduckgo.com/?q=',
  Bing: 'https://www.bing.com/search?q='
};

function buildSearchUrl(engine, query) {
  return `${defaultProviders[engine] || defaultProviders.Google}${encodeURIComponent(query)}`;
}

function setAddress(url) {
  addressBar.value = url;
}

function navigateTo(value) {
  if (!value) return;

  let next = value.trim();

  if (!/^https?:\/\//i.test(next)) {
    const activeEngine = document.querySelector('.topic.active')?.dataset.engine || 'Google';
    next = buildSearchUrl(activeEngine, next);
  }

  browserView.src = next;
  setAddress(next);
}

goBtn.addEventListener('click', () => navigateTo(addressBar.value));
addressBar.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    navigateTo(addressBar.value);
  }
});

backBtn.addEventListener('click', () => browserView.goBack());
forwardBtn.addEventListener('click', () => browserView.goForward());
reloadBtn.addEventListener('click', () => browserView.reload());

document.querySelectorAll('.topic').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.topic').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const currentValue = addressBar.value.trim();
    if (currentValue && !/^https?:\/\//i.test(currentValue)) {
      navigateTo(currentValue);
    }
  });
});

browserView.addEventListener('did-finish-load', () => {
  setAddress(browserView.getURL());
});

async function fetchAIAnswer(query) {
  const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;

  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('Search API request failed');
  }

  const data = await response.json();
  return data;
}

function normalizeSourceItems(data) {
  const items = [];

  if (data && data.AbstractText) {
    items.push({ label: 'Quick answer', text: data.AbstractText, link: data.AbstractURL || '#' });
  }

  if (Array.isArray(data.RelatedTopics)) {
    data.RelatedTopics.slice(0, 4).forEach((topic) => {
      if (topic && topic.Text) {
        items.push({ label: 'Related topic', text: topic.Text, link: topic.FirstURL || '#' });
      }
    });
  }

  if (Array.isArray(data.Results) && data.Results.length) {
    data.Results.slice(0, 3).forEach((result) => {
      if (result && result.Text) {
        items.push({ label: 'Result', text: result.Text, link: result.FirstURL || '#' });
      }
    });
  }

  return items.slice(0, 5);
}

async function runAIQuery() {
  const query = aiInput.value.trim();
  if (!query) {
    aiAnswerEl.textContent = 'Please type a search query first.';
    return;
  }

  loadingEl.classList.remove('hidden');
  aiAnswerEl.textContent = 'Searching the web...';
  sourceListEl.innerHTML = '';

  try {
    const data = await fetchAIAnswer(query);
    const results = normalizeSourceItems(data);

    const summary = data.AbstractText || data.Heading || 'No direct summary found, but here are web results.';
    aiAnswerEl.textContent = summary;

    const items = results.length ? results : [{ label: 'Search result', text: 'No direct result found. Try a more specific search.', link: '#' }];

    sourceListEl.innerHTML = items
      .map((item) => `
        <li>
          <strong>${item.label}:</strong> ${item.text}
          ${item.link !== '#' ? `<br><a href="${item.link}" target="_blank" rel="noreferrer">Open</a>` : ''}
        </li>
      `)
      .join('');

    navigateTo(buildSearchUrl(document.querySelector('.topic.active')?.dataset.engine || 'Google', query));
  } catch (error) {
    aiAnswerEl.textContent = 'The AI search failed. Please check your internet connection and try again.';
    sourceListEl.innerHTML = '<li>Could not fetch search results.</li>';
  } finally {
    loadingEl.classList.add('hidden');
  }
}

aiSearchBtn.addEventListener('click', runAIQuery);
aiInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    runAIQuery();
  }
});

document.getElementById('askBtn').addEventListener('click', () => {
  if (aiInput.value.trim()) {
    runAIQuery();
  }
});

setAddress(browserView.src);
