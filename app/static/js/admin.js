
//fweb.cc QQ1228822 TIME20190909
database_cat()
//搜索框添加数据表名
function database_cat(){
		  $("#tble_search").empty()
		  data={mode:'admin_cat_db_list'}
		  conf=get_ajax('/API',data);
                   
		     $.each(conf.data, function (i, x) {
                       if (x["name"]!='sqlite_sequence'){
                           $("#tble_search").append('<option value="' + x["name"] +'">' + x["name"] + '</option>')
                       }
	          })	
                  gradeChange()
}
function gradeChange(){
		    $("#type_search").empty()
		    p=$("#tble_search").val()
		    data={mode:'admin_cat_db_type',tablename:p}
		    conf=get_ajax('/API',data); 
		    $.each(conf.data, function (t, x) {
                      $("#type_search").append('<option value="' + x["name"] +'">' + x["name"] + '</option>')
               
	           }) 
}	
//遍历所有数据表
function database(){
	  data={mode:'admin_cat_db_list'}
	  conf=get_ajax('/API',data);
	  dbpage=''
	  $.each(conf.data, function (i, x) {
              if (x["name"]!='sqlite_sequence'){
					  dbpage+='<li class="list-group-item"><div class="row">'+
                               // '<div class="col-sm-1"><a href="javascript:;" onclick = "del_db_tble(\''+x["name"]+'\')"><i class="fa fa-trash-o" style="color:red"></i></a></div>'+
                                    '<div class="col-sm-1">'+i+'</div>'+
								'<div class="col-sm-5">'+x["name"]+'</div>'+
								'<div class="col-sm-2"><a href="javascript:;" data-toggle="modal" data-target="#myModal" onclick = "cat_db_type(\''+x["name"]+'\')">查看表结构</a></div>'+
								'<div class="col-sm-2"><a href="javascript:;" data-toggle="modal" data-target="#myModal" onclick = "cat_db_data(\'0\',\'0\',\''+x["name"]+'\')">查看表数据</a></div>'+
								'<div class="col-sm-2"><a href="javascript:;" data-toggle="modal" data-target="#myModal" onclick = "add_db_data_tlbe(\''+x["name"]+'\')"><i class="fa fa-plus-circle" style="font-size:24px"></i></a></div>'+
                      '</div></li>'
					  }
				  })
                 tdbpage='<ul class="list-group"><li class="list-group-item  active">数据库表<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "add_db_tble()" class="text-white"><i class="fa fa-plus-circle" style="font-size:24px"></i></a>'+
'<a href="javascript:;" onclick = "vmue()"><i class="fa fa-circle-o-notch" style="color:red;font-size:24px" ></i></a>'+
		 '</li>'+dbpage+'</ul>';
				  $('#dblist').html(tdbpage)
	}
//清空数据库空字节
function vmue(){
    data={'mode':'admin_clean_db_empty'}
    bak=get_ajax('/API',data);
    if(bak.info=='y'){info_cmd2('info','清理完成','confing_info2')}
}

//查看表结构
function cat_db_type(p){
		    data={mode:'admin_cat_db_type',tablename:p}
		    conf=get_ajax('/API',data); 
				  type_html=''
				  $.each(conf.data, function (t, x) {
					   ERAY=''
					   $.each(x, function (c, v) {
	                                                               ERAY+='<div class="col-sm-1">'+v+'</div>'
           
			              }) 
						type_html+='<div class="row">'+
						            //'<div class="col-sm-1"><a href="javascript:;" onclick = "del_tlebe_type(\''+p+'\',\''+x["name"]+'\')"><i class="fa fa-trash-o" style="color:red"></i></a></div>'+
									ERAY+'</div><hr>'  
	              }) 
				  addlist='参数名:<input type="text" id="add_talbe_new" value=""/>'+
				  			'<select id="select_db_add">'+
						     '<option value="TEXT" selected>文本</option>'+
                             '<option value="INTEGER">整数</option>'+
                             '<option value="REAL">浮点</option>'+
                             '<option value="BLOB">BLOB</option>'+
                         '</select>'+
				'<a href="javascript:void(0);" onclick = "add_tb_list_go(\''+p+'\')" class="btn btn-sm btn-info">保存</a></span></p>'
				  $("#mpage").html(p+'表<hr>'+type_html+'增加列:'+addlist+'<hr><a href="javascript:;" onclick = "del_db_tble(\''+p+'\')" class="btn btn-sm btn-danger">删除表</a><p id="tmpinfo"></p>')
	}
