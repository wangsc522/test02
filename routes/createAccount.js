
/*
 * GET home page.
 */

exports.createAccount = function(req, res){
  res.render('createAccount', { title: 'Express !!!!',titlename:"建立帳號" });
};