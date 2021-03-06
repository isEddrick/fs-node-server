var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Article = require('../models/article');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


//注册用户
router.post('/register', function (req, res, next) {
  User.create({
    username: req.body.username,
    password: req.body.password
  }, function (err, doc) {
    if (err) {
      res.json({
        status: 2000,
        msg: err,
        result: ''
      })
    } else {
      res.json({
        status: 1000,
        msg: '',
        result: '注册成功'
      })
    }
  })
});

//登录
router.post('/login', function (req, res, next) {
  var param = {
    username: req.body.username,
    password: req.body.password
  };
  User.findOne({username: req.body.username}, function (err, doc) {
    if (err) {
      res.json({
        status: 2000,
        msg: err,
        result: ''
      })
    } else {
      if (doc) {
        if (req.body.password == doc.password) {
          res.cookie('userId', doc._id, {
            path: '/',
            maxAge: 1000 * 60 * 60
          });
          res.json({
            status: 1000,
            msg: {
              username: doc.username,
              userId: doc._id,
              description: doc.description
            },
            result: '登录成功'
          })
        } else {
          res.json({
            status: 2000,
            msg: '密码错误',
            result: ''
          })
        }
      } else {
        res.json({
          status: 2000,
          msg: '用户不存在',
          result: ''
        })
      }
    }
  })
});

//登出
router.post('/logout', function (req, res, next) {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  });
  res.json({
    status: 1000,
    msg: '',
    result: '登出成功'
  })
});

//查询所有用户
router.get('/userList', function (req, res, next) {
  if (req.query.search_type == 'user') {
    User.find({}, function (err, doc) {
      if (err) {
        res.json({
          status: 2000,
          msg: err,
          result: 0
        })
      } else {
        if (doc) {
          res.json({
            status: 1000,
            msg: '查询成功',
            result: doc
          })
        }
      }
    })
  } else {
    res.json({
      status: 3000,
      msg: '暂不支持文章查询',
      result: '查询失败'
    })
  }
});

router.get('/getUserInfo', function (req, res, next) {
  User.findOne({_id: req.query.userId}, function (err, doc) {
    if (!err) {
      Article.aggregate(
          [
            {$match: {'userId': req.query.userId}},
            {$group: {_id: '$userId', count: {$sum: '$article_count'}}}
          ]
          , function (err1, doc1) {
            if (err1) {
              res.json({
                state: 2000,
                msg: err1,
                result: 'fail'
              });
            } else {
              if (doc1.length > 0) {
                doc._doc.count = doc1[0].count;
              } else {
                doc._doc.count = 0;
              }
              res.json({
                state: 1000,
                msg: doc,
                result: 'success'
              });
            }
          })
    } else {
      res.json({
        status: 2000,
        msg: err,
        result: ''
      })
    }
  });
});

router.get('/getColumnList', function (req, res, next) {
  User.findOne({_id: req.query.userId}, {column: 1, _id: 0}, function (err, doc) {
    if (!err) {
      res.json({
        status: 1000,
        msg: '',
        result: doc
      })
    }
  })
});

router.post('/setColumnShow', function (req, res, next) {
  var userId = req.body.userId, columnId = req.body.columnId, isShow = req.body.isShow;
  User.update({'_id': userId, 'column._id': columnId}, {'column.$.isShow': isShow}, function (err, doc) {
    if (!err) {
      res.json({
        status: 1000,
        msg: '设置成功',
        result: ''
      })
    }
  })
});

router.post('/addClassify', function (req, res, next) {
  var type = req.body.type, _id = req.body.userId;
  User.update({'_id': _id}, {
    $push: {
      classify: {
        name: type
      }
    }
  }, function (err, doc) {
    if (!err) {
      res.json({
        status: 1000,
        msg: '',
        result: '分类添加成功'
      })
    } else {
      res.json({
        status: 2000,
        msg: err.message,
        result: '分类添加失败'
      })
    }
  })
});

router.get('/getClassifyList', function (req, res, next) {
  User.findOne({_id: req.query.userId}, {classify: 1, _id: 0}, function (err, doc) {
    if (!err) {
      res.json({
        status: 1000,
        msg: '',
        result: doc.classify
      })
    } else {
      res.json({
        status: 2000,
        msg: '',
        result: ''
      })
    }
  })
});

router.post('/classifyDelete', function (req, res, next) {
  var classify_id = req.body.classify_id, userId = req.body.userId;
  User.update({'_id': userId}, {$pull: {'classify': {'_id': classify_id}}}, function (err, doc) {
    if (err) {
      res.json({
        status: 0,
        msg: err,
        result: '分类删除失败'
      })
    } else {
      res.json({
        status: 1000,
        msg: '',
        result: '分类删除成功'
      })
    }
  })
});

module.exports = router;
