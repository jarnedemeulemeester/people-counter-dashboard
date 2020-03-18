'strict'
const socket = io();

let plot = document.getElementById('tester');

socket.on('initial_data', (initial_data) => {
  console.log(initial_data);

  let labels = Array();
  let people_inside = Array();
  initial_data.forEach(element => {
    labels.push(new Date(element.TimeStamp));
    people_inside.push(element.People);
  });
  
  

  let data = [
    {
      name: 'People inside',
      type: 'scatter',
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

});

socket.on('updated_data', (updated_data) => {
  console.log(updated_data);
  let label = new Date(updated_data.TimeStamp);
  let data = updated_data.People;
  Plotly.extendTraces(plot, {x: [[label]], y: [[data]]}, [0])
});