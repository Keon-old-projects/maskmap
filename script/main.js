let city = "";//紀錄選取的縣市名稱
let townData = [];//匯入鄉鎮地區的資料
let country = "";//紀錄選取的鄉鎮地區
let maskData = [];//匯入的藥局資料集合
// const value = $(this).val();

// 地圖資訊
const place =[24.1685276, 120.6084719];//經緯度
const map = L.map('map').setView(place, 13);


$(function () {

    // 載入圖資
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',// 商用時必須要有版權出處
        zoomControl: true, // 是否秀出 - + 按鈕
    }).addTo(map);

    L.marker(place).addTo(map)
        .bindPopup(`目前位置`);


    // 載入藥局資料
    $.ajax({
        type: "get",
        url: 'script/points.json',
        dataType: "json",
        async: false,
        success: function (data) {
            maskData = data.features;
        },
        error: function () {
            alert("載入資料失敗!");
        }
    });
    console.log(maskData);//讀取健保局的所有藥局資料





    // 縣市綁定HTML選單
    // console.log(cityData);//監聽台灣縣市鄉鎮地區的資料集合
    $('#TaiwanCity')
        .empty()
        .append(`<option selected>--請選擇縣市--</option>`)
        .append(cityData.map(e => `<option value="${e.CityName}">${e.CityName}</option>`))
        .on('change', function () {
            const cityval = $(this).val();
            // console.log(cityval);//監聽所選取的縣市
            //監聽縣市，載入藥局資料
            const citylist = maskData.filter(i=>i.properties.county == cityval);
            console.log(citylist);
            removeMarker();// 清除地圖座標
            // 渲染縣市地圖
            $('drogstore')
                .empty()
                .append(citylist.map((i,key) =>{
                    let lat = i.geometry.coordinates[1],
                        lng = i.geometry.coordinates[0];
                    
                        // console.log(lat, lng);
                    L.marker([lat, lng]).addTo(map).bindPopup(
                        `<div class="card">
                            <h4 class="card-header text-center">${i.properties.name}</h4>
                            <p class=" fs-5 my-2">成人口罩: <span class="text-danger">${i.properties.mask_adult}</span>個</p>
                            <p class=" fs-5 my-2">兒童口罩: <span class="text-danger">${i.properties.mask_child}</span>個</p>
                        </div>`
                    );

                    //地圖移動
                    console.log(key);
                    if(key == 0){
                            map.panTo([lat, lng]);
                    }

                    return `<li class="list-group-item">
                            <h4 class="fw-bold">${i.properties.name}</h4>
                            <p>地址: ${i.properties.address}</p>
                            <p>電話: ${i.properties.phone}</p>
                            <p>成人口罩: <span class="text-danger h4">${i.properties.mask_adult}</span>個 | 兒童口罩: <span class="text-danger h4">${i.properties.mask_child}</span>個
                            </p>
                        </li>`
                
                }))
            
            
            // 匯入鄉鎮地區的資料
            townData = cityData.find(e => $(this).val() === e.CityName).AreaList;
            // 鄉鎮地區綁定HTML選單
            $("#TaiwanTown")
                .empty()
                .append(`<option selected>--再選擇地區--</option>'`)
                .append(townData.map(e => `<option value="${e.AreaName}">${e.AreaName}</option>`))
                .on('change', function () {
                    //監聽鄉鎮地區，縮小藥局資料
                    // console.log(townData);顯示該縣市的鄉鎮地區資料
                    const townval = $(this).val();
                    // console.log(cityval); //縣市選單名稱
                    // console.log(townval); //鄉鎮地區選單名稱
                    const townlist = maskData.filter(i => i.properties.county == cityval && i.properties.town == townval);
                    // console.log(townlist.map(i=>i.properties));
                    console.log(townlist);
                    
                    removeMarker();// 清除地圖座標
                    
                    //渲染藥局資訊
                    $("#drugstore")
                        .empty()
                        .append(townlist.map((i,key) =>{
                            let lat = i.geometry.coordinates[1],
                                lng = i.geometry.coordinates[0];
                            
                                // console.log(lat, lng);
                            L.marker([lat, lng]).addTo(map).bindPopup(
                                `<div class="card">
                                    <h4 class="card-header text-center">${i.properties.name}</h4>
                                    <p class=" fs-5 my-2">成人口罩: <span class="text-danger">${i.properties.mask_adult}</span>個</p>
                                    <p class=" fs-5 my-2">兒童口罩: <span class="text-danger">${i.properties.mask_child}</span>個</p>
                                </div>`
                            );

                            //地圖移動
                            console.log(key);
                            if(key == 0){
                                    map.panTo([lat, lng]);
                            }

                            return `<li class="list-group-item">
                                    <h4 class="fw-bold">${i.properties.name}</h4>
                                    <p>地址: ${i.properties.address}</p>
                                    <p>電話: ${i.properties.phone}</p>
                                    <p>成人口罩: <span class="text-danger h4">${i.properties.mask_adult}</span>個 | 兒童口罩: <span class="text-danger h4">${i.properties.mask_child}</span>個
                                    </p>
                                </li>`
                        
                        }))

                });


        });

});

// 清除地圖座標
function removeMarker(){
    map.eachLayer(function(layer){
        if(layer instanceof L.Marker){
            map.removeLayer(layer);
        }
    });
}