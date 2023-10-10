
function bozhexian(div,titles,get_unit){
  get_datas=BZX_todata;
            var charts = Highcharts.chart(div, {
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
                    xDateFormat: '%Y-%m-%d %H:%M',
                    shared: false
                },
                legend: {
                    align: 'center', //水平方向位置
                    verticalAlign: 'bottom', //垂直方向位置
                    x: 0, //距离x轴的距离
                    y: 0 //距离Y轴的距离
                },
                series: [{
                    name: titles,
                    type: 'spline',
                    yAxis: 0,
                    color: "#07b062",
                    lineWidth: 1.0,
                    step: false,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    data: get_datas,
                    step: false,
                    shadow: false,
                    tooltip: {
                        valueSuffix: get_unit,
                        valueDecimals: 2
                    }
                }]
            });
}
