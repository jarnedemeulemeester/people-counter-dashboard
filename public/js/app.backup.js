const socket = io();

let chart;
socket.on('initial_data', (initial_data) => {
    console.log(initial_data);

    let labels = Array();
    let data = Array();
    initial_data.forEach(element => {
        labels.push(new Date(element.TimeStamp));
        data.push(element.People);
    });

    let ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bubble',
        data: {
            labels: labels,
            datasets: [{
                label: 'people inside',
                data: data
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    type: 'time',
                    distribution: 'linear'
                }]
            }
        }
    });
});

socket.on('updated_data', (updated_data) => {
    console.log(updated_data);
    let label = new Date(updated_data.TimeStamp);
    let data = updated_data.People;
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
});