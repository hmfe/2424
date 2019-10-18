class SearchApplication {
  constructor() {
    this.listAutocomplete = document.getElementById('listAutocomplete');
    this.listHistory = document.getElementById('listHistory');
    this.wrapHistory = document.getElementById('wrapHistory');
    this.searchWrap = document.getElementById('searchWrap');
    this.searchInput = document.getElementById('inputSearch');
    this.selectedCharacter = document.getElementById('selectedCharacter');
    this.clearHistory = document.getElementById('clearHistory');
    this.charName = document.getElementById('charName');
    this.charHeight = document.getElementById('charHeight');
    this.charMass = document.getElementById('charMass');
    this.charHairColor = document.getElementById('charHairColor');
    this.charSkinColor = document.getElementById('charSkinColor');
    this.searchClear = document.getElementById('searchClear');

    this.newText = '';
    this.searchInput.addEventListener('keyup', this.makeRequest.bind(this));
    this.searchInput.addEventListener('focus', this.showHistory.bind(this));
    this.searchClear.addEventListener('click', this.clearSearchInput.bind(this));
    this.clearHistory.addEventListener('click', this.clearLocalStorage.bind(this));
  }

  clearSearchInput() {
    this.searchInput.value = '';
    this.searchClear.classList.remove('show');
    this.listAutocomplete.classList.remove('show');
    this.searchInput.focus();
  }

  highlight(fullString, highlightText) {
    this.newText = fullString.toLowerCase();
    const index = this.newText.indexOf(highlightText.toLowerCase());

    if (index >= 0) {
      this.newText = `${this.newText.substring(
        0,
        index,
      )}<span class='highlight'>${this.newText.substring(
        index,
        index + highlightText.length,
      )}</span>${this.newText.substring(index + highlightText.length)}`;
    }
    return this.newText;
  }

  populateAutoComplete(results, string) {
    this.listAutocomplete.innerHTML = '';
    results.forEach((item, i) => {
      if (i < 10) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.innerHTML = this.highlight(item.name, string);
        a.setAttribute('data-url', item.url);
        a.addEventListener('click', this.selectCharacter.bind(this));
        a.addEventListener('click', this.saveToHistory.bind(this));
        a.tabIndex = '-1';

        li.appendChild(a);
        this.listAutocomplete.appendChild(li);
        this.searchWrap.classList.remove('loading');
        this.listAutocomplete.classList.add('show');
      }
    });
  }


  showHistory() {
    if (localStorage.getItem('history') !== null) {
      this.searchHistory = JSON.parse(localStorage.getItem('history'));
      this.listHistory.innerHTML = '';
      this.searchHistory.forEach((item) => {
        const a = document.createElement('a');
        a.innerText = item.name;
        a.setAttribute('data-url', item.url);
        a.addEventListener('click', this.selectCharacter.bind(this));

        const p = document.createElement('p');
        p.innerText = item.date;

        const button = document.createElement('button');

        const div = document.createElement('div');
        div.classList.add('item-info');

        div.append(p);
        div.append(button);
        button.addEventListener('click', this.removeHistoryItem.bind(this));

        const li = document.createElement('li');

        li.append(a);
        li.append(div);

        this.listHistory.append(li);
      });

      this.wrapHistory.classList.add('show');
    } else if (this.wrapHistory.classList.contains('show')) {
      this.wrapHistory.classList.remove('show');
    }
  }

  async makeRequest(event) {
    const string = event.target.value;
    const options = {
      method: 'GET',
    };

    if (string !== '') {
      this.searchClear.classList.add('show');
      this.searchWrap.classList.add('loading');
      await fetch(
        `https://swapi.co/api/people?search=${string}`,
        options,
      ).then((res) => res.json().then((jsonRes) => {
        this.populateAutoComplete(jsonRes.results, string);
        this.showHistory();
      }));
    } else {
      this.listAutocomplete.innerHTML = '';
    }
  }

  removeHistoryItem(event) {
    const clickedIndex = Array.prototype.indexOf.call(
      this.listHistory.childNodes,
      event.target.parentNode.parentNode,
    );

    const history = JSON.parse(localStorage.getItem('history'));
    history.splice(clickedIndex, 1);

    if (history.length === 0) {
      localStorage.removeItem('history');
    } else {
      localStorage.setItem('history', JSON.stringify(history));
    }
    this.showHistory();
  }


  saveToHistory(event) {
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
      this.searchHistory.unshift({ name: characterName, url: characterUrl, date: dateString });
      localStorage.setItem('history', JSON.stringify(searchHistory));
    }
  }

  selectCharacter(event) {
    let { url } = event.target.dataset;

    if (event.target.className === 'highlight') {
      url = event.target.parentNode.dataset.url;
    }

    this.listAutocomplete.classList.remove('show');
    this.listAutocomplete.innerHTML = '';
    this.wrapHistory.classList.remove('show');

    fetch(url).then((res) => res.json().then((json) => {
      this.charName.innerHTML = json.name;
      this.charHeight.innerHTML = json.height;
      this.charMass.innerHTML = json.mass;
      this.charHairColor.innerHTML = json.hair_color;
      this.charSkinColor.innerHTML = json.skin_color;
      this.searchInput.value = json.name;
      this.selectedCharacter.classList.add('show');
      this.searchClear.classList.add('show');
    }));
  }

  clearLocalStorage() {
    localStorage.removeItem('history');
    this.wrapHistory.classList.remove('show');
  }
}

const search = new SearchApplication();


// export default search;
//
