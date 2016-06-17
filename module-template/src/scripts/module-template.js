(function () {

  //http://api.demo.com/v1/_sup/store/{store_id}/store_info.action
  $.ajax({
    type: 'GET',
    url: '../consumer-api/v1/banner/list.action',
    dataType: 'json',
    data: {
      offset: 0,
      size: 10,
      store_id: 7
    },
    headers: {
      zjtoken: 'test`test`7'
    },
    success: function (response) {
      console.log(response);
    }
  });
  console.log('app goes here!');

}());
