const img_url = "https://picsum.photos/1280/720";

function setRenderBackground()
{
  // img, sound, video 송신 경우에 blob 속성 사용 (아니면 깨짐)
  const result = axios.get(img_url, {
    responseType: 'blob'
  });

  result.then(data=>{
    //console.log(data);
    //console.log(data.data);

    // 이미지 덩어리 임시 url 만들어서 접근 가능케 함
    const image = URL.createObjectURL(data.data);
    //console.log(image);
    document.querySelector("body").style.backgroundImage = `url(${image})`;

  })
}

// 시계
function setTime(){

  const timer = document.querySelector(".timer");

  setInterval(() => {
    const date = new Date();
    //console.log(date);

    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();

    const timeFormat = `${hour}:${min}:${sec}`;
    //console.log(timeFormat);
    timer.textContent = timeFormat;
  }, 1000)
  
}

// 메모
function setMemo(){
  const memoInput = document.querySelector(".memo-input");
  memoInput.addEventListener("keyup", function(e){
    //console.log(e.code);
    //console.log(e.target.value);
    if(e.code === "Enter" && e.target.value) // 메모 내용 있을 때만
    {
      // memo.textContent = e.target.value;

      localStorage.setItem("todo", e.target.value);
      getMemo();
    }
  })

}

function getMemo(){
  const memo = document.querySelector(".memo");
  const memoValue = localStorage.getItem("todo");
  memo.textContent = memoValue;
}

function deleteMemo(){
  // 이벤트 위임 : 최상단에 이벤트 부여해서 조건에 따라 설정
  document.addEventListener("click", (e) => {
    //console.log(e.target);
    if(e.target.classList.contains('memo'))
    {
      e.target.textContent = "";
      localStorage.removeItem("todo");
    }
  })
}

const api_key = "8caf2515085d76a850b23ab9bd2d1521";

// 도시명으로 API 호출
// api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}

// 위경도로 API 호출
// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}


// 위경도 받아오기
function getPosition(options)
{
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  })
}

function matchIcon(weatherData){
  // Clear일 때 clear icon
  if (weatherData === "Clear") return "./images/039-sun.png";
  if (weatherData === "Clouds") return "./images/001-cloud.png";
  if (weatherData === "Rain") return "./images/003-rainy.png";
  if (weatherData === "Snow") return "./images/006-snowy.png";
  if (weatherData === "Thunderstorm") return "./images/008-storm.png";
  if (weatherData === "Drizzle") return "./images/031-snowflake.png";
  if (weatherData === "Atmosphere") return "./images/033-hurricane.png";
}

// 273.15 빼고 소수점 한자리까지 보이게
const changeToCellsius = temp => (temp - 273.15).toFixed(1);


function weatherWrapperComponent(cur){
  console.log(cur);

  return `
  <div class="card bg-transparent flex-grow-1 m-2">
    <div class="card-header text-center">
      ${cur.dt_txt.split(" ")[0]}
    </div>
    <div class="card-body text-center">
      <h5 class="card-title">${cur.weather[0].main}</h5>
      <img width="60px" height="60px" src="${matchIcon(cur.weather[0].main)}">
      <p class="card-text">${changeToCellsius(cur.main.temp)}º</p>
      </div>
  </div>
  `;
}

async function renderWeather()
{
  let latitude = "";
  let longitude = "";
  let weatherData = null;


  // 위치 정보 승인 O
  try{
    const pos = await getPosition();
    console.log(pos.coords); // promise 비동기 처리 안 하면 undefined 됨
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;
    if(latitude && longitude) // 값 있을 때
    {
      const result = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${api_key}`);
      console.log(result);
      weatherData = result.data;
    }


  
  }
  // 위치 정보 승인 X
  catch (err)
  {
    console.log(err); 
    if(!latitude || !longitude) // 값 없을 때
    {
      const result = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${api_key}`);
      console.log(result);
      weatherData = result.data;
    }

  }

  console.log(weatherData);

  // 시간대에 따라 변경

  const date = new Date();
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  if(month < 10) month = "0" + month;
  const day = date.getDate();
  let hour = date.getHours();

  console.log(hour);

  // 시간 오전이면 (hour) => good morning
  const timer_cont = document.querySelector(".timer-content");
  if(hour < 12){
    timer_cont.textContent = "Good morning, doyun";
  }
  else timer_cont.textContent = "Good evening, doyun";

  // 지금 날씨 가져오기
  // 0, 3, 6, 9 이렇게 변형시키기
  
  hour = hour - (hour % 3);
  if(hour < 10) hour = "0" + hour;
  const nowTime = `${year}-${month}-${day} ${hour}`;
  console.log(nowTime);

  // 현재 날씨 찾기
  const nowWeather = weatherData.list.filter(data => data.dt_txt.indexOf(nowTime) != -1);
  console.log(nowWeather);

  // 버튼 변경하기
  const modal_btn = document.querySelector(".modal-button");
  // modal_btn.style.backgroundImage = `url(${matchIcon("Clear")})`;
  modal_btn.style.backgroundImage = `url(${matchIcon(nowWeather[0].weather[0].main)})`
  console.log("nowWeather : " + nowWeather[0].weather[0].main);


  const weatherList = weatherData.list.reduce((acc, cur) => {
    if(cur.dt_txt.indexOf("18:00:00") > 0) // 못 찾으면 -1 반환
    {
      acc.push(cur);
    }

    return acc;
  }, [])
  
  //console.log(weatherList);

  const weatherComponents = weatherList.reduce((acc, cur) => {
    acc += weatherWrapperComponent(cur);
    return acc;
  }, "")

  //console.log(weatherComponents);
  document.querySelector(".modal-body").insertAdjacentHTML('beforeend', weatherComponents);

}

setRenderBackground();
setTime();
setMemo();
getMemo();
deleteMemo();
renderWeather();

// 5초마다 반복
setInterval(() => {
  setRenderBackground();
}, 5000);

