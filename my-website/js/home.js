const API_KEY = 'bb6302aa8a6d38895b024e4649cc2c07';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/original';
    let currentItem;
    let bannerItem;

    async function fetchTrending(type) {
      const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
      const data = await res.json();
      return data.results;
    }

    async function fetchTrendingAnime() {
  let allResults = [];

  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }

  return allResults;
}

/* ADD IT HERE */
async function fetchPopular(){

  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);

  const data = await res.json();

  return data.results;

}


async function displayBanner(item){

bannerItem = item;

const banner = document.getElementById('banner');

banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;

document.getElementById('banner-title').textContent = item.title || item.name;

document.getElementById('banner-description').textContent =
item.overview ? item.overview.substring(0,120) + "..." : "";

const type = item.title ? "movie" : "tv";



}

function watchNow() {
  if (bannerItem) {
    showDetails(bannerItem);
  }
}

function unmuteTrailer(){
  const iframe = document.getElementById("banner-trailer");
  iframe.src = iframe.src.replace("mute=1","mute=0");
}

    function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  items.forEach(item => {

    const card = document.createElement("div");
    card.className = "movie-card";

    const img = document.createElement("img");
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;

    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("h4");
    title.textContent = item.title || item.name;

    const rating = document.createElement("span");
    rating.textContent = "⭐ " + item.vote_average.toFixed(1);

    info.appendChild(title);
    info.appendChild(rating);

    card.appendChild(img);
    card.appendChild(info);

    card.onclick = () => {
  const type = item.title ? "movie" : "tv";
  window.location.href = `watch.html?id=${item.id}&type=${type}`;
};

    container.appendChild(card);

  });
}

    function showDetails(item) {

  stopBannerTrailer(); // stop banner trailer

  currentItem = item;
      document.getElementById('modal-title').textContent = item.title || item.name;
      document.getElementById('modal-description').textContent = item.overview;
      document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
      document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
      changeServer();
      document.getElementById('modal').style.display = 'flex';
    }

function changeServer(){

const server = document.getElementById("server").value;
const type = currentItem.title ? "movie" : "tv";

const url = `https://${server}/embed/${type}/${currentItem.id}`;

document.getElementById("modal-video").src = url;

}

    function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';

  init(); // restart banner trailer
}
function openSearchModal() {

  stopBannerTrailer();

  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
    document.body.style.overflow = "hidden";
}
    function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
    document.body.style.overflow = "auto";
}

    async function searchTMDB() {
      const query = document.getElementById('search-input').value;
      if (!query.trim()) {
        document.getElementById('search-results').innerHTML = '';
        return;
      }

      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
      const data = await res.json();

      const container = document.getElementById('search-results');
      container.innerHTML = '';
      data.results.forEach(item => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        container.appendChild(img);
      });
    }

    async function init() {

const movies = await fetchTrending('movie');
const tvShows = await fetchTrending('tv');
const anime = await fetchTrendingAnime();
const popular = await fetchPopular();

displayBanner(movies[Math.floor(Math.random() * movies.length)]);
displayList(movies, 'movies-list');
displayList(tvShows, 'tvshows-list');
displayList(anime, 'anime-list');
displayList(popular, 'popular-list');

/* AUTO ROTATING BANNER */
setInterval(()=>{
  displayBanner(movies[Math.floor(Math.random()*movies.length)]);
},8000);

}
function stopBannerTrailer(){
  const iframe = document.getElementById("banner-trailer");
  if(iframe){
    iframe.src = "";
  }
}

    async function fetchTrailer(type,id){

const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
const data = await res.json();

const trailer = data.results.find(
v => v.type === "Trailer" && v.site === "YouTube"
);

return trailer ? trailer.key : null;

}

document.addEventListener("click", function(e){

  const banner = document.getElementById("banner");

  if(banner && !banner.contains(e.target)){
    stopBannerTrailer();
  }

});

document.getElementById("search-modal").addEventListener("click", function(e){
  if(e.target.id === "search-modal"){
    closeSearchModal();
  }
});


function scrollRow(id, direction){

  const container = document.getElementById(id);

  const scrollAmount = 500;

  container.scrollBy({
    left: scrollAmount * direction,
    behavior: "smooth"
  });

}

init();





























