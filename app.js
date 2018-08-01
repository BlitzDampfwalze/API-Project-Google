$(() => {
  let map, geocoderService, placesService;
  let searchTerm = null;

  const init = () => {
    map = new google.maps.Map(document.createElement('div'));
    geocoderService = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService(map);
  };

  const fetchGeolocation = (address, callback) => {
    geocoderService.geocode({ address }, callback);
    //converts address input to geocoordinates, passes fetchNearby in the callback
  };

  const fetchDetails = dataFromCallback => {
    const shortList = dataFromCallback.slice(0, 6);

    shortList.map(elemnet => {
      const placeId = elemnet.place_id;
      placesService.getDetails({ placeId }, renderDetails);

    });
  };

  const processPlacesData = (placesData, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {

      displayPlaceData(placesData);
    }
  };

  const fetchNearby = geoData => {
    const location = geoData[0].geometry.location;
    const request = { location, radius: 15000, keyword: searchTerm };
    const { lat, lng } = location;

    placesService.nearbySearch(request, processPlacesData);
    //submit request and process status callback per Google documentation, which will then execute our function to display results.

    fetchWeather(lat, lng, renderWeather);
  };

  const fetchWeather = (lat, lng, callback) => {
    const settings = {
      url: 'https://api.openweathermap.org/data/2.5/weather',
      data: {
        lat: lat,
        lon: lng,
        APPID: 'ed12ceff91d358d8ff4b5f06c54d2ef4',
      },
      dataType: 'json',
      type: 'GET',
      success: callback,
    };
    $.ajax(settings);
  };

  const handleSubmit = () => {
    $('.js-search-form').submit(event => {
      event.preventDefault();

      const queryLocationTarget = $(event.currentTarget).find('.location-search');
      const location = queryLocationTarget.val();

      const querySearchTerm = $(event.currentTarget).find('.search-term');
      searchTerm = querySearchTerm.val();

      queryLocationTarget.val('');
      querySearchTerm.val('');

      fetchGeolocation(location, fetchNearby); 
      // Makes an API call with locations input and passes a fetchNearby in the callback to retrieve geo-coordinates
    });
  };

  const generatePlaceHTML = place => {
    let id = place.place_id;
    return `<div class="results" id="${id}">
            <h3 class="result-name">${place.name}</h3>
          </div>`;
  };

  const displayPlaceData = placeData => {
    const shortList = placeData.slice(0, 6);
    const placeHTML = shortList.map((item, index) => generatePlaceHTML(item));
    
    $('.js-search-results')
      .prop('hidden', false)
      .html(placeHTML);

    fetchDetails(placeData);
  };

  const renderDetails = item => {
    if (!item) return;

  
    let rating = item.rating;    
    let address = item.formatted_address;
    let phone = item.formatted_phone_number;
    let website = item.website;
    if(rating===undefined) rating = 'not available';
    if(address===undefined) address = 'Address not available';
    if(phone===undefined) phone = 'Phone number not available';
    if(website===undefined) website = 'Website not available';

    let detailsHTML = `<p>Rating: ${rating}</p>
    <address>${address}</address>
    <a href=tel:${phone}>${phone}</a>
    <a href="${website}">Website</a>`;

    $(`#${item.place_id}`).append(`${detailsHTML}`);
  };

  const renderWeather = result => {
    let tempF = Math.round(1.8 * (result.main.temp - 273) + 32);
    $('.weather-wrapper').html(`
        <div class="weather">
          <h2>${result.name} welcomes you!</h2>
          <p>The current weather conditions are ${tempF}&deg;F with humidity at ${
      result.main.humidity
    }% &amp; ${result.weather[0].description}.</p>
        </div>`);
  };

  $('#btn').click(() => {
    $('html, body').animate(
      {
        scrollTop: $('#results').offset().top,
      },
      3000,
    );
  });

  init();
  handleSubmit();
});
