//---------------------Spinner functions---------------------
// Function to display the spinner
function showSpinner() {
    // Initialize
    if ($('.kintone-spinner').length == 0) {
        // Create elements for the spinner and the background of the spinner
        var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
        var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

        // Append spinner to the body
        $(document.body).append(spin_div, spin_bg_div);

        // Set a style for the spinner
        $(spin_div).css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'z-index': '510',
            'background-color': '#fff',
            'padding': '26px',
            '-moz-border-radius': '4px',
            '-webkit-border-radius': '4px',
            'border-radius': '4px'
        });
        $(spin_bg_div).css({
            'position': 'absolute',
            'top': '0px',
            'left': '0px',
            'z-index': '500',
            'width': '100%',
            'height': '200%',
            'background-color': '#000',
            'opacity': '0.5',
            'filter': 'alpha(opacity=50)',
            '-ms-filter': "alpha(opacity=50)"
        });

        // Set options for the spinner
        var opts = {
            'color': '#000'
        };

        // Create the spinner
        new Spinner(opts).spin(document.getElementById('kintone-spin'));
    }

    // Display the spinner
    $('.kintone-spinner').show();
}

// Function to hide the spinner
function hideSpinner() {
    // Hide the spinner
    $('.kintone-spinner').hide();
}

//---------------------Get utr functions---------------------
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

function getUrlParams()
{
    var arrValues = [];
    var urlEduAdmin = getUrlParam('edu_admin', '');
    var urlRegionEduAdmin = getUrlParam('region_edu_admin', '');
    var urlMunicipality = getUrlParam('municipality', '');
    var urlUnitType = getUrlParam('unit_type', '');
    var zoom = getUrlParam('zoom', defaultValues.zoomGR);
    var lat = getUrlParam('lat', defaultValues.latGR);
    var lng = getUrlParam('lng', defaultValues.lngGR);

    if (urlEduAdmin != '' && urlEduAdmin !== undefined)
    {
        var searchEduAdmins = urlEduAdmin.split(',').map(function (item)
        {
            return parseInt(item, 10);
        });
        arrValues.push('edu_admin=' + urlEduAdmin);
    }
    if (urlRegionEduAdmin != '' && urlRegionEduAdmin !== undefined)
    {
        var searchRegionEduAdmins = urlRegionEduAdmin.split(',').map(function (item)
        {
            return parseInt(item, 10);
        });
        arrValues.push('region_edu_admin=' + urlRegionEduAdmin);
    }
    if (urlMunicipality != '' && urlMunicipality !== undefined)
    {
        var searchMunicipalities = urlMunicipality.split(',').map(function (item)
        {
            return parseInt(item, 10);
        });
        arrValues.push('municipality=' + urlMunicipality);
    }
    if (urlUnitType != '' && urlUnitType !== undefined)
    {
        var searchUnitTypes = urlUnitType.split(',').map(function (item)
        {
            return parseInt(item, 10);
        });
        arrValues.push('unit_type=' + urlUnitType);
    }

    return {
        urlValues: arrValues,
        searchValues: {
            eduAdmins: _.isNil(searchEduAdmins) ? '' : searchEduAdmins,
            regionEduAdmins: _.isNil(searchRegionEduAdmins) ? '' : searchRegionEduAdmins,
            municipalities: _.isNil(searchMunicipalities) ? '' : searchMunicipalities,
            unitTypes: _.isNil(searchUnitTypes) ? '' : searchUnitTypes
        },
        zoom: zoom,
        lat: lat,
        lng: lng
    }
}

//---------------------General functions---------------------
function animateSidebar()
{
    $("#sidebar").animate({
        width: "toggle"
    }, 350, function () {
        map.invalidateSize();
    });
}

function clearHighlight() {
    highlight.clearLayers();
}

