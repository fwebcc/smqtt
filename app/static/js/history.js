
//查看数据表数据
function history(pnumber=0,val=0){
   data={'mode':'table_to_all_h','tablename':'Rec_stat','d1':val,'d2':Every}	
   confip=get_ajax('/API',data); 	

   ndata=confip.data
   sell=confip.count; 

   pagings=paging(pnumber,sell,'history');

   LIST_html=''; 
   page='';
   LIST_name='';
   if (ndata!='n'){
   $.each(ndata, function (i, x) {
	    LIST_one='';
	    LIST_name='';
	    
	   $.each(x, function (n) {
                    if (n=='title'){
                        LIST_one+='<th><a  href="javascript:void(0);" onclick = "get_history(\'0\',\'0\',\''+x[n]+'\',\'history_list\',\''+find_ip(x[n])+'\',\'\');" >'+x[n]+'</a></th>';
                    }else{
                        if(n=='time'){x.time=timestampToTime(x.time)}else{x.time=x.time};
                        LIST_one+='<th>'+x[n]+'</th>';
		   }
		       LIST_name+='<th>'+n+'</th>';
			}) 
		   page+='<tr >'+LIST_one+'</tr>';

	   }) 
	     Rpage='<div id="history_list"><h4><i class="fa fa-th" style="font-size:24px"></i>'+sell+'</h4>'+
		 '<a href="javascript:;" onclick = "return clean_db(\'Rec_stat\')"><i class="fa fa-trash-o" style="color:red"></i></a>'+
		   '<table  class="table table-hover table-sm text-muted">'+
     '<thead class="table">'+
		LIST_name+

              '<tr>'+
		     '</tr>'+
	       '</thead>'+
                 '<tbody id="thedata">'+page+'</tbody>'+
           '</table>'+	 
		      '<p class="text-danger"></p>'+
               '<hr>'+pagings+'</div><div id="bub_list"></div>'
       $("#page_list").html(Rpage)
       //get_pages()
}else{$("#page_list").html(GET_DATA_INFO)}
	}
function clean_db(p){
  if (!confirm('确定要清空数据表'+p+'?')) return false;
       data={'mode':'clean_db','tablename':'Rec_stat'}	
       confip=get_ajax('/API',data); 
if(confip.info=='y'){history(0,0);$("#myModal").modal('hide');}else{$("#myModal").modal('失败')}

    

}
function find_ip(p){
           ip='';
	   $.each(L_LIST.data, function (x,n) {
               if(n.title==p){ip=n.ip;}
           })
           return ip 
}
//搜索页面
function get_history(pnumber=0,p=0,key,tpage,inub,Publish,mode=''){
    $("#mpage").empty()
    display='';
    $.each(GLOB_CONF['type'], function(k, t) {
              if(t.val==mode){display=t.stat}
    })

    if(display=='Publish'){
           $("#"+tpage).html('<div class="alert col-sm-12 alert-danger">'+Publish+'</div>')
    }else{
           data={'mode':'table_to_sec','tablename':'Rec_stat','d1':p,'d2':Every,'title':'title','keywords':key}	
           conf=get_ajax('/API',data); 	

           if(conf.info=='y'){
                      ndata=conf.data
                      sell=conf.count; 

                      pagings=paging(pnumber,sell,'get_history',key,tpage);
                      if(isEmpty(inub) == true){ip=''}else{ip=inub};
                      LIST_html=''; 
                      page=''
                      $.each(ndata, function (i, x) {
                           LIST_one='';
                           LIST_name='';
                           LIST_two='';
                           $.each(x, function (n) {
                               if(n!='pass'){
			                     if(n=='time'){x.time=timestampToTime(x.time)}else{x.time=x.time}
			                     if(n=='page'){v=''}else{v=x[n]}
			                     if(v!=null){v=v.toString().substr(0,20)}else{v=v}
			                     LIST_name+='<th>'+n+'</th>';
			                     LIST_one+='<th>'+v+'</th>';

                               }

                           })                  
                          page+='<tr >'+LIST_one+'</tr>';
                      }) 
	   if(tpage=='history_list_page'){
                  balk_mun=''
	   }else{
                  balk_mun='<a  href="javascript:void(0);" onclick = "history(0,0)"><i class="fa fa-backward"></i></a>'
	   }
	   Rpage='<div><h4>'+balk_mun+'<i class="fa fa-th-list" style="font-size:24px"></i>['+key+'] <i class="fa fa-search" style="font-size:24px"></i>'+sell+'</h4>'+
                      '<a href="javascript:;" onclick = "del_tlebe_data_mod(\'Rec_stat\',\''+key+'\',\'y\',\''+pnumber+'\',\'title\',\''+tpage+'\')"><i class="fa fa-trash-o" style="color:red"></i></a>[清空所<i class="text-danger">'+key+'</i>有记录!]<a href="http://'+ip+'" target="_blank" >IP:'+ip+'</a>'+
		   '<table  class="table table-hover table-sm text-muted">'+
             '<thead>'+
		LIST_name+
              '<tr>'+
           '</tr>'+
	       '</thead>'+
                 '<tbody id="thedata">'+page+'</tbody>'+
           '</table>'+	 
		 '<p class="text-danger"></p>'+
               pagings+'</div>'
       $("#"+tpage).html(Rpage)

 }else{$("#"+tpage).html(GET_DATA_INFO)}
}
}
//删除数据表中数据
function del_tlebe_data_mod(name,id,m,pnumber,path,tpage){
    if(confirm("确定删除?")){
       data={'mode':'del_table_user_data','tablename':'Rec_stat','title':path,'keywords':id}	
       confip=get_ajax('/API',data); 
 
       if(tpage=='history_list_page'){
                     get_history(0,0,name,tpage)
       }else{
	             if (m=='y'){history(0,0)}else{get_history(0,0,name,tpage)}
       } 
    }
}
