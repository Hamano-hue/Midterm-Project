// voting.js - handles voting logic, validation, and persistence using localStorage

(function () {
  'use strict';

  const ELECTION_KEY = 'electionData_v1';
  const DEFAULT_CANDIDATES = {
    presidents: ['Alex Johnson', 'Taylor Rivera', 'Chris Lee'],
    vicePresidents: ['Jordan Park', 'Sam Patel'],
    treasurers: ['Casey Morgan', 'Riley Chen'],
    secretaries: ['Jamie Santos', 'Avery Cruz'],
    pios: ['Morgan Diaz', 'Skylar Reyes']
  };

  const positionLabels = {
    presidents: 'Presidents',
    vicePresidents: 'Vice Presidents',
    treasurers: 'Treasurers',
    secretaries: 'Secretaries',
    pios: 'PIOs'
  };

  // --- Shared helpers ---
  const setYear = () => {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  };

  const initializeElectionData = () => {
    const existing = localStorage.getItem(ELECTION_KEY);
    if (existing) return JSON.parse(existing);

    const votes = Object.fromEntries(
      Object.entries(DEFAULT_CANDIDATES).map(([pos, list]) => [
        pos,
        Object.fromEntries(list.map(name => [name, 0]))
      ])
    );

    const data = { votes, votedIds: [] };
    localStorage.setItem(ELECTION_KEY, JSON.stringify(data));
    return data;
  };

  const getElectionData = () =>
    JSON.parse(localStorage.getItem(ELECTION_KEY)) || initializeElectionData();

  const setElectionData = data =>
    localStorage.setItem(ELECTION_KEY, JSON.stringify(data));

  const createCandidateRow = (positionKey, candidateName) => {
    const row = document.createElement('div');
    row.className = 'candidate';

    const label = document.createElement('label');
    const input = Object.assign(document.createElement('input'), {
      type: 'radio',
      name: positionKey,
      value: candidateName,
      className: 'radio'
    });

    const span = document.createElement('span');
    span.textContent = candidateName;

    label.append(input, span);
    row.appendChild(label);
    return row;
  };

  const buildForm = () => {
    const form = document.getElementById('voteForm');
    form.innerHTML = '';
    const data = getElectionData();

    Object.keys(positionLabels).forEach(positionKey => {
      const section = document.createElement('section');
      section.className = 'section';
      section.innerHTML = `<h3>${positionLabels[positionKey]}</h3>`;

      const candidatesWrap = document.createElement('div');
      candidatesWrap.className = 'candidates';

      Object.keys(data.votes[positionKey]).forEach(candidateName =>
        candidatesWrap.appendChild(createCandidateRow(positionKey, candidateName))
      );

      section.appendChild(candidatesWrap);
      form.appendChild(section);
    });
  };

  const setMessage = (msg, type = '') => {
    const el = document.getElementById('message');
    el.textContent = msg || '';
    el.className = 'message' + (type ? ' ' + type : '');
  };

  const collectSelections = () =>
    Object.fromEntries(
      Object.keys(positionLabels).map(pos => [
        pos,
        document.querySelector(`input[name="${pos}"]:checked`)?.value || null
      ])
    );

  const isValidId = id => /^[0-9]{7}$/.test(id);

  const validate = (id, selections, data) => {
    const trimmedId = id.trim();

    if (!trimmedId) return { ok: false, reason: 'Please enter your ID number.' };
    if (!isValidId(trimmedId))
      return { ok: false, reason: 'ID number must be exactly 7 digits.' };
    if (data.votedIds.includes(trimmedId))
      return { ok: false, reason: 'This ID has already voted.' };

    for (const [pos, choice] of Object.entries(selections)) {
      if (!choice)
        return { ok: false, reason: `Please select a candidate for ${positionLabels[pos]}.` };
    }
    return { ok: true };
  };

  const submitVote = () => {
    const idInput = document.getElementById('voterId');
    const selections = collectSelections();
    const data = getElectionData();

    const check = validate(idInput.value, selections, data);
    if (!check.ok) return setMessage(check.reason, 'error');

    for (const [pos, candidate] of Object.entries(selections)) {
      data.votes[pos][candidate]++;
    }

    data.votedIds.push(idInput.value.trim());
    setElectionData(data);

    setMessage('Vote submitted successfully. Redirecting to dashboard...', 'success');

    // Disable form
    document.getElementById('submitVote').disabled = true;
    idInput.disabled = true;
    document.querySelectorAll('input[type="radio"]').forEach(r => (r.disabled = true));

    // Automatically redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500); // Show message for 1.5 seconds before redirect
  };

  const clearForm = () => {
    document.querySelectorAll('input[type="radio"]').forEach(r => (r.checked = false));
    setMessage('Selections cleared. You can vote now.');
  };

  const restrictIdInput = () => {
    const idInput = document.getElementById('voterId');
    idInput.addEventListener('input', () => {
      // Remove non-digits and cut to 7 characters max
      idInput.value = idInput.value.replace(/\D/g, '').slice(0, 7);
    });
  };

  const onReady = () => {
    setYear();
    initializeElectionData();
    buildForm();
    restrictIdInput();
    document.getElementById('submitVote').addEventListener('click', submitVote);
    document.getElementById('clearForm').addEventListener('click', clearForm);
  };

  document.addEventListener('DOMContentLoaded', onReady);
})();

