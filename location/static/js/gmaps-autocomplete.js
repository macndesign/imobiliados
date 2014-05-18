function initialize() {
    var input = document.getElementById('id_search');
    var autocomplete = new google.maps.places.Autocomplete(input);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        console.log(place.address_components);
        if (place) {
            var objects = place.address_components;
            for (var i = 0; i < objects.length; i ++) {
                try {
                    var type_local = objects[i]['types'][0];
                    var desc_local = objects[i]['short_name'];
                    var field_local = document.getElementById('id_' + type_local);
                    field_local.value = desc_local;
                } catch (e) {
                    console.log(type_local + ' ' + desc_local);
                }

                // UF Long Name
                if (objects[i]['types'][0] === 'administrative_area_level_1') {
                    var long_name = objects[i].long_name;
                    var uf_long_name = document.getElementById("id_administrative_area_level_1_long_name");
                    uf_long_name.value = long_name;
                }
            }
        }
    });
}
google.maps.event.addDomListener(window, 'load', initialize);