function pointToLayer (feature, latlng) {
    return L.marker(latlng, {
        icon: L.icon({
            iconUrl: "assets/img/unit.png",
            iconSize: [24, 28],
            iconAnchor: [12, 28],
            popupAnchor: [0, -25]
        }),
        title: feature.properties.name,
        riseOnHover: true
    });
}

function onEachFeature(feature,layer) {
    if (feature.properties) {
        layer.on({
            click: function() {
                var APIEndpoint = defaultValues.baseMMUrl + 'units?mm_id=' + feature.properties.mmId;
                return onUnitClick(APIEndpoint);
            }
        });
    }
}

function sanitization(string) {
    var sanitize_string='';
    if (string) {
        sanitize_string = string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    }
    return sanitize_string;
}

function onUnitClick(APIEndpoint) {
    $.getJSON(APIEndpoint, function (results) {
        if (!_.isNil(results.data[0])) {
            var unitData = results.data[0];
            var registryNo = !_.isNil(unitData.registry_no) ? unitData.registry_no : '';
            var eduAdmin = !_.isNil(unitData.edu_admin) ? unitData.edu_admin : '';
            var regionEduAdmin = !_.isNil(unitData.region_edu_admin) ? unitData.region_edu_admin : '';
            var municipality = !_.isNil(unitData.municipality) ? unitData.municipality : '';
            var unitType = !_.isNil(unitData.unit_type) ? unitData.unit_type : '';
            var streetAddress = !_.isNil(unitData.street_address) ? unitData.street_address : '';
            var postalCode = !_.isNil(unitData.postal_code) ? unitData.postal_code : '';
            var phoneNumber = !_.isNil(unitData.phone_number) ? unitData.phone_number : '';
            var faxNumber = !_.isNil(unitData.fax_number) ? unitData.fax_number : '';
            var email = !_.isNil(unitData.email) ? unitData.email : '';
            var latitude = !_.isNil(unitData.latitude) ? unitData.latitude : 0;
            var longitude = !_.isNil(unitData.longitude) ? unitData.longitude : 0;
            var content = "<table class='table table-striped table-bordered table-condensed'>" +
                "<tr><th>Όνομα</th><td>" + unitData.name +
                "<tr><th>Κωδικός ΜΜ</th><td><a class='url-break' href=https://mm.sch.gr/main.php?auth=0&mm_id=" + unitData.mm_id + " target='_blank'>" + unitData.mm_id + "</a></td></tr>" +
                "<tr><th>Κωδικός Υπουργείου</th><td>" + registryNo + "</td></tr>" +
                "<tr><th>Διεύθυνση Εκπαίδευσης</th><td>" + eduAdmin + "</td></tr>" +
                "<tr><th>Περιφέρεια Εκπαίδευσης</th><td>" + regionEduAdmin + "</td></tr>" +
                "<tr><th>Δήμος</th><td>" + municipality + "</td></tr>" +
                "<tr><th>Τύπος Μονάδας</th><td>" + unitType + "</td></tr>" +
                "<tr><th>Διεύθυνση</th><td>" + streetAddress + "</td></tr>" +
                "<tr><th>Τ.Κ.</th><td>" + postalCode + "</td></tr>" +
                "<tr><th>Τηλέφωνο</th><td>" + phoneNumber + "</td></tr>" +
                "<tr><th>Fax</th><td>" + faxNumber + "</td></tr>" +
                "<tr><th>Email</th><td>" + email + "</td></tr>" +
                "<table>";

            $("#feature-title").html(unitData.name);
            $("#feature-info").html(content);
            $("#featureModal").modal('show');
            map.setView([latitude, longitude], 18);
            highlight.clearLayers().addLayer(
                L.circleMarker(
                    [latitude, longitude],
                    highlightStyle
                )
            );

            /* Hide sidebar and go to the map on small screens */
            if (document.body.clientWidth <= 767) {
                $("#sidebar").hide();
                map.invalidateSize();
            }
        }
        else {
            console.log('MM api connection error - Unit');
        }
    });
}