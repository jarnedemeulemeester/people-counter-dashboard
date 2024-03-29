'use strict'
const socket = io();

let plot = document.getElementById('plot');
let location_data;
let raw_data;

function createCard(location_data_item, is_selected) {
  let card = document.createElement('div');
  card.classList.add('card');
  card.classList.add('js-card');
  (is_selected) ? card.classList.add('card-selected') : null;
  let card_location = document.createElement('h3');
  card_location.classList.add('card-location');
  card_location.innerText = location_data_item.fullname;
  let card_number = document.createElement('p');
  card_number.classList.add('card-number');
  card_number.innerText = location_data_item.people;
  let card_unit = document.createElement('p');
  card_unit.classList.add('card-unit');
  card_unit.innerText = 'People inside';
  card.append(card_location);
  card.append(card_number);
  card.append(card_unit);
  card.setAttribute('name', location_data_item.name);
  card.addEventListener('click', () => {
    document.querySelector('.card-selected').classList.remove('card-selected');
    document.querySelector('.js-chart-title').innerText = location_data_item.fullname;
    card.classList.add('card-selected');
    socket.emit('get_new_chart_data', {location: location_data_item.name});
  });
  return card;
}

function groupData(data, group_by) {
  let labels = Array();
  let people_inside = Array();

  let groupedResults = _.groupBy(data, result => {
    return moment.unix(new Date(result.timestamp).getTime() / 1000).startOf(group_by);
  });

  _.forEach(groupedResults, (n, key) => {
    labels.push(new Date(key));
    people_inside.push(Math.round(_.meanBy(n, k => k.people)));
  });
  
  return [labels, people_inside];
}

function createChart(labels, people_inside) {
  let data = [
    {
      name: 'People inside',
      type: 'bar',
      marker: {
        color: '#7D7AFA'
      },
      x: labels,
      y: people_inside
    }
  ];

  Plotly.newPlot(plot, data, {
    margin: {
      t: 0
    },
    yaxis: {
      fixedrange: true
    },
    xaxis: {
      fixedrange: true
    }
  }, {
    staticPlot: false,
    displayModeBar: false
  });
}

socket.on('initial_data', (initial_data) => {
  raw_data = initial_data;
  let [labels, people_inside] = groupData(initial_data, 'hour');
  createChart(labels, people_inside);
});

socket.on('initial_location_data', (initial_data) => {
  location_data = initial_data;
  document.querySelector('.js-cards').innerHTML = null;
  let card;
  for (let i = 0; i < location_data.length; i++) {
    if (i !== 0) {
      card = createCard(location_data[i], false);
    } else {
      card = createCard(location_data[i], true);
      document.querySelector('.js-chart-title').innerText = location_data[i].fullname;
      // createChart(location_data[i]);
    }
    document.querySelector('.js-cards').append(card);
  }
})

socket.on('updated_location_data', (updated_data) => {
  let cards = document.querySelectorAll('.js-card');
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].getAttribute('name') === updated_data.name){
      cards[i].querySelector('.card-number').innerText = updated_data.people;
    }
  }
});

socket.on('updated_data', (updated_data) => {
  let label = new Date(updated_data.timestamp);
  let data = updated_data.people;
  Plotly.extendTraces(plot, { x: [[label]], y: [[data]] }, [0])
});

document.querySelector('.js-filter-group-by').addEventListener('change', e => {
  let [labels, people_inside] = groupData(raw_data, e.target.value);
  createChart(labels, people_inside);
});