var searchForm = document.getElementById("searchForm");
var userInput = document.getElementById("formInput");
var buttonList = document.getElementById("searchHistory");
var infoText = document.getElementById("infoText");
var todayWeather = document.getElementById("todayWeather");
var fiveDayForecast = document.getElementById("fiveDayForecast");
var APIKEY = "0a8e2d57f6fc34feb5b49f3db918daa8";

function createElement(element, attributes = {}, text = null) {
  var elem = document.createElement(element);
  for (var key in attributes) {
    elem.setAttribute(key, attributes[key]);
  }
  if (text !== null) {
    elem.textContent = text;
  }
  return elem;
}

function displayTodaysWeather(cityWeather) {
  infoText.remove();

  if (document.getElementById("todaysInfo")) {
    document.getElementById("todaysInfo").remove();
  }

  var todayInformation = createElement("section", { id: "todaysInfo" });
  var today = dayjs();
  var weekDay = dayjs(today, "M-D-YYYY").format("dddd");
  var cityNamePlusDate = createElement("h2", {}, `${cityWeather.name} (${weekDay} ${today.format("MMMM DD, YYYY")})`);
  cityNamePlusDate.style.display = "inline";

  todayInformation.append(cityNamePlusDate);

  var iconNum = cityWeather.weather[0].icon;
  var iconUrl = `https://openweathermap.org/img/wn/${iconNum}@2x.png`;
  var iconImg = createElement("img", { src: iconUrl });
  todayInformation.append(iconImg);

  todayInformation.append(createElement("h3", {}, `Temp: ${cityWeather.main.temp} \u00B0F`));
  todayInformation.append(createElement("h3", {}, `Wind: ${cityWeather.wind.speed} MPH`));
  todayInformation.append(createElement("h3", {}, `Humidity: ${cityWeather.main.humidity} %`));

  todayWeather.append(todayInformation);
}

function displayFiveDayForecast(cityWeatherFiveDay) {
  if (document.getElementById("fiveDayInfo")) {
    document.getElementById("fiveDayInfo").remove();
  }

  var fiveDayInfo = createElement("section", { id: "fiveDayInfo" });
  fiveDayInfo.classList.add("row");

  for (var i = 0; i < cityWeatherFiveDay.list.length; i += 8) {
    var dayColumnCard = createElement("section", {
      class: "col border border-dark border-2 addSpacing rounded",
      style: "margin: 5px; text-align: center;",
    });

    var fullDate = cityWeatherFiveDay.list[i].dt_txt;
    var month = fullDate.slice(5, 7);
    var day = fullDate.slice(8, 10);
    var year = fullDate.slice(0, 4);
    var dateDisplay = createElement("h4", {}, `${month}/${day}/${year}`);
    dayColumnCard.append(dateDisplay);

    var iconNum = cityWeatherFiveDay.list[i].weather[0].icon;
    var iconUrl = `https://openweathermap.org/img/wn/${iconNum}@2x.png`;
    dayColumnCard.append(createElement("img", { src: iconUrl }));
    dayColumnCard.append(createElement("p", {}, `Temp: ${cityWeatherFiveDay.list[i].main.temp} \u00B0F`));
    dayColumnCard.append(createElement("p", {}, `Wind: ${cityWeatherFiveDay.list[i].wind.speed} MPH`));
    dayColumnCard.append(createElement("p", {}, `Humidity: ${cityWeatherFiveDay.list[i].main.humidity} %`));

    fiveDayInfo.append(dayColumnCard);
  }

  fiveDayForecast.append(fiveDayInfo);
}

function getWeather(lat, lon) {
  var weatherUrlToday = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=imperial`;

  fetch(weatherUrlToday)
    .then((response) => response.json())
    .then((data) => displayTodaysWeather(data));

  var weatherUrlFiveDay = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=imperial`;

  fetch(weatherUrlFiveDay)
    .then((response) => response.json())
    .then((data) => displayFiveDayForecast(data));
}

function findCity(city) {
  var geoCodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKEY}`;

  fetch(geoCodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data == "") {
        if (!document.getElementById("warningCheck")) {
            var warning = createElement("p", {
                id: "warningCheck",
                textContent: "City not found. Please try again.",
                class: "alert alert-danger",
                style: "margin-top: 10px;",
              });
              searchForm.appendChild(warning);
            }
          } else {
            if (document.getElementById("warningCheck")) {
              var warning = document.getElementById("warningCheck");
              warning.remove();
            }
            addSearchHistory(city);
            getWeather(data[0].lat, data[0].lon);
          }
        });
    }
    
    function handleForm(event) {
      event.preventDefault();
      if (userInput.value != "") {
        findCity(userInput.value);
        userInput.value = "";
      }
    }
    
    function addSearchHistory(city) {
      var cities = [];
      var storedCities = JSON.parse(localStorage.getItem("cities"));
    
      if (storedCities !== null) {
        cities = storedCities;
      }
    
      if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));
        var button = createElement("button", {
          textContent: city,
          class: "btn btn-info",
          id: "historyButton",
        });
        buttonList.appendChild(button);
        button.addEventListener("click", handleButton);
      }
    }
    
    function showSearchHistory() {
      var storedCities = JSON.parse(localStorage.getItem("cities"));
    
      if (storedCities !== null) {
        for (var i = 0; i < storedCities.length; i++) {
          var button = createElement("button", {
            textContent: storedCities[i],
            class: "btn btn-info",
            id: "historyButton" + i,
          });
          buttonList.appendChild(button);
          button.addEventListener("click", handleButton);
        }
      }
    }
    
    function handleButton() {
      findCity(this.textContent);
    }
    
    searchForm.addEventListener("submit", handleForm);
    showSearchHistory();
    



