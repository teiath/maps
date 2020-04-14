showSpinner();
defaultValues = {
    baseMMUrl : 'https://mm.sch.gr/api/',
    baseHrefUrl : 'https://maps.sch.gr/main.html',
    baseNewUrl : 'main.html',
    latGR : '38.1',
    lngGR : '24.2',
    zoomGR : '7'
};
var map;
var urlParams = getUrlParams();

$(document).ready(function() {
    $('#edu_admin').select2({
        placeholder: '',
        sorter: data => data.sort(
            (a, b) => a.text.localeCompare(b.text)
        )
    });
    $('#region_edu_admin').select2({
        placeholder: '',
        sorter: data => data.sort(
            (a, b) => a.text.localeCompare(b.text)
        )
    });
    $('#municipality').select2({
        placeholder: '',
        sorter: data => data.sort(
            (a, b) => a.text.localeCompare(b.text)
        )
    });
    $('#unit_type').select2({
        placeholder: '',
        sorter: data => data.sort(
            (a, b) => a.text.localeCompare(b.text)
        )
    });
    if (!_.isEmpty(urlParams.searchValues.eduAdmins))
    {
        $('#edu_admin').val(urlParams.searchValues.eduAdmins).trigger('change');
    }
    if (!_.isEmpty(urlParams.searchValues.regionEduAdmins))
    {
        $('#region_edu_admin').val(urlParams.searchValues.regionEduAdmins).trigger('change');
    }
    if (!_.isEmpty(urlParams.searchValues.municipalities))
    {
        $('#municipality').val(urlParams.searchValues.municipalities).trigger('change');
    }
    if (!_.isEmpty(urlParams.searchValues.unitTypes))
    {
        $('#unit_type').val(urlParams.searchValues.unitTypes).trigger('change');
    }
});

//Run when user click on unit name at left row
$(document).on("click", ".feature-row", function () {
    var urlCustom = defaultValues.baseMMUrl + 'units?mm_id=' + $(this).attr("mm_id");
    $(document).off("mouseout", ".feature-row", clearHighlight);
    onUnitClick(urlCustom)
});

//show red circle when mouse is over unit name at left row
if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
      highlight.clearLayers().addLayer(
          L.circleMarker(
              [$(this).attr("lat"), $(this).attr("lng")],
              highlightStyle
          )
      );
  });
}

//remove red circle when mouse is leave from unit name at left row
$(document).on("mouseout", ".feature-row", clearHighlight);


//left column-----------------------------------------------------
//reset button
$("#reset").click(function() {
    $('#edu_admin').val('').trigger('change');
    $('#region_edu_admin').val('').trigger('change');
    $('#municipality').val('').trigger('change');
    $('#unit_type').val('').trigger('change');
    $(':input').val('');
});

//navbar menu-----------------------------------------------------
//search
$("#list-btn").click(function() {
    animateSidebar();
    return false;
});
//informations
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
//contact
$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
//only at response
$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});
//only at response
$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

//----------------------Initial variables for map--------------------------------------------------------
/* Basemap Layers */
var baseMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=el", {
    maxZoom: 19,
    lang: 'el',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#800000",
  fillOpacity: 0.7,
  radius: 15
};
/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});
/* Empty layer placeholder to add to layer control for listening when to add/remove units to markerClusters layer */
var units = L.geoJson(null, {
  pointToLayer: pointToLayer,
  onEachFeature: onEachFeature
});

map = L.map("map", {
    zoom: urlParams.zoom,
    center: [urlParams.lat, urlParams.lng],
    layers: [baseMap, markerClusters, highlight],
    zoomControl: false,
    attributionControl: false
});
//added atributor control
var attributionControl = L.control({
    position: "bottomright"
});
attributionControl.onAdd = function () {
    var div = L.DomUtil.create("div", "leaflet-control-attribution");
    div.innerHTML = baseMap.getAttribution();
    return div;
};
map.addControl(attributionControl);
//added zoom control
var zoomControl = L.control.zoom({
    position: "bottomright"
}).addTo(map);

