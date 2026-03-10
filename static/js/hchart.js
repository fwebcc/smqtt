$.getScript('../static/js/highcharts.js')
$.getScript('../static/js/highcharts-more.js')
$.getScript('../static/js/solid-gauge.js')
$.getScript('../static/js/solid-gauge.js')
$.getScript('../static/js/exporting.js')
 // <script src="../static/js/highcharts.js"></script>
 // <script src="../static/js/highcharts-more.js"></script>
 // <script src="../static/js/solid-gauge.js"></script>
 // <script src="../static/js/exporting.js"></script>
 // <script src="../static/js/highstock_zh_cn.js"></script>
function bozhexian(div, titles, get_unit, data) {
    // 1. 处理数据逻辑
    var formattedData = data.map(function(point) {
        var time = point[0];
        if (time < 1000000000000) { time = time * 1000; }
        return [time, point[1]];
    }).sort(function(a, b) { return a[0] - b[0]; });

    // 2. 初始化图表
    var charts = Highcharts.chart(div, {
        chart: {
            type: 'areaspline', 
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderWidth: 0,
            spacing: [20, 10, 20, 10],
            style: { fontFamily: 'inherit' }
        },
        time: { useUTC: false },
        title: { text: null },
        credits: { enabled: false },
        
        xAxis: {
            type: 'datetime',
            gridLineWidth: 0,
            lineColor: '#f0f0f0',
            tickColor: '#f0f0f0',
            dateTimeLabelFormats: {
                minute: '%Y-%m-%d %H:%M',
                hour: '%Y-%m-%d %H:%M',
                day: '%Y-%m-%d',
                week: '%Y-%m-%d',
                month: '%Y-%m',
                year: '%Y'
            },
            crosshair: {
                width: 1,
                color: '#1890ff',
                dashStyle: 'dot'
            }
        },

        yAxis: {
            title: { text: null },
            opposite: true,
            gridLineDashStyle: 'Dash',
            gridLineColor: '#f5f5f5',
            // --- 核心配置：不从0开始 ---
            startOnTick: false,       // 关键：不强制从刻度线开始（防止拉回到0）
            endOnTick: false,         // 关键：不强制结束于刻度线
            min: null,                // 允许根据数据自动计算最小值
            softMin: null,            // 移除软最小值限制
            // -----------------------
            labels: {
                align: 'right',
                x: 0,
                y: -5,
                style: { color: '#bfbfbf', fontSize: '11px' },
                format: '{value}'
            }
        },

        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderWidth: 0,
            borderRadius: 12,
            shadow: true,
            shared: true,
            useHTML: true,
            headerFormat: '<small style="color:#8c8c8c; font-size:11px;">{point.key:%Y-%m-%d %H:%M}</small><br/>',
            pointFormat: '<div style="margin-top:4px;"><span style="color:{point.color}">●</span> <b>{point.y}</b> <small>{series.options.custom.unit}</small></div>',
            style: { padding: '10px' }
        },

        legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: { color: '#8c8c8c', fontWeight: 'normal', fontSize: '12px' }
        },

        plotOptions: {
            areaspline: {
                // --- 核心配置：解除面积图对0的依赖 ---
                threshold: null,      // 关键：如果不设为null，阴影部分会一直画到0刻度
                // ------------------------------------
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(24, 144, 255, 0.2)'],
                        [1, 'rgba(24, 144, 255, 0.0)']
                    ]
                },
                lineWidth: 3,
                color: '#1890ff',
                marker: {
                    enabled: false,
                    states: { hover: { enabled: true } }
                },
                states: {
                    hover: { lineWidth: 4 }
                }
            }
        },

        series: [{
            name: titles,
            data: formattedData,
            custom: { unit: get_unit },
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
};

function petroleum_T(NYMEX,spline,div){
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
