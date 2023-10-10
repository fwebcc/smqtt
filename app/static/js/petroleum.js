function petroleum(Publish){ 
                               
                  pet=get_ajax('/API',{"mode": "get_oilprice","keywords": Publish });
//pet=$.getJSON('../static/txt/petroleum.json')
//pet = JSON.parse(pet.responseText);
if(pet.info=='y'){
                  NYMEX=get_ajax('https://futsseapi.eastmoney.com/static/102_CL00Y_qt85ff','');
   
                                          pto1=' <ul class="list-group">'+
  '<li class="list-group-item list-group-item-success"><h2>'+Publish+'</h2></li>'+
  '<li class="list-group-item list-group-item">'+NYMEX.qt.name+'<h2>'+NYMEX.qt.mrj+'</h2>'+NYMEX.qt.zdf+'%</li>'+
  '<li class="list-group-item list-group-item">'+pet.g_time_s+'<br> '+pet.g_time_x+'</li>'+
  '<li class="list-group-item list-group-item "><i class="fa fa-arrow-circle-up"></i>:'+pet.max_95+' 元/升<i class="fa fa-arrow-circle-down"></i>:<l class="text-danger">'+pet.min_95+'</l>元/升<span class="badge badge-secondary font-weight-bold">95#</span></li>'+
  '<li class="list-group-item list-group-item"><i class="fa fa-arrow-circle-up"></i>:'+pet.max_92+'元/升 <i class="fa fa-arrow-circle-down"></i>:'+pet.min_92+'元/升<span class="badge badge-secondary font-weight-bold">92#</span></li>'+
  '<li class="list-group-item list-group-item"><i class="fa fa-arrow-circle-up"></i>:'+pet.max_0+'元/升 <i class="fa fa-arrow-circle-down"></i>:'+pet.min_0+'元/升<span class="badge badge-secondary font-weight-bold">0#</span></li>'+
'</ul><div id="ptu" style="width:100;height: 300px;"></div><div>来源:<a href="'+pet.source+'" target="_blank"><i class="fa fa-link"></i></a></div>';
   $('#mpage').html(pto1)
   tobiao(pet.NYMEX,pet.spline,'ptu')
}else{$('#mpage').html(GET_DATA_INFO)}
} 
function tobiao(NYMEX,spline,div){
            var chart = Highcharts.chart(div, {
                chart: {
                    zoomType: 'x',
                    animation: false,
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false,
                    resetZoomButton: {
                        theme: {
                            display: 'none'
                        }
                    }
                },
                colors: [
                    "#07b062", // 油耗曲线颜色
                    '#ff9a49'
                ],
                title: {
                    text: null
                },
                time: {
                    useUTC: false
                },

                subtitle: {
                    text: null
                },
                credits: {
                    enabled: false // 禁用版权信息
                },
                rangeSelector: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                xAxis: [{
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        millisecond: '%Y-%m-%e<br/>%H:%M',
                        second: '%Y-%m-%e<br/>%H:%M',
                        minute: '%Y-%m-%e<br/>%H:%M',
                        hour: '%Y-%m-%e<br/>%H:%M',
                        day: '%Y<br/>%m.%e',
                        week: '%Y-%m-%e',
                        month: '%Y-%m',
                        year: '%Y年'
                    },
                    crosshair: true
                }],
                yAxis: [{ // Secondary yAxis
                    title: {
                        text: null
                    },
                    labels: {
                        x: 2,
                        style: {
                            color: "#07b062"
                        }
                    },
                    opposite: true
                }, { // Primary yAxis
                    labels: {
                        style: {
                            color: "#ff9a49"
                        }
                    },
                    title: {
                        text: null
                    }
                }],
                tooltip: {
                    xDateFormat: '%Y-%m-%d',
                    shared: false
                },
                legend: {
                    align: 'center', //水平方向位置
                    verticalAlign: 'bottom', //垂直方向位置
                    x: 0, //距离x轴的距离
                    y: 0 //距离Y轴的距离
                },
                series: [{
                    name: 'NYMEX',
                    type: 'spline',
                    yAxis: 1,
                    color: "#ff9a49",
                    lineWidth: 1.0,
                    step: false,
                    marker: {
                        enabled: false,
                    },
                    shadow: false,
                    data: JSON.parse(NYMEX),//NYMEX_data,
                    step: false,
                    shadow: false,
                    tooltip: {
                        valueSuffix: '美元/桶',
                        valueDecimals: 2
                    }
                }, {
                    name: '油价',
                    type: 'spline',
                    zIndex: 1000,
                    yAxis: 0,
                    color: "#07b062",
                    threshold: null,
                    lineWidth: 1.0,
                    marker: {
                        enabled: false
                    },         
                    data: JSON.parse(spline),//spline_data
                     tooltip: {
                        valueSuffix: '元/升',
                        valueDecimals: 2
                    }
                }]

            });
}