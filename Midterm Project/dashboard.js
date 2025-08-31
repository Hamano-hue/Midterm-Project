// dashboard.js - displays live tallies and reacts to storage events with async/await delay

(function () {
  'use strict';

  const ELECTION_KEY = 'electionData_v1';

  function setYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function getElectionData() {
    return JSON.parse(localStorage.getItem(ELECTION_KEY)) || { votes: {}, votedIds: [] };
  }

  function setUpdateNote(msg, type = '') {
    const el = document.getElementById('updateNote');
    el.textContent = msg || '';
    el.className = 'message' + (type ? ' ' + type : ' subtle');
  }

  function createTallyRow(name, count) {
    const row = document.createElement('div');
    row.className = 'candidate';

    const label = document.createElement('div');
    Object.assign(label.style, { display: 'flex', alignItems: 'center', gap: '10px' });
    label.innerHTML = `<strong>${name}</strong>`;

    const badge = document.createElement('span');
    badge.className = 'btn';
    badge.textContent = count;

    row.append(label, badge);
    return row;
  }

  function render() {
    const { votes } = getElectionData();
    const root = document.getElementById('dashboard');
    root.innerHTML = '';

    const labels = {
      presidents: 'Presidential Tally',
      vicePresidents: 'Vice Presidential Tally',
      treasurers: 'Treasurer Tally',
      secretaries: 'Secretary Tally',
      pios: 'PIO Tally'
    };

    Object.entries(votes).forEach(([positionKey, tallyObj]) => {
      const section = document.createElement('section');
      section.className = 'section';
      section.innerHTML = `<h3>${labels[positionKey] || positionKey}</h3>`;

      const list = document.createElement('div');
      list.className = 'candidates';

      Object.entries(tallyObj).forEach(([name, count]) =>
        list.appendChild(createTallyRow(name, count))
      );

      section.appendChild(list);
      root.appendChild(section);
    });
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function refreshWithDelay(reason = '') {
    setUpdateNote(reason || 'Refreshing tallies...');
    await delay(500);
    render();
    setUpdateNote('Tallies updated.');
  }

  function onReady() {
    setYear();
    render();
    document.getElementById('refreshBtn').addEventListener('click', () =>
      refreshWithDelay('Manual refresh triggered...')
    );
    window.addEventListener('storage', e => {
      if (e.key === ELECTION_KEY)
        refreshWithDelay('Detected new votes from another page...');
    });
  }

  document.addEventListener('DOMContentLoaded', onReady);
})();
