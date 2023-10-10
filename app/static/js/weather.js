function getweekshu(date){
var weekArray = new Array(0,   1,   2,   3,   4,  5, 6);
var week = weekArray[new Date(date).getDay()];
return week;
}
function getNewArray(array, h) {
  let index = 0;
  let newArray = [];
  while(index < array.length) {
      newArray.push(array.slice(index, index += h));
  }
  return newArray;
}
function taddd(d){
   var nArr= getNewArray(d, 7);
   $.each(nArr, function(p,q) {
       $.each(q, function(k,v) {
          $('#tr'+p).append('<td id="td'+k+'">'+v+'</td>'); 
       });
   });                                               
}
function weather(Publish){
                 D_warther=get_ajax('../static/txt/warther.json','');
                 D_warther_id=get_ajax('../static/txt/warther_id.json','');
                 C_id='';
                 $.each(D_warther_id, function(i,x) {
                    if(x.NAMECN==Publish){C_id=x.AREAID}
                 })

                 W_URL='https://zhwnlapi.etouch.cn/Ecalender/api/v2/weather?citykey='+C_id
                 //GD_VAL=$.ajax({url:W_URL,type:'GET',cache: false,async: false });
                 GD_VAL = get_ajax('./API',{'mode':'get_url','keywords':W_URL,'title':'json'});

                 $('#mpage').html('<h4>'+GD_VAL.data.meta.city+'</h4><div style="overflow-x: auto;overflow-y: auto;width:100%;height:600px;margin: 0;" class="bg-secondary text-white"><table style="border-collapse: collapse;border: none;margin: 0;padding: 0;width:100%;" id="QTable"><thead></thead><tbody></tbody></table><div class="row"></div></div>')
                 wrray = ['日',   '一',   '二',   '三',   '四',   '五',   '六'];
                 $('#QTable thead').append('<tr id="trx"></tr>');
                 $.each(wrray, function(k,v) {
                     $('#QTable thead tr').append('<th id=th'+k+'>'+v+'</th>');//prepend
                 })
                 for(var x=0;x<7;x++){
                     $('#QTable tbody').append('<tr id="tr'+x+'"></tr>');
                 }  

                 if (GD_VAL.info=='y'){
                    w_page='';
                    value=[]
                    $.each(GD_VAL.data.forecast40, function(i, x) {
                      const regDate = /^(\d{4})(\d{2})(\d{2})$/;
                      date=(x.date).replace(regDate, "$1-$2-$3")
                      TVE='<div class="d-flex flex-column text-center text-white border" style="min-height:180px;background: url('+x.day.bgPic+')">'+//  
                            '<div >'+date.substring(date.length-5)+'</div><div class="p-2">'+x.day.wthr+'</div>'+//x.day.wd+x.day.wp+
                             //D_warther[x.day.wthr]+
                             '<div class="ticon ttu'+x.day.type+'"></div>'+
                             '<div><p>'+x.low+"℃ </p><p>"+x.high+'℃</p></div>'+
                           '</div>'
                         //补偿星期天数
                         if(i==0){
                                 dates=(x.date).replace(regDate, "$1-$2-$3");
                                 BS=getweekshu(dates);
                                 for(var x=0;x<BS;x++){
                                        value.push('');
                                 }
                          }
                          value.push(TVE);
                    });
                    taddd(value);
                 }else{
                     $('#mpage').html(GET_DATA_INFO);
                 }

}