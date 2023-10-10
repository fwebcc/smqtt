function about_get() {
    free_info = get_ajax('/API',{"mode": "get_cmd_sh","keywords":"u_name"});
    free_user=(free_info.free.used/free_info.free.total).toFixed(2)*100;
    free_swap=(free_info.Swap.Swap_used/free_info.Swap.Swap_total).toFixed(2)*100;

    ap = ''
    $.each(GLOB_CONF.about, function(t) {ap +='<div class="p-2">'+ t + ' ' + GLOB_CONF.about[t]+'</div>';})
    about_page ='<div class="container mt-3">'+ 
               '<div class="d-flex justify-content-between mb-3 alert alert-info">'+
                   '<div class="p-2">版本号:'+version.responseText+'</div>'+ap+
               '</div>'+          
            '</div>'+
       '<div class="alert alert-secondary">'+
            '<p class="text-danger font-weight-bold"><i class="fa fa-laptop" style="font-size:24px;"></i>:'+free_info.date+'</p>'+
             '<div class="row">'+
                  '<div class="col-sm-3" ><p class="text-danger font-weight-bold"><i class="fa fa-microchip" style="font-size:24px;"></i>:'+bytesToSize(free_info.free.total)+'<i class="fa fa-pie-chart" style="font-size:24px;"></i>:'+bytesToSize(free_info.free.free)+'</p></div>'+ 
                  '<div class="col-sm-7" >'+
                       '<div class="progress">'+
                            '<div class="progress-bar progress-bar-striped progress-bar-animated" style="width:'+free_user+'%">'+free_user+'%</div>'+
                      '</div>'+
                 '</div></div>'+
             '<div class="row">'+
                  '<div class="col-sm-3" ><p class="text-danger font-weight-bold">Swap:'+bytesToSize(free_info.Swap.Swap_total)+'<i class="fa fa-pie-chart" style="font-size:24px;"></i>:'+bytesToSize(free_info.Swap.Swap_free)+'</p></div>'+ 
                  '<div class="col-sm-7" >'+
                       '<div class="progress">'+
                            '<div class="progress-bar progress-bar-striped progress-bar-animated" style="width:'+free_swap+'%">'+free_swap+'%</div>'+
                      '</div>'+
                 '</div>'+
                                   '</div>'    
      $("#page_list").html(about_page)
}