//向表里增加列
function add_tb_list_go(name){
		val=$('#add_talbe_new').val();
		job=$('#select_db_add').val();
		if(val.length>0){	
		    data={mode:'admin_edit_db_lists',tablename:name,title:val,keywords:job};
//console.log(data)
		    bak=get_ajax('/API',data); 
                    if(bak.info=='y'){cat_db_type(name)};		
	        }else{
                    info_cmd2('danger','数据不能为空','confing_info2')
                }
	}
//向表里添加数据页面
function add_db_data_tlbe(p){
		    data={mode:'admin_cat_db_type',tablename:p}
		    conf=get_ajax('/API',data); 
				  type_html='';
				  toval='';
				  $.each(conf.data, function (i,x) {
					 if (x['name'] =='time'){val=new Date().getTime()}else{val=''}
				         if (x['name'] =='page'){vte='<div id="n_'+x['name']+'"></div>'}else{vte='<input type="text" id="n_'+x['name']+'" value="'+val+'">'}
                                         if (x['name'] !='ID'){
						   type_html+='<div class="row">'+
						                '<div class="col-sm-1">'+x['name']+'</div>'+
						                '<div class="col-sm-11">'+vte+'</div>'+     
								      '</div><hr>' ;   
						 }		  

	                          }) 
				 $("#mpage").html('<h3>表:'+p+'</h3><hr>'+type_html+'<button type="button" class="btn btn-primary btn-sm" onclick = "add_db_tble_go(\''+p+'\')">添加</button><p id="tmpinfo"></p>')
				 $('#n_page').summernote({
                                 'height':300,
                                  callbacks: {
                                    onImageUpload: function(files,editor,welEditable) {
                                    console.error('Upload image start...');
                                    sendFile(files[0],editor,welEditable,'#n_page');
                                    console.error('Upload image end...');
                              }
                    }
		})
	}	
//向表里添加数据页面动作
function add_db_tble_go(p){
		
		    data={mode:'admin_cat_db_types',tablename:p}
		    conf=get_ajax('/API',data); 
				  val='';
				  page='';
				  $.each(conf.data, function (i,x) {				            
					  		    if ($('#n_'+x['name']).val()!=undefined){
										if(x['name']=='page'){page='"'+Base64.encode($('#n_page').summernote('code'))+'",';}else{page='"'+$('#n_'+x['name']).val()+'",'}	
				                           val+=page;
								}
				 }) 
		vls=val.substr(0, val.length - 1)
		vals='NULL,'+vls
                data={'mode':'add_db_data','tablename':p,'keywords':vals}
                bak=get_ajax('/API',data);
                if(bak.info=='y'){add_db_data_tlbe(p)}
	}
