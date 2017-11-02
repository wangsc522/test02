
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: '點數系統',titlename:"未知客戶" });
};

