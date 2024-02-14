"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = 'https://api.tvmaze.com';
const IMAGE_DEFAULT_URL = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const params = new URLSearchParams({ q: term });

  const response = await fetch(`${BASE_URL}/search/shows?${params}`);
  const showsData = await response.json();

  return showsData.map(showData => showData = {
    id: showData.show.id,
    name: showData.show.name,
    summary: showData.show.summary,
    image: (showData.show.image
      ? showData.show.image.medium
      : IMAGE_DEFAULT_URL)
  });

  // commented out - placeholder (leaving for reference)
  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
  const response = await fetch(`${BASE_URL}/shows/${showId}/episodes`);
  const episodesData = await response.json();

  return episodesData.map(episodeData => episodeData = {
    id: episodeData.id,
    name: episodeData.name,
    season: episodeData.season,
    number: episodeData.number
  });
}

/** Given list of episodes, create list item for each and append to DOM.
 *
 * An episode is {id, name, season, number} */

function displayEpisodes(episodes) {
  episodes.forEach(episode => {
    $("<li>")
      .text(`${episode.name} (season ${episode.season}, number ${episode.number})`)
      .appendTo($episodesArea);
  });

  $episodesArea.css("display", "inline-block");
}


/** Get episodes of specific show ID (string of numbers) and display episodes
 *  as a list
*/

async function getEpisodesAndDisplay(showId) {
  const episodes = await getEpisodesOfShow(showId);
  displayEpisodes(episodes);
}