//-----------------------------Show markers to map-------------------------------------------------
var unit_info = $('#units_info');
unit_info.empty();
if (Array.isArray(urlParams.urlValues) && urlParams.urlValues.length === 0) {
    var urlCustom = defaultValues.baseMMUrl + 'units.geojson?state=1';
    $.getJSON(urlCustom, function (results) {
        if (!_.isNil(results.data)) {
            //unit_info.append('Βρέθηκαν '+ results.count +' Μονάδες');
            units.addData(results.data);
            markerClusters.addLayer(units);
        } else {
            console.log('MM api connection error - Init all');
        }
        hideSpinner();
    });
}
else
{
    var res = $('#feature-list tbody');
    res.empty();
    markerClusters.removeLayer(units);
    map.setView(
        [urlParams.lat, urlParams.lng],
        urlParams.zoom
    );
    //empty points from map
    units = L.geoJson(null, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    var urlCustom = defaultValues.baseMMUrl + 'units.geojson?state=1&'+ urlParams.urlValues.join('&');
    $.getJSON(urlCustom, function (results) {
        if (!_.isNil(results.data)) {
            var filteredData = results.data;
            var searchResult = filteredData.features;
            if (results.count === 0) {
                res.append('<h4 class="rip">Κανένα Αποτέλεσμα</h4>');
            } else {
                //unit_info.append('Βρέθηκαν '+ results.count +' Ενεργές Μονάδες');
                for (var key in searchResult) {
                    res.append(
                        '<tr class="feature-row" ' +
                        ' mm_id="' + searchResult[key].properties.mmId  + '"' +
                        ' name_sch="' + sanitization(searchResult[key].properties.name) + '"' +
                        ' lat="' + searchResult[key].geometry.coordinates[1] + '"' +
                        ' lng="' + searchResult[key].geometry.coordinates[0] + '">' +
                        '<td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/unit.png"></td>' +
                        '<td class="feature-name">' + searchResult[key].properties.name + '</td>' +
                        '<td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td>' +
                        '</tr>'
                    );
                }
            }
            // Adjust sidebar height to extend to the bottom
            $('.sidebar-table').height(function(index, height) {
                return window.innerHeight - $(this).offset().top;
            });
            units.addData(filteredData);
            markerClusters.addLayer(units);
        } else {
            console.log('MM api connection error - Custom url');
        }
        hideSpinner();
    });
}


//Clear feature highlight when map is clicked
map.on("click", function() {
    highlight.clearLayers();
});
//create href with right click
map.on('contextmenu', function (e) {
    var searchParams = [];
    var name = $('.form-control.search_name').val();
    var mmId = $('.form-control.search_mm_id').val();
    var registryNo = $('.form-control.search_registry_no').val();
    var eduAdmins = $('#edu_admin').val();
    var regionEduAdmins = $('#region_edu_admin').val();
    var municipalities = $('#municipality').val();
    var unitTypes = $('#unit_type').val();
    var searchParamsFormat = '';
    if (name) {
        searchParams.push('name=' + name);
    }
    if (mmId) {
        searchParams.push('mm_id=' + mmId);
    }
    if (registryNo) {
        searchParams.push('registry_no=' + registryNo);
    }
    if (eduAdmins) {
        searchParams.push('edu_admin=' + eduAdmins);
    }
    if (regionEduAdmins) {
        searchParams.push('region_edu_admin=' + regionEduAdmins);
    }
    if (municipalities) {
        searchParams.push('municipality=' + municipalities);
    }
    if (unitTypes) {
        searchParams.push('unit_type=' + unitTypes);
    }
    if (Array.isArray(searchParams) && searchParams.length > 0) {
        searchParamsFormat = '&amp'.concat(searchParams.join('&amp'));
    }

    var urlCustom = defaultValues.baseHrefUrl +
        '?zoom=' + e.target.getZoom() +
        '&lat=' + e.latlng.lat.toFixed(6) +
        '&lng=' + e.latlng.lng.toFixed(6) +
        searchParamsFormat;
    L.popup({maxWidth: 800})
        .setLatLng(e.latlng)
        .setContent('<pre>'+urlCustom+'</pre>')
        .addTo(map)
        .openOn(map);
});

/* Highlight search box text on click TODO remove?*/
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page TODO check*/
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

//TODO remove?
$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

//run when user click at search
$('#apply-filters').click(function() {
    clearHighlight();
    window.history.pushState({}, document.title, "/" + defaultValues.baseNewUrl );
	showSpinner();
    var res = $('#feature-list tbody');
    res.empty();
    var unit_info = $('#units_info');
    unit_info.empty();
    markerClusters.removeLayer(units);
    map.setView(
        [defaultValues.latGR, defaultValues.lngGR],
        defaultValues.zoomGR
    );
    //empty points from map
    units = L.geoJson(null, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    var searchParams = [];
    var searchParamsFormat = '';
    var name =  $('.form-control.search_name').val();
    var mmId =  $('.form-control.search_mm_id').val();
    var registryNo =  $('.form-control.search_registry_no').val();
    var eduAdmins = $('#edu_admin').val();
    var regionEduAdmins = $('#region_edu_admin').val();
    var municipalities = $('#municipality').val();
    var unitTypes =  $('#unit_type').val();
    if (name) {
        searchParams.push('name='+name);
    }
    if (mmId) {
        searchParams.push('mm_id='+mmId);
    }
    if (registryNo) {
        searchParams.push('registry_no='+registryNo);
    }
    if (eduAdmins) {
        searchParams.push('edu_admin='+eduAdmins);
    }
    if (regionEduAdmins) {
        searchParams.push('region_edu_admin='+regionEduAdmins);
    }
    if (municipalities) {
        searchParams.push('municipality='+municipalities);
    }
    if (unitTypes) {
        searchParams.push('unit_type='+unitTypes);
    }
    if (Array.isArray(searchParams) && searchParams.length > 0) {
        searchParamsFormat = '&'.concat(searchParams.join('&'));
    }
    //TODO combine with custom url and create function
    var urlCustom = defaultValues.baseMMUrl + 'units.geojson?state=1'+ searchParamsFormat;
    $.getJSON(urlCustom, function (results) {
        if (!_.isNil(results.data)) {
            var filteredData = results.data;
            var searchResult = filteredData.features;
            if (results.count === 0) {
                res.append('<h4 class="rip">Κανένα Αποτέλεσμα</h4>');
            } else {
                //unit_info.append('Βρέθηκαν '+ results.count +' Μονάδες');
                for (var key in searchResult) {
                    res.append(
                        '<tr class="feature-row" ' +
                        ' mm_id="' + searchResult[key].properties.mmId  + '"' +
                        ' name_sch="' + sanitization(searchResult[key].properties.name) + '"' +
                        ' lat="' + searchResult[key].geometry.coordinates[1] + '"' +
                        ' lng="' + searchResult[key].geometry.coordinates[0] + '">' +
                        '<td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/unit.png"></td>' +
                        '<td class="feature-name">' + searchResult[key].properties.name + '</td>' +
                        '<td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td>' +
                        '</tr>'
                    );
                }
            }
        // Adjust sidebar height to extend to the bottom
        $('.sidebar-table').height(function(index, height) {
            return window.innerHeight - $(this).offset().top;
        });
        units.addData(filteredData);
        markerClusters.addLayer(units);

        } else {
            console.log('MM api connection error - Search Click');
        }
		hideSpinner();
    });
});
