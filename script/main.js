let city = ""; //紀錄選取的縣市名稱
let townData = []; //匯入鄉鎮地區的資料
let country = ""; //紀錄選取的鄉鎮地區
let maskData = []; //匯入的藥局資料集合
let days = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];
const now = new Date();
// const value = $(this).val();

// 地圖資訊
const place = [24.177253541961687, 120.61678567485743]; //經緯度
const map = L.map("map").setView(place, 13);
// const menu = new Mmenu(
//   "#menu",
//   {
//     slidingSubmenus: false,
//   },
//   {
//     classNames: {
//       selected: "active",
//     },
//     offCanvas: {
//       page: {
//         selector: "#page",
//       },
//     },
//   }
// );
// const api = menu.API;

$(function () {
  // // menu選單
  $(".open-btn").click(() => {
    $("#menu").toggleClass("active");
    // console.log("123");
    if ($(".open-btn-fa").hasClass("fa-bars")) {
      $(".open-btn-fa").removeClass("fa-bars").addClass("fa-x");
    } else {
      $(".open-btn-fa").removeClass("fa-x").addClass("fa-bars");
    }
  });

  //抓取使用者位置
  map.locate({
    setView: true, // 是否讓地圖跟著移動中心點
    watch: true, // 是否要一直監測使用者位置
    maxZoom: 9, // 最大的縮放值
    enableHighAccuracy: true, // 是否要高精準度的抓位置
    timeout: 10000, // 觸發locationerror事件之前等待的毫秒數
  });

  // 載入圖資
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', // 商用時必須要有版權出處
    zoomControl: true, // 是否秀出 - + 按鈕
  }).addTo(map);

  // 時間設置
  $("#date").text(
    `${now.getFullYear()} / ${now.getMonth() + 1} / ${now.getDate()}`
  );

  $("#week").text(days[now.getDay()]);

  //抓取到使用者位置之後
  map.on("locationfound", (e) => {
    // 建立 marker
    L.marker(place, {
      title: "", // 跟 <a> 的 title 一樣
      opacity: 1.0,
    })
      .addTo(map)
      .setLatLng(e.latlng) // 移動 marker
      .bindPopup(`目前位置`)
      .openPopup();
  });

  // 抓不位置的話要做的事情
  map.on("locationerror", errorHandler);

  // 載入藥局資料
  $.ajax({
    type: "get",
    url: "./script/points.json",
    dataType: "json",
    async: false,
    success: function (data) {
      maskData = data.features;
    },
    error: function () {
      alert("載入資料失敗!");
    },
  });
  console.log(maskData); //讀取健保局的所有藥局資料

  // 縣市綁定HTML選單
  // console.log(cityData);//監聽台灣縣市鄉鎮地區的資料集合
  $("#TaiwanCity")
    .empty()
    .append(`<option selected>--縣市--</option>`)
    .append(
      cityData.map(
        (e) => `<option value="${e.CityName}">${e.CityName}</option>`
      )
    )
    .on("change", function () {
      const cityVal = $(this).val();
      console.log(cityVal); //監聽所選取的縣市
      //監聽縣市，載入藥局資料
      const cityList = maskData.filter((i) => i.properties.county == cityVal);
      // console.log("cityList:", cityList);
      removeMarker(); // 清除地圖座標
      // 渲染縣市地圖與藥局資訊
      $("#drugStore")
        .empty()
        .append(
          cityList.map((i, key) => {
            let lat = i.geometry.coordinates[1],
              lng = i.geometry.coordinates[0];
            // console.log(i);
            // console.log(lat, lng);
            L.marker([lat, lng])
              .addTo(map)
              .bindPopup(
                `<div class="store-card">
                  <h4>${i.properties.name}</h4>
                  <p><i class="fa-solid fa-location-dot"></i>　${i.properties.address}</p>
                  <p><i class="fa-solid fa-phone-volume"></i>　${i.properties.phone}</p>
                  <div class="btn-group" role="group" aria-label="Basic example">
                    <button class="btn btn-warning">成人: ${i.properties.mask_adult}個</button>
                    <button class="btn btn-success">兒童: ${i.properties.mask_child}個</button>
                  </div>
                </div>`
              );

            //地圖移動
            // console.log("key:", key);
            if (key == 0) {
              map.panTo([lat, lng]);
            }

            return `
              <li>
                <h4>${i.properties.name}</h4>
                <p><i class="fa-solid fa-location-dot"></i>　 ${i.properties.address}</p>
                <p><i class="fa-solid fa-phone-volume"></i>　${i.properties.phone}</p>
                <div class="btn-group">
                  <button>成人口罩: <span class="text-danger h4">${i.properties.mask_adult}</span>個</button>
                  <button>兒童口罩: <span class="text-danger h4">${i.properties.mask_child}</span>個</button>
                </div>
              </li>`;
          })
        );

      // 匯入鄉鎮地區的資料
      townData = cityData.find((e) => $(this).val() === e.CityName).AreaList;
      // 鄉鎮地區綁定HTML選單
      $("#TaiwanTown")
        .empty()
        .append(`<option selected>--鄉鎮地區--</option>'`)
        .append(
          townData.map(
            (e) => `<option value="${e.AreaName}">${e.AreaName}</option>`
          )
        )
        .on("change", function () {
          //監聽鄉鎮地區，縮小藥局資料
          // console.log(townData);顯示該縣市的鄉鎮地區資料
          const townVal = $(this).val();
          // console.log(cityVal); //縣市選單名稱
          // console.log(townVal); //鄉鎮地區選單名稱
          const townList = maskData.filter(
            (i) =>
              i.properties.county == cityVal && i.properties.town == townVal
          );
          // console.log(townList.map(i=>i.properties));
          // console.log(townList);

          removeMarker(); // 清除地圖座標

          //渲染藥局資訊
          $("#drugStore")
            .empty()
            .append(
              townList.map((i, key) => {
                let lat = i.geometry.coordinates[1],
                  lng = i.geometry.coordinates[0];

                // console.log(lat, lng);
                L.marker([lat, lng])
                  .addTo(map)
                  .bindPopup(
                    `<div class="store-card">
                      <h4>${i.properties.name}</h4>
                      <p><i class="fa-solid fa-location-dot"></i>　${i.properties.address}</p>
                      <p><i class="fa-solid fa-phone-volume"></i>　${i.properties.phone}</p>
                      <div class="btn-group" role="group" aria-label="Basic example">
                        <button class="btn btn-warning">成人: ${i.properties.mask_adult}個</button>
                        <button class="btn btn-success">兒童: ${i.properties.mask_child}個</button>
                      </div>
                    </div>`
                  );

                //地圖移動
                // console.log(key);
                if (key == 0) {
                  map.panTo([lat, lng]);
                }

                return `
                <li>
                  <h4>${i.properties.name}</h4>
                  <p><i class="fa-solid fa-location-dot"></i>　 ${i.properties.address}</p>
                  <p><i class="fa-solid fa-phone-volume"></i>　${i.properties.phone}</p>
                  <div class="btn-group">
                    <button>成人口罩: <span class="text-danger h4">${i.properties.mask_adult}</span>個</button>
                    <button>兒童口罩: <span class="text-danger h4">${i.properties.mask_child}</span>個</button>
                  </div>
                </li>`;
              })
            );
        });
    });
});

// 清除地圖座標
function removeMarker() {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
}

// 使用者不提供位置
function errorHandler(e) {
  console.log("e", e);
  window.alert(
    "無法判斷您的所在位置，無法使用此功能。預設地點將為 台中世貿中心"
  );
  map.setView(place, 18); // 中心移到台中世貿
}
