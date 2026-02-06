const newsContainer = document.getElementById('newsContainer');
const loadMoreBtn = document.getElementById('loadMore');
const tabs = document.querySelectorAll('.nav-links li');

let allNewsIds = [];       // lista completa degli ID della sezione corrente
let currentIndex = 0;      // indice corrente
const batchSize = 10;      // numero di news per batch
let currentSection = 'newstories'; // sezione iniziale

// Recupera la lista di ID in base alla sezione
async function fetchNewsIds(section) {
  try {
    document.getElementById('loader').classList.remove('hidden');
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${section}.json`);
    if (!response.ok) throw new Error('Errore nel recupero della lista delle news');
    allNewsIds = await response.json();
    currentIndex = 0;
    newsContainer.innerHTML = ''; // reset della lista
    loadNextBatch();
  } catch (error) {
    console.error('Si è verificato un errore:', error);
  } finally {
    document.getElementById('loader').classList.add('hidden');
  }
}

// Recupera il dettaglio di una singola news
async function fetchNewsDetail(id) {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    if (!response.ok) throw new Error(`Errore nel recupero della news con ID ${id}`);
    return await response.json();
  } catch (error) {
    console.error('Errore nel fetch della news:', error);
    return null;
  }
}

// Carica il prossimo batch di news
async function loadNextBatch() {
  const nextIds = allNewsIds.slice(currentIndex, currentIndex + batchSize);
  const newsPromises = nextIds.map(id => fetchNewsDetail(id));
  const newsDetails = await Promise.all(newsPromises);

  newsDetails.forEach(news => {
    if (!news) return;
    const date = new Date(news.time * 1000).toLocaleString();
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
      <a href="${news.url}" target="_blank">${news.title}</a>
      <div>Data: ${date}</div>
    `;
    newsContainer.appendChild(newsItem);
  });

  currentIndex += batchSize;

  if (currentIndex >= allNewsIds.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

// Event listener per Load More
loadMoreBtn.addEventListener('click', loadNextBatch);

// Event listener per le tab
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentSection = tab.dataset.type;
    fetchNewsIds(currentSection);
  });
});

// Avvio iniziale
fetchNewsIds(currentSection);
