'use strict'

const socket = io();

let location_data;

function createSelect(device_id, selected_value) {
    let select = document.createElement('select');
    location_data.forEach(element => {
        let option = document.createElement('option');
        option.setAttribute('value', element.id);
        option.innerText = element.fullname;
        select.append(option);
    });
    select.value = selected_value;
    select.addEventListener('change', e => {
        socket.emit('device_location_changed', {deviceId: device_id, locationId: e.target.value});
    });
    return select;
}

socket.on('initial_location_data', data => {
    location_data = data;
    socket.emit('get-location-settings');
  })

socket.on('location-settings', data => {
    data.forEach(element => {
        let name = document.createElement('p');
        name.innerText = element.left.name;
        let select = createSelect(element.left.id, element.right.id);
        document.querySelector('.js-location-settings').append(name, select);
    });
})