function cat_db_data(pnumber,val,p){
   $("#mpage").html('...')   
   data={'mode':'table_to_all_h','tablename':p,'d1':val,'d2':Every}
   confip=get_ajax('/API',data);
if(confip.info=='y'){
   ndata=confip.data
   sell=confip.count; 
   pagings=paging(pnumber,sell,'cat_db_data',p)
   LIST_html=''; 
   page=''
   $.each(ndata, function (i, x) {
	    LIST_one=''
		LIST_name=''
		
	   $.each(x, function (n) {//<xmp>'+x[n]+'</xmp>.toString().substr(0,15)
//if(n=='time'){x.time=timestampToTime(x.time)}else{x.time=x.time};
		   if(n!='pass'){
			   if(n=='page'){v=''}else{v=x[n]};
			   if(v!=null){v=v.toString().substr(0,30)}else{v=v};
		           LIST_one+='<th>'+v+'</th>';
			   LIST_name+='<th>'+n+'</th>';
		   }
			}) 
		LIST_html='<th><a href="javascript:;" onclick = "return del_tlebe_data_mod(\''+p+'\',\''+x.ID+'\',\'n\',\'\',\'ID\')"><i class="fa fa-trash-o" style="color:red"></i></a></th>';

		edit_list='<th><a href="javascript:;" onclick = "edit_tlebe_data_mod(\''+p+'\',\''+JSON.stringify(x).replace(/\"/g,'&quot;').replace(/\'/g,"&spke;")+'\',\''+pnumber+'\',\''+val+'\',\''+p+'\')"><i class="fa fa-edit" style="color:gree"></i></a></th>';
		page+='<tr >'+edit_list+LIST_html+LIST_one+'</tr>';

	   }) 
	     Rpage='<div><h4>'+p+' 合计:'+sell+'</h4>'+
		 '<a href="javascript:;" onclick = "return clean_db(\''+p+'\')"><i class="fa fa-trash-o" style="color:red"></i></a>'+
		   '<table  class="table table-hover table-sm font-weight-light">'+
             '<thead class="table">'+
			 	'<th></th>'+
			    '<th></th>'+
			       LIST_name+

              '<tr>'+
		     '</tr>'+
	       '</thead>'+
                 '<tbody id="thedata">'+page+'</tbody>'+
           '</table>'+	 
		 '<p class="text-danger"></p></div>'+
               '<hr>'+pagings
       $("#mpage").html(Rpage)
}else{$("#mpage").html(GET_DATA_INFO)}
	}
//编辑表格数据
function edit_tlebe_data_mod(name,data,pnumber,val,p){
		var datas=JSON.parse(data.replace(/\&quot;/g,'"').replace(/\&spke;/g,"'"));
		var LIST_E='';

		$.each(datas, function (n) {
			//if(n!='ID'){//<textarea rows="10" cols="120" id="'+n+'">'+Base64.decode(datas[n])+'</textarea>}
				if(n=='page'){vte='<div id="'+n+'">'+Base64.decode(datas[n])+'</div>'}else{vte='<input type="text" id="'+n+'" value="'+datas[n]+'">'}
		        LIST_E+='<tr ><th>'+n+'</th><th>'+vte+'</th><tr >';
			
			}) 	 
		   Epage='<a href="javascript:void(0);" onclick ="cat_db_data(\''+pnumber+'\',\''+val+'\',\''+p+'\')"><i class="fa fa-chevron-circle-left"></i>'+name+'</a><table  class="table table-hover table-sm font-weight-light">'+
             '<thead class="table">'+
			    '<th></th>'+
				   '<th></th>'+
              '<tr>'+
		     '</tr>'+
	       '</thead>'+
                 '<tbody>'+LIST_E+'</tbody>'+
           '</table>'+
          '<a href="javascript:void(0);" onclick = "save_data(\''+ name +'\',\''+ JSON.stringify(datas).replace(/\"/g,'&quot;').replace(/\'/g,"&spke;")+'\')" class="btn btn-info btn-sm">保存</a><p id="tmpinfo"></p>'	   

		$("#mpage").html(Epage)
		$('#page').summernote({
                  'height':300,
                   callbacks: {
                                    onImageUpload: function(files,editor,welEditable) {
                                    console.error('Upload image start...');
                                    sendFile(files[0],editor,welEditable,'#page');
                                    console.error('Upload image end...');
                              }
                 }
		})	  
	}
//保存修改的数据
function save_data(name,data){	
		datas=JSON.parse(data.replace(/\&quot;/g,'"').replace(/\&spke;/g,"'"));
		val='';
		page=''
		pagecode=Base64.encode($('#page').summernote('code'));
		$.each(datas, function (n) {
			if(n=='page'){page+='page="'+ pagecode+'",';}else{page+=''}	
			if(n!='page'){
                                       val+=n+'="'+$('#'+n).val()+'",'
			}						
		}) 
                job=page+val.substr(0, val.length - 1)
                Tdata={'mode':'edit_dbs','tablename':name,'title':datas.ID,'keywords':job}
                bak=get_ajax('/API',Tdata);
                if(bak.info=='y'){info_cmd2('info','保存成功','tmpinfo')}
}
//向数据库添加表页面
function add_db_tble(){
		addtlbe='表名:<input type="text" id="tlbe_name"><br>'+
		        '参数:<a href="javascript:void(0);" onclick = "add_input()" class="btn btn-sm btn-info">+</a></span></p>'+
                       '<div id="InputsWrapper">'+
                        '</div><a href="javascript:void(0);" onclick = "add_input_go()" class="btn btn-sm btn-info">保存</a></span></p><div id="db"></div>'
		$('#mpage').html(addtlbe)
	}
//向数据库添加表保存
function add_input_go() {
	db_name=$('#tlbe_name').val()
        val=''
	for ( var i = 1; i < FieldCount+1; i++) {
		if($('#field_'+i).val() != undefined){
		      val+=$('#field_'+i).val()+' '+$('#select_db_'+i).val()+'NOT NULL,';
		}
	 }
	if (db_name.length > 0 & val.length >0){
		         val=val.substr(0, val.length - 1)
		         $('#db').html(db_name+' '+val)
                         data={'mode':'admin_add_db_tables','tablename':db_name,'keywords':val}
                         bak=get_ajax('/API',data);
                         if(bak.info=='y'){database();}
    }else{$('#db').html('填写数据库名称')}				  
}

//删除数据表中数据
function del_tlebe_data_mod(name,id,m,pnumber,path){
         console.log(name,id,m,pnumber,path)
	 if(confirm("确定删除?")){
            data = {
                mode: 'del_table_user_data',
                tablename: name,
                title: path,
                keywords:id 
            };
            bak=get_ajax('/API',data);
	    if (m=='y'){search_go(pnumber,0);}else{cat_db_data(0,0,name)}
	}
}

//向数据库添加表2
var FieldCount=0;
function add_input() {

      FieldCount++; 
	  pinut='<div id="dfield_'+ FieldCount +'">'+
	          '<input type="text" id="field_'+ FieldCount +'" value="Text_'+ FieldCount +'"/>'+
                         '<select id="select_db_'+ FieldCount +'">'+
                             '<option value="TEXT" selected>文本</option>'+
                             '<option value="INTEGER">整数</option>'+
                             '<option value="REAL">浮点</option>'+
                             '<option value="BLOB">BLOB</option>'+
                         '</select>'+
			  '<a href="javascript:void(0);" onclick = "del_input(\'dfield_'+ FieldCount +'\')" class="btn btn-danger btn-sm">X</a>'+
			'</div>'
      $("#InputsWrapper").append(pinut);
    }
//删除数据库表
function del_db_tble(p) {//console.log(p)
	  if(confirm("确定?")){
		  var str = "CONF|menu|menu_type|page|list"
		  if (str.indexOf(p) != -1){
                        info_cmd2('info','表CONF|menu|menu_type|page|user|list不可删除!','confing_info2');
                  }else{
			data={mode:'admin_del_db_tables',tablename:p}
                        bak=get_ajax('/API',data);
                        if(bak.info=='y'){database();}
		  }	  
	  }
} 
	  
function clean_db(p){
  if (!confirm('确定要清空数据表'+p+'?')) return false;
	data={'mode':'admin','type':'clean_db','val':p}

            data = {
                mode: 'clean_db',
                tablename: p
            };
            bak=get_ajax('/API',data);
            if(bak.info=='y'){info_cmd2('info','数据表'+p+'已清空','confing_info2')}

}
//搜索页面
function search_go(pnumber,p){
        tble=$("#tble_search").val();
        mode=$("#type_search").val();	
        title=$("#Server_search").val()
        data={'mode':'admin_search_db','tablename':tble,'keywords':mode,'title':title,'d1':p,'d2':Every}
        conf=get_ajax('/API',data);

   if(conf.info=='y'){
     ndata=conf.data
     sell=conf.count; 

     pagings=paging(pnumber,sell,'search_go',Every)

     LIST_html=''; 
     page=''
     $.each(ndata, function (i, x) {
	    LIST_one=''
		LIST_name=''
		
	   $.each(x, function (n) {

                   //if(n=='time'){x.time=timestampToTime(x.time)}else{x.time=x.time}
		   if(n!='pass'){
			   if(n=='page'){v=''}else{v=x[n]}
			   if(v!=null){v=v.toString().substr(0,20)}else{v=v}
		    LIST_one+='<th>'+v+'</th> '
			LIST_name+='<th>'+n+'</th>'
		   }
			}) 
		LIST_html='<th><a href="javascript:;" onclick = "del_tlebe_data_mod(\''+tble+'\',\''+x.ID+'\',\'y\',\''+pnumber+'\',\'ID\')"><i class="fa fa-trash-o" style="color:red"></i></a></th>';

		edit_list='<th><a href="javascript:;" data-toggle="modal" data-target="#myModal" onclick = "edit_tlebe_data_mod(\''+tble+'\',\''+JSON.stringify(x).replace(/\"/g,'&quot;').replace(/\'/g,"&spke;")+'\',\''+p+'\',\''+pnumber+'\',\''+Every+'\')"><i class="fa fa-edit" style="color:gree"></i></a></th>';
		page+='<tr >'+edit_list+LIST_html+LIST_one+'</tr>';

	   }) 
	     Rpage='<hr><div><h4>表名:'+tble+' 合计搜索到:'+sell+'</h4>'+
                 '<a href="javascript:;" onclick = "del_tlebe_data_mod(\''+tble+'\',\''+$("#Server_search").val()+'\',\'y\',\''+pnumber+'\',\''+$('#type_search').val()+'\')"><i class="fa fa-trash-o" style="color:red"></i></a>[清空精确搜索,搜索框类型要与搜索内容完全匹配!]'+
		   '<table  class="table table-hover table-sm font-weight-light">'+
                     '<thead class="table">'+
			  '<th></th>'+
			 '<th></th>'+
			 LIST_name+
                       '<tr>'+
		     '</tr>'+
	       '</thead>'+
                 '<tbody id="thedata">'+page+'</tbody>'+
              '</table>'+	 
		 '<p class="text-danger"></p></div>'+
               '<hr>'+pagings
       $("#list").html(Rpage)

			 
  }else{Rpage='<div class="alert alert-danger text-muted">啥也没搜索到...</div>'; }
    $("#list").html(Rpage)       
}
//提示框
function info_cmd2(p,q,z){
         $("#"+z).show();
         info='<div class="alert alert-'+p+'"><strong>'+q+'</strong></div>'
         $('#'+z).html(info)
         setTimeout('$("#'+z+'").hide()',3000);
}	 