
const listAutocomplete = document.getElementById('listAutocomplete');
const listHistory = document.getElementById('listHistory');
const wrapHistory = document.getElementById('wrapHistory');
const searchWrap = document.getElementById('searchWrap');
const searchInput = document.getElementById('inputSearch');
const selectedCharacter = document.getElementById('selectedCharacter');
const clearHistory = document.getElementById('clearHistory');
const charName = document.getElementById('charName');
const charHeight = document.getElementById('charHeight');
const charMass = document.getElementById('charMass');
const charHairColor = document.getElementById('charHairColor');
const charSkinColor = document.getElementById('charSkinColor');
const searchClear = document.getElementById('searchClear');

searchInput.addEventListener('keyup', makeRequest);
searchInput.addEventListener('focus', showHistory);
searchClear.addEventListener('click', clearSearchInput);
clearHistory.addEventListener('click', clearLocalStorage);

function clearSearchInput() {
  searchInput.value = '';
  searchClear.classList.remove('show');
  listAutocomplete.classList.remove('show');
  searchInput.focus();
}

async function makeRequest(event) {
  const string = event.target.value;
  const options = {
    method: 'GET',
  };

  if (string !== '') {
    searchClear.classList.add('show');
    searchWrap.classList.add('loading');
    await fetch(
      `https://swapi.co/api/people?search=${string}`,
      options,
    ).then((res) => res.json().then((jsonRes) => {
      populateAutoComplete(jsonRes.results, string);
      showHistory();
    }));
  } else {
    listAutocomplete.innerHTML = '';
  }
}

function removeHistoryItem(event) {
  const clickedIndex = Array.prototype.indexOf.call(
    listHistory.childNodes,
    event.target.parentNode.parentNode,
  );

  const history = JSON.parse(localStorage.getItem('history'));
  history.splice(clickedIndex, 1);

  if (history.length === 0) {
    localStorage.removeItem('history');
  } else {
    localStorage.setItem('history', JSON.stringify(history));
  }
  showHistory();
}

function showHistory(event) {
  if (localStorage.getItem('history') !== null) {
    searchHistory = JSON.parse(localStorage.getItem('history'));
    listHistory.innerHTML = '';

    searchHistory.forEach((item) => {
      const a = document.createElement('a');
      a.innerText = item.name;
      a.setAttribute('data-url', item.url);
      a.addEventListener('click', selectCharacter);

      const p = document.createElement('p');
      p.innerText = item.date;

      const button = document.createElement('button');

      const div = document.createElement('div');
      div.classList.add('item-info');

      div.append(p);
      div.append(button);
      button.addEventListener('click', removeHistoryItem);

      const li = document.createElement('li');

      li.append(a);
      li.append(div);

      listHistory.append(li);
    });

    wrapHistory.classList.add('show');
  } else if (wrapHistory.classList.contains('show')) {
    wrapHistory.classList.remove('show');
  }
}

function highlight(fullString, highlightText) {
  let newText = fullString.toLowerCase();
  const index = newText.indexOf(highlightText.toLowerCase());

  if (index >= 0) {
    newText = `${newText.substring(
      0,
      index,
    )}<span class='highlight'>${newText.substring(
      index,
      index + highlightText.length,
    )}</span>${newText.substring(index + highlightText.length)}`;
  }
  return newText;
}

function saveToHistory(event) {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}, ${date.getHours()}:${date.getMinutes().toString().length === 1 ? `0${date.getMinutes()}` : date.getMinutes()}`;
  let characterName = event.target.innerText;
  let characterUrl = event.target.dataset.url;

  if (event.target.className === 'highlight') {
    characterName = event.target.parentNode.innerText;
    characterUrl = event.target.parentNode.dataset.url;
  }

  if (localStorage.getItem('history') === null) {
    localStorage.setItem(
      'history',
      JSON.stringify([{ name: characterName, url: characterUrl, date: dateString }]),
    );
  } else {
    const searchHistory = JSON.parse(localStorage.getItem('history'));
    searchHistory.unshift({ name: characterName, url: characterUrl, date: dateString });
    localStorage.setItem('history', JSON.stringify(searchHistory));
  }
}

function selectCharacter(event) {
  let { url } = event.target.dataset;

  if (event.target.className === 'highlight') {
    url = event.target.parentNode.dataset.url;
  }

  listAutocomplete.classList.remove('show');
  listAutocomplete.innerHTML = '';
  wrapHistory.classList.remove('show');

  fetch(url).then((res) => res.json().then((json) => {
    charName.innerHTML = json.name;
    charHeight.innerHTML = json.height;
    charMass.innerHTML = json.mass;
    charHairColor.innerHTML = json.hair_color;
    charSkinColor.innerHTML = json.skin_color;
    searchInput.value = json.name;
    selectedCharacter.classList.add('show');
    searchClear.classList.add('show');
  }));
}

function populateAutoComplete(results, string) {
  listAutocomplete.innerHTML = '';
  results.forEach((item, i) => {
    if (i < 10) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.innerHTML = highlight(item.name, string);
      a.setAttribute('data-url', item.url);
      a.addEventListener('click', selectCharacter);
      a.addEventListener('click', saveToHistory);
      a.tabIndex = '-1';

      li.appendChild(a);
      listAutocomplete.appendChild(li);
      searchWrap.classList.remove('loading');
      listAutocomplete.classList.add('show');
    }
  });
}

function clearLocalStorage() {
  localStorage.removeItem('history');
  wrapHistory.classList.remove('show');
}
