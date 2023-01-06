let cityName = "";//紀錄選取的縣市名稱
let townName = [];//紀錄選取的鄉鎮地區
let maskData= [];//紀錄匯出的藥局
$(function(){
    // 載入藥局資料
    $.ajax({
        type: "GET",
        url: "points.json",
        dataType: "json",
        async: false,
        success: function(data){
            maskData = data.features;
        },
        error: function(){
            alert("讀取健保局的所有藥局資料失敗!");
            console.log('Error: ' + textStatus);
        }
    });
    console.log(maskData);


    // 綁定縣市選單
    console.log(cityData);
    $('#TaiwanCity').empty();
    $('#TaiwanCity').append('<option selected>--請選擇縣市--</option>');
    
    // cityName.forEach(e => {
    //     console.log("e.cityName");

    // });




});